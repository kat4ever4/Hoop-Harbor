
BEGIN;

-- Finalize school table names after the recruiting table promotion.
-- Preserve data, foreign keys, indexes, and RLS policies.

ALTER TABLE public.schools_v2
RENAME TO schools;

ALTER TABLE public.school_aliases_v2
RENAME TO school_aliases;

-- Refresh Supabase API schema cache.
NOTIFY pgrst, 'reload schema';

COMMIT;
