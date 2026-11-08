-- Run as database owner AFTER the v2 migration and seed-v2.sql.
-- All test accounts and changes are rolled back, including on psql disconnect.
BEGIN;

DO $$ BEGIN
    ASSERT (SELECT count(*) FROM public.recruits_v2 WHERE id::text LIKE 'a2000000-%') = 50, 'Expected 50 sample recruits';
    ASSERT (SELECT count(*) FROM public.staff_members_v2 WHERE id::text LIKE 'b2000000-%') = 3, 'Expected 3 sample staff';
    ASSERT (SELECT count(*) FROM public.recruit_notes_v2 WHERE id::text LIKE 'c2000000-%') = 150, 'Expected 150 sample notes';
    ASSERT NOT EXISTS (
        SELECT r.id FROM public.recruits_v2 r LEFT JOIN public.recruit_notes_v2 n ON n.recruit_id = r.id
        WHERE r.id::text LIKE 'a2000000-%' GROUP BY r.id HAVING count(n.id) <> 3
    ), 'Each sample recruit should have three notes';
    BEGIN
        INSERT INTO public.recruits_v2 (first_name, last_name, gpa, gpa_scale) VALUES ('Test', 'Invalid', 5, 4);
        RAISE EXCEPTION 'Invalid GPA was accepted';
    EXCEPTION WHEN check_violation THEN NULL; END;
    BEGIN
        INSERT INTO public.recruit_notes_v2 (recruit_id, author_id, body)
        VALUES ('a2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', ' ');
        RAISE EXCEPTION 'Blank note was accepted';
    EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

INSERT INTO auth.users (id) VALUES
('d2000000-0000-4000-8000-000000000001'),
('d2000000-0000-4000-8000-000000000002'),
('d2000000-0000-4000-8000-000000000003'),
('d2000000-0000-4000-8000-000000000004');
UPDATE public.staff_members_v2 SET user_id = 'd2000000-0000-4000-8000-000000000001' WHERE id = 'b2000000-0000-4000-8000-000000000001';
UPDATE public.staff_members_v2 SET user_id = 'd2000000-0000-4000-8000-000000000002' WHERE id = 'b2000000-0000-4000-8000-000000000002';
UPDATE public.staff_members_v2 SET user_id = 'd2000000-0000-4000-8000-000000000003', is_active = false WHERE id = 'b2000000-0000-4000-8000-000000000003';

SET LOCAL ROLE anon;
DO $$ BEGIN
    BEGIN
        PERFORM 1 FROM public.recruits_v2;
        RAISE EXCEPTION 'Anonymous access was allowed';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000004', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
    ASSERT (SELECT count(*) FROM public.recruits_v2) = 0, 'Nonstaff can read recruits';
    ASSERT (SELECT count(*) FROM public.recruit_notes_v2) = 0, 'Nonstaff can read notes';
    BEGIN
        INSERT INTO public.recruits_v2 (first_name, last_name) VALUES ('Unauthorized', 'Player');
        RAISE EXCEPTION 'Nonstaff could insert';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000003', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
    ASSERT (SELECT count(*) FROM public.recruits_v2) = 0, 'Inactive staff can read recruits';
    ASSERT (SELECT public.current_staff_v2_id()) IS NULL, 'Inactive membership returned';
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000002', true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE affected integer; BEGIN
    ASSERT (SELECT count(*) FROM public.recruits_v2 WHERE id::text LIKE 'a2000000-%') = 50, 'Staff cannot read recruits';
    ASSERT (SELECT count(*) FROM public.recruit_notes_v2 WHERE recruit_id = 'a2000000-0000-4000-8000-000000000001') = 3, 'Recruit note lookup failed';
    INSERT INTO public.recruit_notes_v2 (id, recruit_id, author_id, body)
    VALUES ('e2000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', public.current_staff_v2_id(), 'Test note');
    UPDATE public.recruit_notes_v2 SET body = 'Edited own note' WHERE id = 'e2000000-0000-4000-8000-000000000001';
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 1, 'Author cannot edit own note';
    UPDATE public.recruit_notes_v2 SET body = 'Unauthorized edit' WHERE author_id = 'b2000000-0000-4000-8000-000000000001';
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 0, 'Coach edited another author notes';
    DELETE FROM public.recruit_notes_v2 WHERE author_id = 'b2000000-0000-4000-8000-000000000001';
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 0, 'Coach deleted another author notes';
    DELETE FROM public.recruits_v2;
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 0, 'Nonadmin could delete recruits and other coaches notes';
    BEGIN
        INSERT INTO public.recruit_notes_v2 (recruit_id, author_id, body)
        VALUES ('a2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'Forged author');
        RAISE EXCEPTION 'Author spoofing was allowed';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN
        UPDATE public.staff_members_v2 SET role = 'admin' WHERE id = public.current_staff_v2_id();
        RAISE EXCEPTION 'Staff could elevate privileges';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd2000000-0000-4000-8000-000000000001', true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE affected integer; BEGIN
    UPDATE public.recruit_notes_v2 SET body = 'Admin edit' WHERE id = 'e2000000-0000-4000-8000-000000000001';
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 1, 'Admin cannot edit another author note';
    BEGIN
        UPDATE public.recruit_notes_v2 SET author_id = public.current_staff_v2_id()
        WHERE id = 'e2000000-0000-4000-8000-000000000001';
        RAISE EXCEPTION 'Identity protection missing' USING ERRCODE = '23514';
    EXCEPTION WHEN raise_exception THEN NULL; END;
    -- Use a fresh untracked recruit: pipeline history intentionally prevents
    -- deleting recruits with recorded recruiting activity.
    INSERT INTO public.recruits_v2 (id, first_name, last_name)
    VALUES ('e2000000-0000-4000-8000-000000000002', 'Temporary', 'Cascade test');
    INSERT INTO public.recruit_notes_v2 (recruit_id, author_id, body)
    VALUES ('e2000000-0000-4000-8000-000000000002', public.current_staff_v2_id(), 'Temporary note');
    DELETE FROM public.recruits_v2 WHERE id = 'e2000000-0000-4000-8000-000000000002';
    GET DIAGNOSTICS affected = ROW_COUNT;
    ASSERT affected = 1, 'Admin cannot delete recruit';
    ASSERT (SELECT count(*) FROM public.recruit_notes_v2 WHERE recruit_id = 'e2000000-0000-4000-8000-000000000002') = 0, 'Notes did not cascade';
END $$;
RESET ROLE;
ROLLBACK;
