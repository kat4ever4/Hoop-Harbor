-- Run as database owner AFTER all migrations (including promotion) and seeds.
-- All test accounts and changes are rolled back, including on psql disconnect.
BEGIN;

DO $$ BEGIN
    ASSERT (SELECT count(*) FROM public.recruits WHERE id::text LIKE 'a2000000-%') = 50, 'Expected 50 sample recruits';
    ASSERT (SELECT count(*) FROM public.staff_members WHERE id::text LIKE 'b2000000-%') = 5, 'Expected 5 sample staff';
    ASSERT (SELECT count(*) FROM public.recruit_notes WHERE id::text LIKE 'c2000000-%') = 150, 'Expected 150 sample notes';
    ASSERT to_regclass('public.recruits_v1') IS NOT NULL;
    ASSERT to_regclass('public.staff_members_v1') IS NOT NULL;
    ASSERT NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%\_v2');
    ASSERT (SELECT count(*) FROM public.staff_members WHERE display_name IN ('Coach A', 'Coach B') AND user_id IS NULL AND is_active) = 2;
    ASSERT NOT EXISTS (
        SELECT r.id FROM public.recruits r LEFT JOIN public.recruit_notes n ON n.recruit_id = r.id
        WHERE r.id::text LIKE 'a2000000-%' GROUP BY r.id HAVING count(n.id) <> 3
    ), 'Each sample recruit should have three notes';
    BEGIN
        INSERT INTO public.recruits (first_name, last_name, gpa, gpa_scale) VALUES ('Test', 'Invalid', 5, 4);
        RAISE EXCEPTION 'Invalid GPA was accepted';
    EXCEPTION WHEN check_violation THEN NULL; END;
    BEGIN
        INSERT INTO public.recruit_notes (recruit_id, author_id, body)
        VALUES ('a2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', ' ');
        RAISE EXCEPTION 'Blank note was accepted';
    EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

INSERT INTO auth.users (id) VALUES
('d2000000-0000-4000-8000-000000000001'),
('d2000000-0000-4000-8000-000000000002'),
('d2000000-0000-4000-8000-000000000003'),
('d2000000-0000-4000-8000-000000000004');
UPDATE public.staff_members SET user_id = 'd2000000-0000-4000-8000-000000000001' WHERE id = 'b2000000-0000-4000-8000-000000000001';
UPDATE public.staff_members SET user_id = 'd2000000-0000-4000-8000-000000000002' WHERE id = 'b2000000-0000-4000-8000-000000000002';
UPDATE public.staff_members SET user_id = 'd2000000-0000-4000-8000-000000000003', is_active = false WHERE id = 'b2000000-0000-4000-8000-000000000003';

