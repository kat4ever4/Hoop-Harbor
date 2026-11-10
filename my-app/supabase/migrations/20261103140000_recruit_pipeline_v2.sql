-- Pipeline, offers, visits, and attributed history for v2 only.
BEGIN;

ALTER TABLE public.recruits_v2
    ADD COLUMN pipeline_stage text NOT NULL DEFAULT 'to_be_confirmed'
        CHECK (pipeline_stage IN ('identified', 'evaluating', 'priority', 'offered',
            'committed_to_usna', 'committed_elsewhere', 'not_pursuing', 'to_be_confirmed')),
    ADD COLUMN usna_offer_date date,
    ADD COLUMN usna_offered_by_staff_id uuid REFERENCES public.staff_members_v2(id) ON DELETE RESTRICT,
    ADD COLUMN pipeline_changed_by_staff_id uuid REFERENCES public.staff_members_v2(id) ON DELETE RESTRICT,
    ADD CONSTRAINT usna_offer_details_together CHECK (
        (usna_offer_date IS NULL) = (usna_offered_by_staff_id IS NULL));

CREATE TABLE public.recruit_other_offers_v2 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recruit_id uuid NOT NULL REFERENCES public.recruits_v2(id) ON DELETE RESTRICT,
    school text NOT NULL CHECK (length(btrim(school)) > 0),
    date_learned date NOT NULL,
    source text NOT NULL CHECK (length(btrim(source)) > 0),
    changed_by_staff_id uuid NOT NULL REFERENCES public.staff_members_v2(id) ON DELETE RESTRICT,
    archived_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.recruit_visits_v2 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recruit_id uuid NOT NULL REFERENCES public.recruits_v2(id) ON DELETE RESTRICT,
    visit_type text NOT NULL CHECK (visit_type IN ('official', 'unofficial', 'campus_tour', 'home', 'school', 'other')),
    visit_date date NOT NULL,
    status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'completed')),
    details text,
    changed_by_staff_id uuid NOT NULL REFERENCES public.staff_members_v2(id) ON DELETE RESTRICT,
    archived_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.recruit_pipeline_history_v2 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recruit_id uuid NOT NULL REFERENCES public.recruits_v2(id) ON DELETE RESTRICT,
    entity_type text NOT NULL CHECK (entity_type IN ('pipeline', 'other_offer', 'visit')),
    record_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('created', 'updated')),
    changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    changed_by_staff_id uuid NOT NULL REFERENCES public.staff_members_v2(id) ON DELETE RESTRICT,
    staff_name_at_change text NOT NULL,
    authenticated_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    before_values jsonb,
    after_values jsonb NOT NULL
);

CREATE INDEX other_offers_v2_recruit_idx ON public.recruit_other_offers_v2 (recruit_id, date_learned DESC);
CREATE INDEX visits_v2_recruit_idx ON public.recruit_visits_v2 (recruit_id, visit_date DESC);
CREATE INDEX pipeline_history_v2_recruit_idx ON public.recruit_pipeline_history_v2 (recruit_id, changed_at DESC);

-- Clients select an active staff profile until F12. This attribution does not
-- authenticate that person; existing login/staff RLS remains required.
CREATE FUNCTION public.record_recruit_pipeline_change_v2() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    before_data jsonb;
    after_data jsonb;
    actor_id uuid;
    actor_name text;
    player_id uuid;
    kind text;
