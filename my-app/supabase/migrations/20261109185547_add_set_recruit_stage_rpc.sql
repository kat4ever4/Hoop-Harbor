
-- F3: Atomic recruit stage changes
-- Updates the recruit and records history through the existing trigger.

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
       OR public.current_staff_v2_id() IS NULL THEN
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
        FROM public.staff_members_v2
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
    FROM public.recruits_v2
    WHERE id = p_recruit_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recruit not found or access denied'
            USING ERRCODE = 'P0002';
    END IF;

    -- Avoid creating a history event if nothing changed.
    IF v_current_stage IS DISTINCT FROM p_stage THEN
        UPDATE public.recruits_v2
        SET
            pipeline_stage = p_stage,
            pipeline_changed_by_staff_id = p_staff_id
        WHERE id = p_recruit_id;
    END IF;

    -- The existing AFTER UPDATE trigger automatically inserts
    -- into recruit_pipeline_history_v2 in the same transaction.

    RETURN p_recruit_id;
END;
$$;

-- Only authenticated users may invoke this RPC.
-- The function and RLS policies enforce staff membership.
REVOKE ALL ON FUNCTION public.set_recruit_stage(uuid, text, uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.set_recruit_stage(uuid, text, uuid)
TO authenticated;
