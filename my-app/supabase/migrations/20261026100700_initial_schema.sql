-- Hoop Harbor: initial recruiting database schema
-- Public-facing (to signed-in users) profile information is separate from private data.
-- Apply to hoop-harbor-test first. Review before applying to production.

-- 1. Player profiles: readable by signed-in users, editable only by staff/admins.
CREATE TABLE public.recruits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text NOT NULL CHECK (length(btrim(first_name)) > 0),
    last_name text NOT NULL CHECK (length(btrim(last_name)) > 0),
    preferred_name text,
    graduation_year integer CHECK (graduation_year BETWEEN 2000 AND 2100),
    positions text[] NOT NULL DEFAULT '{}'::text[],
    height_inches integer CHECK (height_inches BETWEEN 36 AND 96),
    high_school text,
    city text,
    state_country text,
    circuit text,
    age_group text,
    club_team text,
    jersey_number text, -- text preserves values such as "00"
    video_links text[] NOT NULL DEFAULT '{}'::text[],
    profile_links text[] NOT NULL DEFAULT '{}'::text[],
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Sensitive information: never exposed to ordinary signed-in users.
-- Academic information is private by default, as it may contain student records.
CREATE TABLE public.recruit_private_details (
    recruit_id uuid PRIMARY KEY REFERENCES public.recruits(id) ON DELETE CASCADE,
    recruit_email text,
    recruit_phone text,
    guardian_contacts jsonb NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(guardian_contacts) = 'array'),
    birthday date,
    academic_information text,
    extra_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Staff access is assigned by a trusted administrator, never by user signup.
CREATE TABLE public.staff_members (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('staff', 'admin')),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Return true only when the authenticated user has an approved staff/admin row.
-- SECURITY DEFINER permits this function to inspect staff_members despite RLS.
-- Create/run this migration as the database owner (e.g., via Supabase migrations).
CREATE OR REPLACE FUNCTION public.is_hoop_harbor_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.staff_members AS sm
        WHERE sm.user_id = (SELECT auth.uid())
          AND sm.role IN ('staff', 'admin')
    );
$$;

REVOKE ALL ON FUNCTION public.is_hoop_harbor_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_hoop_harbor_staff() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_hoop_harbor_staff() TO authenticated;

-- Keep updated_at accurate on edits.
CREATE OR REPLACE FUNCTION public.set_hoop_harbor_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER recruits_set_updated_at
BEFORE UPDATE ON public.recruits
FOR EACH ROW EXECUTE FUNCTION public.set_hoop_harbor_updated_at();

CREATE TRIGGER recruit_private_details_set_updated_at
BEFORE UPDATE ON public.recruit_private_details
FOR EACH ROW EXECUTE FUNCTION public.set_hoop_harbor_updated_at();

-- 4. Row Level Security: deny access unless explicitly permitted below.
ALTER TABLE public.recruits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruit_private_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Only signed-in users may read general recruit profile information.
CREATE POLICY recruits_read_signed_in
ON public.recruits FOR SELECT TO authenticated
USING (true);

-- Only approved staff/admins may create, edit, or delete recruit profiles.
CREATE POLICY recruits_insert_staff
ON public.recruits FOR INSERT TO authenticated
WITH CHECK ((SELECT public.is_hoop_harbor_staff()));

CREATE POLICY recruits_update_staff
ON public.recruits FOR UPDATE TO authenticated
USING ((SELECT public.is_hoop_harbor_staff()))
WITH CHECK ((SELECT public.is_hoop_harbor_staff()));

CREATE POLICY recruits_delete_staff
ON public.recruits FOR DELETE TO authenticated
USING ((SELECT public.is_hoop_harbor_staff()));

-- All private details require approved staff/admin access.
CREATE POLICY private_details_read_staff
ON public.recruit_private_details FOR SELECT TO authenticated
USING ((SELECT public.is_hoop_harbor_staff()));

CREATE POLICY private_details_insert_staff
ON public.recruit_private_details FOR INSERT TO authenticated
WITH CHECK ((SELECT public.is_hoop_harbor_staff()));

CREATE POLICY private_details_update_staff
ON public.recruit_private_details FOR UPDATE TO authenticated
USING ((SELECT public.is_hoop_harbor_staff()))
WITH CHECK ((SELECT public.is_hoop_harbor_staff()));

CREATE POLICY private_details_delete_staff
ON public.recruit_private_details FOR DELETE TO authenticated
USING ((SELECT public.is_hoop_harbor_staff()));

-- No client-facing policies for staff_members: only trusted database administrators
-- or backend service-role operations should manage staff membership.
REVOKE ALL ON TABLE public.staff_members FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.recruits, public.recruit_private_details FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.recruits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.recruit_private_details TO authenticated;
