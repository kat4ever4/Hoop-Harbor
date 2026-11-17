BEGIN;

-- Keep the original school IDs and offer foreign keys. Block directory edits
-- until every old alias has been copied and verified in this transaction.
LOCK TABLE public.schools, public.school_aliases IN ACCESS EXCLUSIVE MODE;

ALTER TABLE public.schools
ADD COLUMN aliases text[] NOT NULL DEFAULT '{}'::text[];

-- Directory edits through SQL/Studio also use the same normalized array format.
CREATE FUNCTION public.normalize_school_aliases() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
    NEW.aliases := ARRAY(
        SELECT DISTINCT lower(btrim(value))
        FROM unnest(NEW.aliases) AS value
        WHERE value IS NOT NULL AND btrim(value) <> ''
        ORDER BY 1
    );
    RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.normalize_school_aliases() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER schools_normalize_aliases
BEFORE INSERT OR UPDATE OF aliases ON public.schools
FOR EACH ROW EXECUTE FUNCTION public.normalize_school_aliases();

UPDATE public.schools s
SET aliases = ARRAY(
    SELECT a.normalized_alias
    FROM public.school_aliases a
    WHERE a.school_id = s.id
    ORDER BY a.normalized_alias
);

-- Sample search aliases for the existing demo directory, not real offer data.
-- Match by canonical name rather than environment-specific generated IDs.
UPDATE public.schools s
SET aliases = s.aliases || samples.aliases
FROM (VALUES
    ('American University', ARRAY['american', 'au', 'american eagles']),
    ('Boston University', ARRAY['bu', 'boston u', 'boston university terriers']),
    ('Bucknell University', ARRAY['bucknell', 'bucknell bison']),
    ('Colgate University', ARRAY['colgate', 'colgate raiders']),
    ('Lafayette College', ARRAY['lafayette', 'lafayette leopards']),
    ('Lehigh University', ARRAY['lehigh', 'lehigh mountain hawks']),
    ('University of Connecticut', ARRAY['uconn', 'connecticut', 'uconn huskies'])
) AS samples(name, aliases)
WHERE s.normalized_name = lower(btrim(samples.name));

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM public.school_aliases a
        JOIN public.schools s ON s.id = a.school_id
        WHERE NOT (s.aliases @> ARRAY[a.normalized_alias])
    ) THEN
        RAISE EXCEPTION 'School alias backfill is incomplete';
    END IF;
END $$;

-- No CASCADE: unexpected external dependencies must stop this migration.
DROP TABLE public.school_aliases;

-- Existing school SELECT grants and staff-only RLS still govern the new column.
COMMENT ON COLUMN public.schools.aliases IS
    'Normalized alternate school names: lowercase, trimmed, nonblank, distinct. Shared aliases require disambiguation.';

NOTIFY pgrst, 'reload schema';
COMMIT;
