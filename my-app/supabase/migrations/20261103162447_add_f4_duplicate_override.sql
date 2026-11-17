ALTER TABLE public.recruits_v2
ADD COLUMN IF NOT EXISTS
    created_despite_duplicate boolean NOT NULL DEFAULT false;

ALTER TABLE public.recruits_v2
ADD COLUMN IF NOT EXISTS
    duplicate_override_at timestamptz;

ALTER TABLE public.recruits_v2
ADD CONSTRAINT duplicate_override_consistency
CHECK (
    (created_despite_duplicate = false AND duplicate_override_at IS NULL)
    OR
    (created_despite_duplicate = true AND duplicate_override_at IS NOT NULL)
);
