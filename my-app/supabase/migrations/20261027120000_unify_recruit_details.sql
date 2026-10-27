-- Hoop Harbor: keep all recruit information in one table.
-- Apply to hoop-harbor-test first. Existing recruit/private-detail data is preserved.
-- staff_members remains separate to securely authorize the single staff group.

BEGIN;

-- Add the former private-detail fields to the main recruit record.
ALTER TABLE public.recruits
    ADD COLUMN recruit_email text,
    ADD COLUMN recruit_phone text,
    ADD COLUMN guardian_contacts jsonb NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(guardian_contacts) = 'array'),
    ADD COLUMN birthday date,
    ADD COLUMN academic_information text,
    ADD COLUMN extra_notes text;

-- Copy existing data before removing the separate table.
UPDATE public.recruits AS r
SET recruit_email = p.recruit_email,
    recruit_phone = p.recruit_phone,
    guardian_contacts = p.guardian_contacts,
    birthday = p.birthday,
    academic_information = p.academic_information,
    extra_notes = p.extra_notes
FROM public.recruit_private_details AS p
WHERE r.id = p.recruit_id;

-- General recruit profiles must no longer be visible to every signed-in user.
DROP POLICY recruits_read_signed_in ON public.recruits;
CREATE POLICY recruits_read_staff
ON public.recruits FOR SELECT TO authenticated
USING ((SELECT public.is_hoop_harbor_staff()));

-- Existing INSERT, UPDATE, and DELETE policies already require staff status.
-- Removing the old table also removes its RLS policies and update trigger.
DROP TABLE public.recruit_private_details;

COMMIT;
