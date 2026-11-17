
BEGIN;

-- Overall ratings describe recruits, not individual evaluation notes.
-- Support both the current recruits table and the future v2 table.

ALTER TABLE public.recruits
ADD COLUMN overall_rating smallint
CONSTRAINT recruits_overall_rating_range_check
CHECK (overall_rating BETWEEN 1 AND 5);

ALTER TABLE public.recruits_v2
ADD COLUMN overall_rating smallint
CONSTRAINT recruits_v2_overall_rating_range_check
CHECK (overall_rating BETWEEN 1 AND 5);

-- Preserve existing ratings when records have been copied to v2.

UPDATE public.recruits_v2 AS next
SET overall_rating = previous.overall_rating
FROM public.recruits AS previous
WHERE next.id = previous.id
  AND next.overall_rating IS NULL
  AND previous.overall_rating IS NOT NULL;

-- Prevent deleting note ratings if any values exist.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.recruit_notes_v2
    WHERE rating IS NOT NULL
  ) THEN
    RAISE EXCEPTION
      'Refusing to drop recruit_notes_v2.rating: existing values must be reviewed first';
  END IF;
END;
$$;

-- Remove rating from evaluation notes.

ALTER TABLE public.recruit_notes_v2
DROP COLUMN rating;

-- Refresh the Supabase API schema cache.

NOTIFY pgrst, 'reload schema';

COMMIT;
