-- Promote the replacement schema atomically; retain the original data as v1.
-- Deploy the matching application immediately after applying this migration.
BEGIN;

ALTER TABLE public.recruits RENAME TO recruits_v1;
ALTER TABLE public.staff_members RENAME TO staff_members_v1;
ALTER TABLE public.recruits_v2 RENAME TO recruits;
ALTER TABLE public.staff_members_v2 RENAME TO staff_members;
ALTER TABLE public.recruit_notes_v2 RENAME TO recruit_notes;
ALTER TABLE public.recruit_other_offers_v2 RENAME TO recruit_other_offers;
ALTER TABLE public.recruit_visits_v2 RENAME TO recruit_visits;
ALTER TABLE public.recruit_pipeline_history_v2 RENAME TO recruit_pipeline_history;

-- Preserve existing approved accounts without overriding newer roles or inactive flags.
INSERT INTO public.staff_members (user_id, display_name, role, created_at)
SELECT old.user_id,
    COALESCE(NULLIF(btrim(u.raw_user_meta_data->>'full_name'), ''),
             NULLIF(btrim(u.raw_user_meta_data->>'name'), ''),
             NULLIF(split_part(u.email, '@', 1), ''), 'Staff member'),
    old.role, old.created_at
FROM public.staff_members_v1 old JOIN auth.users u ON u.id = old.user_id
ON CONFLICT (user_id) DO NOTHING;

-- Fictional attribution profiles: no login accounts or passwords.
INSERT INTO public.staff_members (id, display_name, role) VALUES
('b2000000-0000-4000-8000-000000000004', 'Coach A', 'staff'),
('b2000000-0000-4000-8000-000000000005', 'Coach B', 'staff')
ON CONFLICT (id) DO NOTHING;

-- Archived records remain available to administrators, not application clients.
REVOKE ALL ON public.recruits_v1, public.staff_members_v1 FROM PUBLIC, anon, authenticated;

-- Renaming functions preserves policy/trigger dependencies. SQL function bodies
-- and trigger table-name comparisons must also be updated explicitly.
ALTER FUNCTION public.current_staff_v2_id() RENAME TO current_staff_id;
ALTER FUNCTION public.is_staff_v2_admin() RENAME TO is_staff_admin;
ALTER FUNCTION public.set_v2_updated_at() RENAME TO set_recruit_updated_at;
ALTER FUNCTION public.protect_note_v2_identity() RENAME TO protect_note_identity;
ALTER FUNCTION public.record_recruit_pipeline_change_v2() RENAME TO record_recruit_pipeline_change;

CREATE OR REPLACE FUNCTION public.current_staff_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT id FROM public.staff_members
    WHERE user_id = (SELECT auth.uid()) AND is_active;
$$;

CREATE OR REPLACE FUNCTION public.is_staff_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (SELECT 1 FROM public.staff_members
        WHERE user_id = (SELECT auth.uid()) AND is_active AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_hoop_harbor_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT public.current_staff_id() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.record_recruit_pipeline_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    before_data jsonb;
    after_data jsonb;
    actor_id uuid;
    actor_name text;
    player_id uuid;
    kind text;
BEGIN
    IF TG_TABLE_NAME = 'recruits' THEN
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
        kind := CASE TG_TABLE_NAME WHEN 'recruit_visits' THEN 'visit' ELSE 'other_offer' END;
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

    SELECT display_name INTO actor_name FROM public.staff_members WHERE id = actor_id AND is_active;
    IF actor_name IS NULL THEN
        RAISE EXCEPTION 'Choose an active staff member for this change' USING ERRCODE = '23514';
    END IF;

    INSERT INTO public.recruit_pipeline_history
        (recruit_id, entity_type, record_id, action, changed_by_staff_id,
         staff_name_at_change, authenticated_user_id, before_values, after_values)
    VALUES (player_id, kind, NEW.id, CASE TG_OP WHEN 'INSERT' THEN 'created' ELSE 'updated' END,
        actor_id, actor_name, auth.uid(), before_data, after_data);
    RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.record_recruit_pipeline_change() FROM PUBLIC, anon, authenticated;

-- Omitting author_id selects the signed-in staff profile automatically.
-- Explicit attribution may select any active profile, including fictional coaches.
ALTER TABLE public.recruit_notes ALTER COLUMN author_id SET DEFAULT public.current_staff_id();
DROP POLICY notes_v2_insert ON public.recruit_notes;
CREATE POLICY notes_insert ON public.recruit_notes FOR INSERT TO authenticated
WITH CHECK (
    (SELECT public.current_staff_id()) IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.staff_members s WHERE s.id = author_id AND s.is_active)
);
-- Existing author/admin edit/delete policies and immutable note identity remain.


