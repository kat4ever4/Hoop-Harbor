-- Run as database owner after pipeline migration and sample seed. Rolls back.
BEGIN;
DO $$ BEGIN
    ASSERT (SELECT count(DISTINCT pipeline_stage) FROM public.recruits_v2 WHERE id::text LIKE 'a2000000-%') = 8;
    ASSERT (SELECT count(*) FROM public.recruit_other_offers_v2 WHERE id::text LIKE 'e3000000-%') = 75;
    ASSERT (SELECT count(*) FROM public.recruit_visits_v2 WHERE id::text LIKE 'f3000000-%') = 60;
    ASSERT (SELECT count(DISTINCT recruit_id) FROM public.recruit_pipeline_history_v2) >= 50;
    BEGIN
        UPDATE public.recruits_v2 SET pipeline_stage = 'bad stage' WHERE id = 'a2000000-0000-4000-8000-000000000001';
        RAISE EXCEPTION 'Invalid stage accepted';
    EXCEPTION WHEN check_violation THEN NULL; END;
    BEGIN
        UPDATE public.recruits_v2 SET usna_offer_date = '2026-10-01', usna_offered_by_staff_id = NULL WHERE id = 'a2000000-0000-4000-8000-000000000001';
        RAISE EXCEPTION 'Incomplete offer accepted';
    EXCEPTION WHEN check_violation THEN NULL; END;
    BEGIN
        UPDATE public.recruits_v2 SET pipeline_stage = 'priority', pipeline_changed_by_staff_id = NULL WHERE id = 'a2000000-0000-4000-8000-000000000001';
        RAISE EXCEPTION 'Unattributed change accepted';
    EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

INSERT INTO auth.users (id) VALUES ('d3000000-0000-4000-8000-000000000001'), ('d3000000-0000-4000-8000-000000000002');
UPDATE public.staff_members_v2 SET user_id = 'd3000000-0000-4000-8000-000000000001' WHERE id = 'b2000000-0000-4000-8000-000000000001';

SET LOCAL ROLE anon;
DO $$ BEGIN
    BEGIN
        PERFORM 1 FROM public.recruit_pipeline_history_v2;
        RAISE EXCEPTION 'Anonymous history access allowed';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd3000000-0000-4000-8000-000000000002', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
    ASSERT (SELECT count(*) FROM public.recruit_other_offers_v2) = 0;
    ASSERT (SELECT count(*) FROM public.recruit_visits_v2) = 0;
    ASSERT (SELECT count(*) FROM public.recruit_pipeline_history_v2) = 0;
    BEGIN
        INSERT INTO public.recruit_visits_v2 (recruit_id, visit_type, visit_date, changed_by_staff_id)
        VALUES ('a2000000-0000-4000-8000-000000000001', 'official', '2026-11-20', 'b2000000-0000-4000-8000-000000000001');
        RAISE EXCEPTION 'Nonstaff insert allowed';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

SELECT set_config('request.jwt.claim.sub', 'd3000000-0000-4000-8000-000000000001', true);
SET LOCAL ROLE authenticated;
DO $$ DECLARE history_before integer; BEGIN
    SELECT count(*) INTO history_before FROM public.recruit_pipeline_history_v2;
    -- The chosen staff member may differ from the logged-in account until F12.
    UPDATE public.recruits_v2 SET pipeline_stage = 'priority', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002'
    WHERE id = 'a2000000-0000-4000-8000-000000000001';
    ASSERT (SELECT count(*) FROM public.recruit_pipeline_history_v2) = history_before + 1;
    ASSERT EXISTS (SELECT 1 FROM public.recruit_pipeline_history_v2
        WHERE recruit_id = 'a2000000-0000-4000-8000-000000000001'
        AND after_values->>'pipeline_stage' = 'priority' AND before_values->>'pipeline_stage' = 'identified'
        AND changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002'
        AND staff_name_at_change = 'Robin Ellis' AND authenticated_user_id = auth.uid());
    UPDATE public.recruits_v2 SET usna_offer_date = '2026-11-03', usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000003',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002'
    WHERE id = 'a2000000-0000-4000-8000-000000000001';
    ASSERT (SELECT count(*) FROM public.recruit_pipeline_history_v2) = history_before + 2;
    UPDATE public.recruit_visits_v2 SET status = 'completed', changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002'
    WHERE id = 'f3000000-0000-4000-8000-000000000001';
    ASSERT EXISTS (SELECT 1 FROM public.recruit_pipeline_history_v2 WHERE record_id = 'f3000000-0000-4000-8000-000000000001'
        AND before_values->>'status' = 'planned' AND after_values->>'status' = 'completed');
    UPDATE public.recruit_other_offers_v2 SET source = 'Corrected fictional source', changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003'
    WHERE id = 'e3000000-0000-4000-8000-000000000001';
    UPDATE public.recruit_other_offers_v2 SET archived_at = now(), changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002'
    WHERE id = 'e3000000-0000-4000-8000-000000000001';
    ASSERT EXISTS (SELECT 1 FROM public.recruit_pipeline_history_v2 WHERE record_id = 'e3000000-0000-4000-8000-000000000001'
        AND after_values->>'archived_at' IS NOT NULL AND changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002');
    BEGIN
        UPDATE public.recruit_pipeline_history_v2 SET staff_name_at_change = 'Tampered';
        RAISE EXCEPTION 'History edit allowed';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN
        DELETE FROM public.recruit_visits_v2 WHERE id = 'f3000000-0000-4000-8000-000000000001';
        RAISE EXCEPTION 'Hard delete allowed';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

UPDATE public.staff_members_v2 SET is_active = false WHERE id = 'b2000000-0000-4000-8000-000000000003';
DO $$ BEGIN
    BEGIN
        UPDATE public.recruit_visits_v2 SET details = 'Rejected inactive attribution', changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003'
        WHERE id = 'f3000000-0000-4000-8000-000000000001';
        RAISE EXCEPTION 'Inactive attribution allowed';
    EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
ROLLBACK;
