-- Fictional recruiting activity for the 50 v2 sample players only.

-- No actual offers or visits are represented. Replays preserve existing edits.

BEGIN;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000001' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000001';
    UPDATE public.recruits SET pipeline_stage = 'identified',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000001';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000002' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000002';
    UPDATE public.recruits SET pipeline_stage = 'evaluating',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000002';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000003' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000003';
    UPDATE public.recruits SET pipeline_stage = 'priority',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000003';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000004' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000004';
    UPDATE public.recruits SET pipeline_stage = 'offered',
        usna_offer_date = '2026-10-14',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000001',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000004';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000005' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000005';
    UPDATE public.recruits SET pipeline_stage = 'committed_to_usna',
        usna_offer_date = '2026-10-15',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000002',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000005';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000006' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000006';
    UPDATE public.recruits SET pipeline_stage = 'committed_elsewhere',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000006';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000007' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000007';
    UPDATE public.recruits SET pipeline_stage = 'not_pursuing',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000007';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000008' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000008';
    UPDATE public.recruits SET pipeline_stage = 'to_be_confirmed',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000008';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000009' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000009';
    UPDATE public.recruits SET pipeline_stage = 'identified',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000009';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000010' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000010';
    UPDATE public.recruits SET pipeline_stage = 'evaluating',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000010';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000011' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000011';
    UPDATE public.recruits SET pipeline_stage = 'priority',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000011';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000012' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000012';
    UPDATE public.recruits SET pipeline_stage = 'offered',
        usna_offer_date = '2026-10-22',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000003',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000012';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000013' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000013';
    UPDATE public.recruits SET pipeline_stage = 'committed_to_usna',
        usna_offer_date = '2026-10-23',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000001',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000013';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000014' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000014';
    UPDATE public.recruits SET pipeline_stage = 'committed_elsewhere',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000014';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000015' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000015';
    UPDATE public.recruits SET pipeline_stage = 'not_pursuing',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000015';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000016' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000016';
    UPDATE public.recruits SET pipeline_stage = 'to_be_confirmed',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000016';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000017' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000017';
    UPDATE public.recruits SET pipeline_stage = 'identified',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000017';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000018' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000018';
    UPDATE public.recruits SET pipeline_stage = 'evaluating',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000018';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000019' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000019';
    UPDATE public.recruits SET pipeline_stage = 'priority',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000019';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000020' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000020';
    UPDATE public.recruits SET pipeline_stage = 'offered',
        usna_offer_date = '2026-10-15',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000002',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000020';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000021' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000021';
    UPDATE public.recruits SET pipeline_stage = 'committed_to_usna',
        usna_offer_date = '2026-10-16',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000003',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000021';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000022' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000022';
    UPDATE public.recruits SET pipeline_stage = 'committed_elsewhere',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000022';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000023' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000023';
    UPDATE public.recruits SET pipeline_stage = 'not_pursuing',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000023';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000024' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000024';
    UPDATE public.recruits SET pipeline_stage = 'to_be_confirmed',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000024';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000025' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000025';
    UPDATE public.recruits SET pipeline_stage = 'identified',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000025';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000026' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000026';
    UPDATE public.recruits SET pipeline_stage = 'evaluating',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000026';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000027' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000027';
    UPDATE public.recruits SET pipeline_stage = 'priority',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000027';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000028' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000028';
    UPDATE public.recruits SET pipeline_stage = 'offered',
        usna_offer_date = '2026-10-23',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000001',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000028';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000029' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000029';
    UPDATE public.recruits SET pipeline_stage = 'committed_to_usna',
        usna_offer_date = '2026-10-24',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000002',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000029';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000030' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000030';
    UPDATE public.recruits SET pipeline_stage = 'committed_elsewhere',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000030';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000031' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000031';
    UPDATE public.recruits SET pipeline_stage = 'not_pursuing',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000031';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000032' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000032';
    UPDATE public.recruits SET pipeline_stage = 'to_be_confirmed',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000032';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000033' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000033';
    UPDATE public.recruits SET pipeline_stage = 'identified',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000033';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000034' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000034';
    UPDATE public.recruits SET pipeline_stage = 'evaluating',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000034';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000035' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000035';
    UPDATE public.recruits SET pipeline_stage = 'priority',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000035';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000036' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000036';
    UPDATE public.recruits SET pipeline_stage = 'offered',
        usna_offer_date = '2026-10-16',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000003',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000036';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000037' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000037';
    UPDATE public.recruits SET pipeline_stage = 'committed_to_usna',
        usna_offer_date = '2026-10-17',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000001',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000037';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000038' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000038';
    UPDATE public.recruits SET pipeline_stage = 'committed_elsewhere',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000038';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000039' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000039';
    UPDATE public.recruits SET pipeline_stage = 'not_pursuing',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000039';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000040' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000040';
    UPDATE public.recruits SET pipeline_stage = 'to_be_confirmed',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000040';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000041' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000041';
    UPDATE public.recruits SET pipeline_stage = 'identified',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000041';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000042' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000042';
    UPDATE public.recruits SET pipeline_stage = 'evaluating',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000042';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000043' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000043';
    UPDATE public.recruits SET pipeline_stage = 'priority',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000043';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000044' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000044';
    UPDATE public.recruits SET pipeline_stage = 'offered',
        usna_offer_date = '2026-10-24',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000002',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000044';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000045' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000045';
    UPDATE public.recruits SET pipeline_stage = 'committed_to_usna',
        usna_offer_date = '2026-10-10',
        usna_offered_by_staff_id = 'b2000000-0000-4000-8000-000000000003',
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000045';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000046' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000046';
    UPDATE public.recruits SET pipeline_stage = 'committed_elsewhere',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000046';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000047' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000047';
    UPDATE public.recruits SET pipeline_stage = 'not_pursuing',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000047';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000048' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000048';
    UPDATE public.recruits SET pipeline_stage = 'to_be_confirmed',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000003' WHERE id = 'a2000000-0000-4000-8000-000000000048';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000049' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000049';
    UPDATE public.recruits SET pipeline_stage = 'identified',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000001' WHERE id = 'a2000000-0000-4000-8000-000000000049';