-- Post-promotion F3/F4 function updates

CREATE OR REPLACE FUNCTION public.set_recruit_stage(
    p_recruit_id uuid,
    p_stage text,
    p_staff_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_current_stage text;
BEGIN
    -- Require a signed-in, active staff account.
    IF auth.uid() IS NULL
       OR public.current_staff_id() IS NULL THEN
        RAISE EXCEPTION 'Only authenticated staff can change recruit stages'
            USING ERRCODE = '42501';
    END IF;

    -- Validate the requested stage.
    IF p_stage IS NULL OR p_stage NOT IN (
        'identified',
        'evaluating',
        'priority',
        'offered',
        'committed_to_usna',
        'committed_elsewhere',
        'not_pursuing',
        'to_be_confirmed'
    ) THEN
        RAISE EXCEPTION 'Invalid recruiting stage'
            USING ERRCODE = '22023';
    END IF;

    -- Validate the selected coach.
    IF NOT EXISTS (
        SELECT 1
        FROM public.staff_members
        WHERE id = p_staff_id
          AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Select a valid active staff member'
            USING ERRCODE = '22023';
    END IF;

    -- Lock the recruit to prevent concurrent stage changes
    -- from interfering with each other.
    SELECT pipeline_stage
    INTO v_current_stage
    FROM public.recruits
    WHERE id = p_recruit_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recruit not found or access denied'
            USING ERRCODE = 'P0002';
    END IF;

    -- Avoid creating a history event if nothing changed.
    IF v_current_stage IS DISTINCT FROM p_stage THEN
        UPDATE public.recruits
        SET
            pipeline_stage = p_stage,
            pipeline_changed_by_staff_id = p_staff_id
        WHERE id = p_recruit_id;
    END IF;

    -- The existing AFTER UPDATE trigger automatically inserts
    -- into recruit_pipeline_history in the same transaction.

    RETURN p_recruit_id;
END;
$$;

-- Only authenticated users may invoke this RPC.
-- The function and RLS policies enforce staff membership.
REVOKE ALL ON FUNCTION public.set_recruit_stage(uuid, text, uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.set_recruit_stage(uuid, text, uuid)
TO authenticated;

CREATE OR REPLACE FUNCTION public.find_possible_duplicates(
    p_first text,
    p_last text,
    p_grad_year integer,
    p_school text,
    p_club text
)
RETURNS SETOF public.recruits
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT r.*
    FROM public.recruits AS r
    WHERE
        -- Must have the same last name
        lower(btrim(r.last_name)) = lower(btrim(p_last))

        -- Must have the same graduation year
        AND r.graduation_year = p_grad_year

        -- At least one of these must match
        AND (
            -- Similar first name
            (
                p_first IS NOT NULL
                AND r.first_name IS NOT NULL
                AND extensions.levenshtein(
                    lower(btrim(r.first_name)),
                    lower(btrim(p_first))
                ) <= 2
            )

            OR

            -- Same high school
            (
                NULLIF(btrim(p_school), '') IS NOT NULL
                AND lower(btrim(r.high_school)) =
                    lower(btrim(p_school))
            )

            OR

            -- Same club team
            (
                NULLIF(btrim(p_club), '') IS NOT NULL
                AND lower(btrim(r.club_team)) =
                    lower(btrim(p_club))
            )
        );
$$;

NOTIFY pgrst, 'reload schema';
COMMIT;
