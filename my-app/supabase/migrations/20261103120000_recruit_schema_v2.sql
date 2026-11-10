-- Additive replacement schema. Existing tables, data, and policies are untouched.
BEGIN;

CREATE TABLE public.staff_members_v2 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- NULL permits fictional profiles without inventing authentication accounts.
    user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    display_name text NOT NULL CHECK (length(btrim(display_name)) > 0),
    role text NOT NULL CHECK (role IN ('staff', 'admin')),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.recruits_v2 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text NOT NULL CHECK (length(btrim(first_name)) > 0),
    last_name text NOT NULL CHECK (length(btrim(last_name)) > 0),
    preferred_name text,
    birthday date,
    height_inches integer CHECK (height_inches BETWEEN 36 AND 96),
    weight_lbs numeric(5,1) CHECK (weight_lbs > 0),
    positions text[] NOT NULL DEFAULT '{}'
        CHECK (positions <@ ARRAY['PG', 'SG', 'SF', 'PF', 'C']::text[]),
    jersey_number text,
    high_school text,
    graduation_year integer CHECK (graduation_year BETWEEN 2000 AND 2100),
    gpa numeric(4,2),
    gpa_scale numeric(4,2),
    academic_information text,
    city text,
    state_country text,
    club_team text,
    circuit text,
    age_group text,
    recruit_email text,
    recruit_phone text,
    guardian_contacts jsonb NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(guardian_contacts) = 'array'),
    video_links text[] NOT NULL DEFAULT '{}',
    profile_links text[] NOT NULL DEFAULT '{}',
    medical_notes text,
    recruiting_status text NOT NULL DEFAULT 'watching'
        CHECK (recruiting_status IN ('watching', 'contacted', 'evaluating', 'offered', 'committed', 'closed')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (gpa_scale IS NULL OR gpa_scale > 0),
    CHECK (gpa IS NULL OR (gpa_scale IS NOT NULL AND gpa >= 0 AND gpa <= gpa_scale))
);

CREATE TABLE public.recruit_notes_v2 (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recruit_id uuid NOT NULL REFERENCES public.recruits_v2(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.staff_members_v2(id) ON DELETE RESTRICT,
    note_type text NOT NULL DEFAULT 'general'
        CHECK (note_type IN ('general', 'evaluation', 'interaction', 'medical')),
    title text,
    body text NOT NULL CHECK (length(btrim(body)) > 0),
    occurred_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX recruit_notes_v2_recruit_date_idx
    ON public.recruit_notes_v2 (recruit_id, occurred_at DESC, created_at DESC);
CREATE INDEX recruit_notes_v2_author_idx ON public.recruit_notes_v2 (author_id);

-- Independent helpers: existing staff access behavior is not changed.
CREATE FUNCTION public.current_staff_v2_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT id FROM public.staff_members_v2
    WHERE user_id = (SELECT auth.uid()) AND is_active;
$$;

CREATE FUNCTION public.is_staff_v2_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (SELECT 1 FROM public.staff_members_v2
        WHERE user_id = (SELECT auth.uid()) AND is_active AND role = 'admin');
$$;

REVOKE ALL ON FUNCTION public.current_staff_v2_id(), public.is_staff_v2_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_staff_v2_id(), public.is_staff_v2_admin() TO authenticated;

CREATE FUNCTION public.set_v2_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER recruits_v2_updated_at BEFORE UPDATE ON public.recruits_v2
FOR EACH ROW EXECUTE FUNCTION public.set_v2_updated_at();

-- Notes keep their original author, recruit, and creation time on edits.
CREATE FUNCTION public.protect_note_v2_identity() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
    IF NEW.author_id IS DISTINCT FROM OLD.author_id
       OR NEW.recruit_id IS DISTINCT FROM OLD.recruit_id
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'A note author, recruit, and creation time cannot be changed';
    END IF;
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER recruit_notes_v2_updated_at BEFORE UPDATE ON public.recruit_notes_v2
FOR EACH ROW EXECUTE FUNCTION public.protect_note_v2_identity();

ALTER TABLE public.staff_members_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruits_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruit_notes_v2 ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.staff_members_v2, public.recruits_v2, public.recruit_notes_v2
FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.staff_members_v2 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recruits_v2, public.recruit_notes_v2 TO authenticated;

-- Membership is managed only by trusted database administrators.
CREATE POLICY staff_v2_read ON public.staff_members_v2 FOR SELECT TO authenticated
USING ((SELECT public.current_staff_v2_id()) IS NOT NULL);

CREATE POLICY recruits_v2_read ON public.recruits_v2 FOR SELECT TO authenticated
USING ((SELECT public.current_staff_v2_id()) IS NOT NULL);
CREATE POLICY recruits_v2_insert ON public.recruits_v2 FOR INSERT TO authenticated
WITH CHECK ((SELECT public.current_staff_v2_id()) IS NOT NULL);
CREATE POLICY recruits_v2_update ON public.recruits_v2 FOR UPDATE TO authenticated
USING ((SELECT public.current_staff_v2_id()) IS NOT NULL)
WITH CHECK ((SELECT public.current_staff_v2_id()) IS NOT NULL);
-- Deleting a recruit also deletes its notes, so reserve it for admins.
CREATE POLICY recruits_v2_delete ON public.recruits_v2 FOR DELETE TO authenticated
USING ((SELECT public.is_staff_v2_admin()));

CREATE POLICY notes_v2_read ON public.recruit_notes_v2 FOR SELECT TO authenticated
USING ((SELECT public.current_staff_v2_id()) IS NOT NULL);
CREATE POLICY notes_v2_insert ON public.recruit_notes_v2 FOR INSERT TO authenticated
WITH CHECK (author_id = (SELECT public.current_staff_v2_id()));
CREATE POLICY notes_v2_update ON public.recruit_notes_v2 FOR UPDATE TO authenticated
USING (author_id = (SELECT public.current_staff_v2_id()) OR (SELECT public.is_staff_v2_admin()))
WITH CHECK (author_id = (SELECT public.current_staff_v2_id()) OR (SELECT public.is_staff_v2_admin()));
CREATE POLICY notes_v2_delete ON public.recruit_notes_v2 FOR DELETE TO authenticated
USING (author_id = (SELECT public.current_staff_v2_id()) OR (SELECT public.is_staff_v2_admin()));

COMMIT;