SET LOCAL ROLE anon;
DO $$ BEGIN
    BEGIN
        PERFORM 1 FROM public.recruits;
        RAISE EXCEPTION 'Anonymous access was allowed';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000004', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
    ASSERT (SELECT count(*) FROM public.recruits) = 0, 'Nonstaff can read recruits';
    ASSERT (SELECT count(*) FROM public.recruit_notes) = 0, 'Nonstaff can read notes';
    BEGIN
        INSERT INTO public.recruits (first_name, last_name) VALUES ('Unauthorized', 'Player');
        RAISE EXCEPTION 'Nonstaff could insert';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN
        INSERT INTO public.recruit_notes (recruit_id, author_id, body)
        VALUES ('a2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', 'Nonstaff selected coach');
        RAISE EXCEPTION 'Selecting a coach bypassed staff authorization';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000003', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
    ASSERT (SELECT count(*) FROM public.recruits) = 0, 'Inactive staff can read recruits';
    ASSERT (SELECT public.current_staff_id()) IS NULL, 'Inactive membership returned';
    ASSERT NOT public.is_hoop_harbor_staff(), 'Legacy access helper accepted inactive staff';
    BEGIN
        INSERT INTO public.recruit_notes (recruit_id, author_id, body)
        VALUES ('a2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', 'Inactive account');
        RAISE EXCEPTION 'Inactive account could select a coach';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000002', true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE affected integer; automatic_author uuid; BEGIN
    ASSERT (SELECT count(*) FROM public.recruits WHERE id::text LIKE 'a2000000-%') = 50, 'Staff cannot read recruits';
    ASSERT (SELECT count(*) FROM public.recruit_notes WHERE recruit_id = 'a2000000-0000-4000-8000-000000000001') = 3, 'Recruit note lookup failed';
    ASSERT public.is_hoop_harbor_staff(), 'Legacy helper does not use promoted membership';
    BEGIN
        PERFORM 1 FROM public.recruits_v1;
        RAISE EXCEPTION 'Application can still access archived recruits';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    INSERT INTO public.recruit_notes (recruit_id, author_id, body) VALUES
    ('a2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000004', 'Selected Coach A'),
    ('a2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000005', 'Selected Coach B');
    ASSERT (SELECT count(*) FROM public.recruit_notes WHERE body IN ('Selected Coach A', 'Selected Coach B')) = 2;
    INSERT INTO public.recruit_notes (recruit_id, body)
    VALUES ('a2000000-0000-4000-8000-000000000001', 'Automatic author') RETURNING author_id INTO automatic_author;
    ASSERT automatic_author = public.current_staff_id(), 'Automatic author did not use signed-in account';
    INSERT INTO public.recruit_notes (id, recruit_id, author_id, body)
    VALUES ('e2000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', public.current_staff_id(), 'Test note');
    UPDATE public.recruit_notes SET body = 'Edited own note' WHERE id = 'e2000000-0000-4000-8000-000000000001';
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 1, 'Author cannot edit own note';
    UPDATE public.recruit_notes SET body = 'Unauthorized edit' WHERE author_id = 'b2000000-0000-4000-8000-000000000001';
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 0, 'Coach edited another author notes';
    DELETE FROM public.recruit_notes WHERE author_id = 'b2000000-0000-4000-8000-000000000001';
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 0, 'Coach deleted another author notes';
    DELETE FROM public.recruits;
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 0, 'Nonadmin could delete recruits and other coaches notes';
    BEGIN
        INSERT INTO public.recruit_notes (recruit_id, author_id, body)
        VALUES ('a2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000003', 'Inactive author');
        RAISE EXCEPTION 'Inactive author was allowed';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN
        UPDATE public.staff_members SET role = 'admin' WHERE id = public.current_staff_id();
        RAISE EXCEPTION 'Staff could elevate privileges';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000001', true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE affected integer; BEGIN
    UPDATE public.recruit_notes SET body = 'Admin edit' WHERE id = 'e2000000-0000-4000-8000-000000000001';
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 1, 'Admin cannot edit another author note';
    BEGIN
        UPDATE public.recruit_notes SET author_id = public.current_staff_id()
        WHERE id = 'e2000000-0000-4000-8000-000000000001';
        RAISE EXCEPTION 'Identity protection missing' USING ERRCODE = '23514';
    EXCEPTION WHEN raise_exception THEN NULL; END;
    -- Use a fresh untracked recruit: pipeline history intentionally prevents
    -- deleting recruits with recorded recruiting activity.
    INSERT INTO public.recruits (id, first_name, last_name)
    VALUES ('e2000000-0000-4000-8000-000000000002', 'Temporary', 'Cascade test');
    INSERT INTO public.recruit_notes (recruit_id, author_id, body)
    VALUES ('e2000000-0000-4000-8000-000000000002', public.current_staff_id(), 'Temporary note');
    DELETE FROM public.recruits WHERE id = 'e2000000-0000-4000-8000-000000000002';
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 1, 'Admin cannot delete recruit';
    ASSERT (SELECT count(*) FROM public.recruit_notes WHERE recruit_id = 'e2000000-0000-4000-8000-000000000002') = 0, 'Notes did not cascade';
END $$;
RESET ROLE;
ROLLBACK;
