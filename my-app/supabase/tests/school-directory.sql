-- Run as database owner after migrations and sample seeds. All fixtures roll back.
BEGIN;

DO $$ BEGIN
    ASSERT to_regclass('public.school_aliases') IS NULL;
    ASSERT EXISTS (SELECT 1 FROM public.schools
        WHERE normalized_name = 'university of connecticut' AND aliases @> ARRAY['uconn']);
    ASSERT NOT EXISTS (SELECT 1 FROM public.recruit_other_offers o
        LEFT JOIN public.schools s ON s.id = o.school_id WHERE s.id IS NULL);
END $$;

INSERT INTO public.schools (name, aliases) VALUES
('Alias Test University', ARRAY['  ATU ', 'atu', NULL, '', '  ', 'Alias, "Test"']);
INSERT INTO public.schools (name) VALUES ('Canonical Only Test University');

DO $$ BEGIN
    ASSERT (SELECT aliases FROM public.schools WHERE name = 'Alias Test University')
        = ARRAY['alias, "test"', 'atu'];
    ASSERT (SELECT aliases FROM public.schools WHERE name = 'Canonical Only Test University') = '{}'::text[];
    UPDATE public.schools SET aliases = ARRAY['  NEW ALIAS ', 'new alias']
        WHERE name = 'Alias Test University';
    ASSERT (SELECT aliases FROM public.schools WHERE name = 'Alias Test University') = ARRAY['new alias'];
END $$;

INSERT INTO auth.users (id) VALUES
('d5000000-0000-4000-8000-000000000001'),
('d5000000-0000-4000-8000-000000000002');
INSERT INTO public.staff_members (user_id, display_name, role) VALUES
('d5000000-0000-4000-8000-000000000001', 'Directory test coach', 'staff');

SET LOCAL ROLE anon;
DO $$ BEGIN
    BEGIN
        PERFORM aliases FROM public.schools;
        RAISE EXCEPTION 'Anonymous directory access allowed';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd5000000-0000-4000-8000-000000000002', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
    ASSERT (SELECT count(*) FROM public.schools) = 0;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd5000000-0000-4000-8000-000000000001', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
    ASSERT EXISTS (SELECT 1 FROM public.schools WHERE aliases @> ARRAY['uconn']);
    ASSERT EXISTS (SELECT 1 FROM public.schools WHERE normalized_name = 'canonical only test university');
    BEGIN
        UPDATE public.schools SET aliases = ARRAY['tampered'] WHERE name = 'Alias Test University';
        RAISE EXCEPTION 'Ordinary staff can edit the directory';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

UPDATE public.staff_members SET is_active = false
WHERE user_id = 'd5000000-0000-4000-8000-000000000001';
SET LOCAL ROLE authenticated;
DO $$ BEGIN
    ASSERT (SELECT count(*) FROM public.schools) = 0;
END $$;
RESET ROLE;

ROLLBACK;