BEGIN
    IF TG_TABLE_NAME = 'recruits_v2' THEN
        kind := 'pipeline';
        player_id := NEW.id;
        actor_id := NEW.pipeline_changed_by_staff_id;
        after_data := jsonb_build_object('pipeline_stage', NEW.pipeline_stage,
            'usna_offer_date', NEW.usna_offer_date, 'usna_offered_by_staff_id', NEW.usna_offered_by_staff_id);
        IF TG_OP = 'UPDATE' THEN
            before_data := jsonb_build_object('pipeline_stage', OLD.pipeline_stage,
                'usna_offer_date', OLD.usna_offer_date, 'usna_offered_by_staff_id', OLD.usna_offered_by_staff_id);
            IF before_data = after_data THEN RETURN NEW; END IF;
        -- Unassigned profiles have no attributed pipeline event yet.
        ELSIF actor_id IS NULL AND NEW.pipeline_stage = 'to_be_confirmed' AND NEW.usna_offer_date IS NULL THEN
            RETURN NEW;
        END IF;
    ELSE
        kind := CASE TG_TABLE_NAME WHEN 'recruit_visits_v2' THEN 'visit' ELSE 'other_offer' END;
        player_id := NEW.recruit_id;
        actor_id := NEW.changed_by_staff_id;
        after_data := to_jsonb(NEW) - ARRAY['updated_at', 'changed_by_staff_id'];
        IF TG_OP = 'UPDATE' THEN
            IF NEW.id <> OLD.id OR NEW.recruit_id <> OLD.recruit_id OR NEW.created_at <> OLD.created_at THEN
                RAISE EXCEPTION 'Record identity and creation time cannot be changed';
            END IF;
            before_data := to_jsonb(OLD) - ARRAY['updated_at', 'changed_by_staff_id'];
            IF before_data = after_data THEN RETURN NEW; END IF;
        END IF;
    END IF;

    SELECT display_name INTO actor_name FROM public.staff_members_v2 WHERE id = actor_id AND is_active;
    IF actor_name IS NULL THEN
        RAISE EXCEPTION 'Choose an active staff member for this change' USING ERRCODE = '23514';
    END IF;

    INSERT INTO public.recruit_pipeline_history_v2
        (recruit_id, entity_type, record_id, action, changed_by_staff_id,
         staff_name_at_change, authenticated_user_id, before_values, after_values)
    VALUES (player_id, kind, NEW.id, CASE TG_OP WHEN 'INSERT' THEN 'created' ELSE 'updated' END,
        actor_id, actor_name, auth.uid(), before_data, after_data);
    RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.record_recruit_pipeline_change_v2() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER recruits_v2_pipeline_history AFTER INSERT OR UPDATE ON public.recruits_v2
FOR EACH ROW EXECUTE FUNCTION public.record_recruit_pipeline_change_v2();
CREATE TRIGGER other_offers_v2_history AFTER INSERT OR UPDATE ON public.recruit_other_offers_v2
FOR EACH ROW EXECUTE FUNCTION public.record_recruit_pipeline_change_v2();
CREATE TRIGGER visits_v2_history AFTER INSERT OR UPDATE ON public.recruit_visits_v2
FOR EACH ROW EXECUTE FUNCTION public.record_recruit_pipeline_change_v2();
CREATE TRIGGER other_offers_v2_updated_at BEFORE UPDATE ON public.recruit_other_offers_v2
FOR EACH ROW EXECUTE FUNCTION public.set_v2_updated_at();
CREATE TRIGGER visits_v2_updated_at BEFORE UPDATE ON public.recruit_visits_v2
FOR EACH ROW EXECUTE FUNCTION public.set_v2_updated_at();

ALTER TABLE public.recruit_other_offers_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruit_visits_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruit_pipeline_history_v2 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.recruit_other_offers_v2, public.recruit_visits_v2, public.recruit_pipeline_history_v2
FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.recruit_other_offers_v2, public.recruit_visits_v2 TO authenticated;
GRANT SELECT ON public.recruit_pipeline_history_v2 TO authenticated;

CREATE POLICY other_offers_v2_read ON public.recruit_other_offers_v2 FOR SELECT TO authenticated
USING ((SELECT public.current_staff_v2_id()) IS NOT NULL);
CREATE POLICY other_offers_v2_insert ON public.recruit_other_offers_v2 FOR INSERT TO authenticated
WITH CHECK ((SELECT public.current_staff_v2_id()) IS NOT NULL);
CREATE POLICY other_offers_v2_update ON public.recruit_other_offers_v2 FOR UPDATE TO authenticated
USING ((SELECT public.current_staff_v2_id()) IS NOT NULL)
WITH CHECK ((SELECT public.current_staff_v2_id()) IS NOT NULL);
CREATE POLICY visits_v2_read ON public.recruit_visits_v2 FOR SELECT TO authenticated
USING ((SELECT public.current_staff_v2_id()) IS NOT NULL);
CREATE POLICY visits_v2_insert ON public.recruit_visits_v2 FOR INSERT TO authenticated
WITH CHECK ((SELECT public.current_staff_v2_id()) IS NOT NULL);
CREATE POLICY visits_v2_update ON public.recruit_visits_v2 FOR UPDATE TO authenticated
USING ((SELECT public.current_staff_v2_id()) IS NOT NULL)
WITH CHECK ((SELECT public.current_staff_v2_id()) IS NOT NULL);
CREATE POLICY pipeline_history_v2_read ON public.recruit_pipeline_history_v2 FOR SELECT TO authenticated
USING ((SELECT public.current_staff_v2_id()) IS NOT NULL);

COMMIT;