END IF;
END $$;

DO $$ BEGIN
IF EXISTS (SELECT 1 FROM public.recruits WHERE id = 'a2000000-0000-4000-8000-000000000050' AND pipeline_changed_by_staff_id IS NULL) THEN
    UPDATE public.recruits SET pipeline_stage = 'identified', pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000050';
    UPDATE public.recruits SET pipeline_stage = 'evaluating',
        usna_offer_date = NULL,
        usna_offered_by_staff_id = NULL,
        pipeline_changed_by_staff_id = 'b2000000-0000-4000-8000-000000000002' WHERE id = 'a2000000-0000-4000-8000-000000000050';
END IF;
END $$;

INSERT INTO public.recruit_other_offers (id, recruit_id, school, date_learned, source, changed_by_staff_id, school_id)
SELECT sample.id::uuid, sample.recruit_id::uuid, sample.school,
    sample.date_learned::date, sample.source, sample.changed_by_staff_id::uuid,
    (SELECT id FROM public.schools WHERE normalized_name = lower(btrim(sample.school)))
FROM (VALUES

('e3000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'Colgate University', '2026-10-02', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000002', 'Lehigh University', '2026-10-03', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000003', 'Lafayette College', '2026-10-04', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000004', 'a2000000-0000-4000-8000-000000000004', 'Boston University', '2026-10-05', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000005', 'a2000000-0000-4000-8000-000000000005', 'American University', '2026-10-06', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000006', 'a2000000-0000-4000-8000-000000000006', 'Bucknell University', '2026-10-07', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000007', 'a2000000-0000-4000-8000-000000000007', 'Colgate University', '2026-10-08', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000008', 'a2000000-0000-4000-8000-000000000008', 'Lehigh University', '2026-10-09', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000009', 'a2000000-0000-4000-8000-000000000009', 'Lafayette College', '2026-10-10', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000010', 'a2000000-0000-4000-8000-000000000010', 'Boston University', '2026-10-11', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000011', 'a2000000-0000-4000-8000-000000000011', 'American University', '2026-10-12', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000012', 'a2000000-0000-4000-8000-000000000012', 'Bucknell University', '2026-10-13', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000013', 'a2000000-0000-4000-8000-000000000013', 'Colgate University', '2026-10-14', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000014', 'a2000000-0000-4000-8000-000000000014', 'Lehigh University', '2026-10-15', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000015', 'a2000000-0000-4000-8000-000000000015', 'Lafayette College', '2026-10-16', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000016', 'a2000000-0000-4000-8000-000000000016', 'Boston University', '2026-10-17', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000017', 'a2000000-0000-4000-8000-000000000017', 'American University', '2026-10-18', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000018', 'a2000000-0000-4000-8000-000000000018', 'Bucknell University', '2026-10-19', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000019', 'a2000000-0000-4000-8000-000000000019', 'Colgate University', '2026-10-20', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000020', 'a2000000-0000-4000-8000-000000000020', 'Lehigh University', '2026-10-21', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000021', 'a2000000-0000-4000-8000-000000000021', 'Lafayette College', '2026-10-22', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000022', 'a2000000-0000-4000-8000-000000000022', 'Boston University', '2026-10-23', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000023', 'a2000000-0000-4000-8000-000000000023', 'American University', '2026-10-24', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000024', 'a2000000-0000-4000-8000-000000000024', 'Bucknell University', '2026-10-25', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000025', 'a2000000-0000-4000-8000-000000000025', 'Colgate University', '2026-10-26', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000026', 'a2000000-0000-4000-8000-000000000026', 'Lehigh University', '2026-10-27', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000027', 'a2000000-0000-4000-8000-000000000027', 'Lafayette College', '2026-10-28', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000028', 'a2000000-0000-4000-8000-000000000028', 'Boston University', '2026-10-01', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000029', 'a2000000-0000-4000-8000-000000000029', 'American University', '2026-10-02', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000030', 'a2000000-0000-4000-8000-000000000030', 'Bucknell University', '2026-10-03', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000031', 'a2000000-0000-4000-8000-000000000031', 'Colgate University', '2026-10-04', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000032', 'a2000000-0000-4000-8000-000000000032', 'Lehigh University', '2026-10-05', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000033', 'a2000000-0000-4000-8000-000000000033', 'Lafayette College', '2026-10-06', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000034', 'a2000000-0000-4000-8000-000000000034', 'Boston University', '2026-10-07', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000035', 'a2000000-0000-4000-8000-000000000035', 'American University', '2026-10-08', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000036', 'a2000000-0000-4000-8000-000000000036', 'Bucknell University', '2026-10-09', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000037', 'a2000000-0000-4000-8000-000000000037', 'Colgate University', '2026-10-10', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000038', 'a2000000-0000-4000-8000-000000000038', 'Lehigh University', '2026-10-11', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000039', 'a2000000-0000-4000-8000-000000000039', 'Lafayette College', '2026-10-12', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000040', 'a2000000-0000-4000-8000-000000000040', 'Boston University', '2026-10-13', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000041', 'a2000000-0000-4000-8000-000000000041', 'American University', '2026-10-14', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000042', 'a2000000-0000-4000-8000-000000000042', 'Bucknell University', '2026-10-15', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000043', 'a2000000-0000-4000-8000-000000000043', 'Colgate University', '2026-10-16', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000044', 'a2000000-0000-4000-8000-000000000044', 'Lehigh University', '2026-10-17', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000045', 'a2000000-0000-4000-8000-000000000045', 'Lafayette College', '2026-10-18', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000046', 'a2000000-0000-4000-8000-000000000046', 'Boston University', '2026-10-19', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000047', 'a2000000-0000-4000-8000-000000000047', 'American University', '2026-10-20', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000048', 'a2000000-0000-4000-8000-000000000048', 'Bucknell University', '2026-10-21', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000049', 'a2000000-0000-4000-8000-000000000049', 'Colgate University', '2026-10-22', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000050', 'a2000000-0000-4000-8000-000000000050', 'Lehigh University', '2026-10-23', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000051', 'a2000000-0000-4000-8000-000000000001', 'Lafayette College', '2026-10-24', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000052', 'a2000000-0000-4000-8000-000000000002', 'Boston University', '2026-10-25', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000053', 'a2000000-0000-4000-8000-000000000003', 'American University', '2026-10-26', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000054', 'a2000000-0000-4000-8000-000000000004', 'Bucknell University', '2026-10-27', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000055', 'a2000000-0000-4000-8000-000000000005', 'Colgate University', '2026-10-28', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000056', 'a2000000-0000-4000-8000-000000000006', 'Lehigh University', '2026-10-01', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000057', 'a2000000-0000-4000-8000-000000000007', 'Lafayette College', '2026-10-02', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000058', 'a2000000-0000-4000-8000-000000000008', 'Boston University', '2026-10-03', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000059', 'a2000000-0000-4000-8000-000000000009', 'American University', '2026-10-04', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000060', 'a2000000-0000-4000-8000-000000000010', 'Bucknell University', '2026-10-05', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000061', 'a2000000-0000-4000-8000-000000000011', 'Colgate University', '2026-10-06', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000062', 'a2000000-0000-4000-8000-000000000012', 'Lehigh University', '2026-10-07', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000063', 'a2000000-0000-4000-8000-000000000013', 'Lafayette College', '2026-10-08', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000064', 'a2000000-0000-4000-8000-000000000014', 'Boston University', '2026-10-09', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000065', 'a2000000-0000-4000-8000-000000000015', 'American University', '2026-10-10', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000066', 'a2000000-0000-4000-8000-000000000016', 'Bucknell University', '2026-10-11', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000067', 'a2000000-0000-4000-8000-000000000017', 'Colgate University', '2026-10-12', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000068', 'a2000000-0000-4000-8000-000000000018', 'Lehigh University', '2026-10-13', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000069', 'a2000000-0000-4000-8000-000000000019', 'Lafayette College', '2026-10-14', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000070', 'a2000000-0000-4000-8000-000000000020', 'Boston University', '2026-10-15', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000071', 'a2000000-0000-4000-8000-000000000021', 'American University', '2026-10-16', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000072', 'a2000000-0000-4000-8000-000000000022', 'Bucknell University', '2026-10-17', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001'),
('e3000000-0000-4000-8000-000000000073', 'a2000000-0000-4000-8000-000000000023', 'Colgate University', '2026-10-18', 'Fictional email from guardian', 'b2000000-0000-4000-8000-000000000002'),
('e3000000-0000-4000-8000-000000000074', 'a2000000-0000-4000-8000-000000000024', 'Lehigh University', '2026-10-19', 'Fictional conversation with high school coach', 'b2000000-0000-4000-8000-000000000003'),
('e3000000-0000-4000-8000-000000000075', 'a2000000-0000-4000-8000-000000000025', 'Lafayette College', '2026-10-20', 'Fictional call with player', 'b2000000-0000-4000-8000-000000000001')
) AS sample(id, recruit_id, school, date_learned, source, changed_by_staff_id)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.recruit_visits (id, recruit_id, visit_type, visit_date, status, details, changed_by_staff_id) VALUES

('f3000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'unofficial', '2026-11-08', 'planned', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000002', 'campus_tour', '2026-10-03', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000003', 'home', '2026-11-10', 'planned', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000004', 'a2000000-0000-4000-8000-000000000004', 'school', '2026-10-05', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000005', 'a2000000-0000-4000-8000-000000000005', 'official', '2026-11-12', 'planned', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000006', 'a2000000-0000-4000-8000-000000000006', 'unofficial', '2026-10-07', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000007', 'a2000000-0000-4000-8000-000000000007', 'campus_tour', '2026-10-08', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000008', 'a2000000-0000-4000-8000-000000000008', 'home', '2026-10-09', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000009', 'a2000000-0000-4000-8000-000000000009', 'school', '2026-11-16', 'planned', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000010', 'a2000000-0000-4000-8000-000000000010', 'official', '2026-10-11', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000011', 'a2000000-0000-4000-8000-000000000011', 'unofficial', '2026-11-18', 'planned', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000012', 'a2000000-0000-4000-8000-000000000012', 'campus_tour', '2026-10-13', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000013', 'a2000000-0000-4000-8000-000000000013', 'home', '2026-11-20', 'planned', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000014', 'a2000000-0000-4000-8000-000000000014', 'school', '2026-10-15', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000015', 'a2000000-0000-4000-8000-000000000015', 'official', '2026-10-16', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000016', 'a2000000-0000-4000-8000-000000000016', 'unofficial', '2026-10-17', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000017', 'a2000000-0000-4000-8000-000000000017', 'campus_tour', '2026-11-24', 'planned', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000018', 'a2000000-0000-4000-8000-000000000018', 'home', '2026-10-19', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000019', 'a2000000-0000-4000-8000-000000000019', 'school', '2026-11-26', 'planned', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000020', 'a2000000-0000-4000-8000-000000000020', 'official', '2026-10-21', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000021', 'a2000000-0000-4000-8000-000000000021', 'unofficial', '2026-11-28', 'planned', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000022', 'a2000000-0000-4000-8000-000000000022', 'campus_tour', '2026-10-23', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000023', 'a2000000-0000-4000-8000-000000000023', 'home', '2026-10-24', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000024', 'a2000000-0000-4000-8000-000000000024', 'school', '2026-10-25', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000025', 'a2000000-0000-4000-8000-000000000025', 'official', '2026-11-10', 'planned', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000026', 'a2000000-0000-4000-8000-000000000026', 'unofficial', '2026-10-27', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000027', 'a2000000-0000-4000-8000-000000000027', 'campus_tour', '2026-11-12', 'planned', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000028', 'a2000000-0000-4000-8000-000000000028', 'home', '2026-10-01', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000029', 'a2000000-0000-4000-8000-000000000029', 'school', '2026-11-14', 'planned', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000030', 'a2000000-0000-4000-8000-000000000030', 'official', '2026-10-03', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000031', 'a2000000-0000-4000-8000-000000000031', 'unofficial', '2026-10-04', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000032', 'a2000000-0000-4000-8000-000000000032', 'campus_tour', '2026-10-05', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000033', 'a2000000-0000-4000-8000-000000000033', 'home', '2026-11-18', 'planned', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000034', 'a2000000-0000-4000-8000-000000000034', 'school', '2026-10-07', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000035', 'a2000000-0000-4000-8000-000000000035', 'official', '2026-11-20', 'planned', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000036', 'a2000000-0000-4000-8000-000000000036', 'unofficial', '2026-10-09', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000037', 'a2000000-0000-4000-8000-000000000037', 'campus_tour', '2026-11-22', 'planned', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000038', 'a2000000-0000-4000-8000-000000000038', 'home', '2026-10-11', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000039', 'a2000000-0000-4000-8000-000000000039', 'school', '2026-10-12', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000040', 'a2000000-0000-4000-8000-000000000040', 'official', '2026-10-13', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000041', 'a2000000-0000-4000-8000-000000000041', 'unofficial', '2026-11-26', 'planned', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000042', 'a2000000-0000-4000-8000-000000000042', 'campus_tour', '2026-10-15', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000043', 'a2000000-0000-4000-8000-000000000043', 'home', '2026-11-28', 'planned', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000044', 'a2000000-0000-4000-8000-000000000044', 'school', '2026-10-17', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000045', 'a2000000-0000-4000-8000-000000000045', 'official', '2026-11-08', 'planned', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000046', 'a2000000-0000-4000-8000-000000000046', 'unofficial', '2026-10-19', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000047', 'a2000000-0000-4000-8000-000000000047', 'campus_tour', '2026-10-20', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000048', 'a2000000-0000-4000-8000-000000000048', 'home', '2026-10-21', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000049', 'a2000000-0000-4000-8000-000000000049', 'school', '2026-11-12', 'planned', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000050', 'a2000000-0000-4000-8000-000000000050', 'official', '2026-10-23', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000051', 'a2000000-0000-4000-8000-000000000001', 'unofficial', '2026-11-14', 'planned', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000052', 'a2000000-0000-4000-8000-000000000002', 'campus_tour', '2026-10-25', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000053', 'a2000000-0000-4000-8000-000000000003', 'home', '2026-11-16', 'planned', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000054', 'a2000000-0000-4000-8000-000000000004', 'school', '2026-10-27', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000055', 'a2000000-0000-4000-8000-000000000005', 'official', '2026-11-18', 'planned', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000056', 'a2000000-0000-4000-8000-000000000006', 'unofficial', '2026-10-01', 'completed', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000057', 'a2000000-0000-4000-8000-000000000007', 'campus_tour', '2026-10-02', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001'),
('f3000000-0000-4000-8000-000000000058', 'a2000000-0000-4000-8000-000000000008', 'home', '2026-10-03', 'completed', 'Fictional visit: family meeting', 'b2000000-0000-4000-8000-000000000002'),
('f3000000-0000-4000-8000-000000000059', 'a2000000-0000-4000-8000-000000000009', 'school', '2026-11-22', 'planned', 'Fictional visit: academic interests discussion', 'b2000000-0000-4000-8000-000000000003'),
('f3000000-0000-4000-8000-000000000060', 'a2000000-0000-4000-8000-000000000010', 'official', '2026-10-05', 'completed', 'Fictional visit: campus and team introduction', 'b2000000-0000-4000-8000-000000000001') ON CONFLICT (id) DO NOTHING;

COMMIT;
