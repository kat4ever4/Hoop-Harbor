
-- F3: School directory and duplicate-offer protection.
-- Requires the v2 recruiting pipeline migration.

BEGIN;

-- 1. Create the canonical school directory.

CREATE TABLE public.schools_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
    CHECK (length(btrim(name)) > 0),
  normalized_name text
    GENERATED ALWAYS AS (lower(btrim(name))) STORED UNIQUE
);

-- 2. Store alternate names for each school.

CREATE TABLE public.school_aliases_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL
    REFERENCES public.schools_v2(id) ON DELETE RESTRICT,
  alias text NOT NULL
    CHECK (length(btrim(alias)) > 0),
  normalized_alias text
    GENERATED ALWAYS AS (lower(btrim(alias))) STORED UNIQUE
);

-- 3. Allow authenticated staff to read the directory.

ALTER TABLE public.schools_v2
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.school_aliases_v2
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON
  public.schools_v2,
  public.school_aliases_v2
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON
  public.schools_v2,
  public.school_aliases_v2
TO authenticated;

CREATE POLICY schools_v2_read
ON public.schools_v2
FOR SELECT TO authenticated
USING (
  (SELECT public.current_staff_v2_id()) IS NOT NULL
);

CREATE POLICY school_aliases_v2_read
ON public.school_aliases_v2
FOR SELECT TO authenticated
USING (
  (SELECT public.current_staff_v2_id()) IS NOT NULL
);

-- 4. Add existing outside-offer schools to the directory.

INSERT INTO public.schools_v2 (name)
SELECT DISTINCT ON (lower(btrim(school)))
  btrim(school)
FROM public.recruit_other_offers_v2
ORDER BY lower(btrim(school)), btrim(school);

-- 5. Make every official school name searchable.

INSERT INTO public.school_aliases_v2 (school_id, alias)
SELECT id, name
FROM public.schools_v2;

-- 6. Add a canonical school reference to outside offers.

ALTER TABLE public.recruit_other_offers_v2
ADD COLUMN school_id uuid
REFERENCES public.schools_v2(id)
ON DELETE RESTRICT;

-- 7. Assign IDs to the existing offers.
-- Do not create new coach history events during backfill.

ALTER TABLE public.recruit_other_offers_v2
DISABLE TRIGGER other_offers_v2_history;

UPDATE public.recruit_other_offers_v2 AS o
SET school_id = s.id
FROM public.schools_v2 AS s
WHERE lower(btrim(o.school)) = s.normalized_name;

ALTER TABLE public.recruit_other_offers_v2
ENABLE TRIGGER other_offers_v2_history;

-- 8. Require all offers to reference a school.

ALTER TABLE public.recruit_other_offers_v2
ALTER COLUMN school_id SET NOT NULL;

-- 9. Prevent duplicate active offers from the same school.

CREATE UNIQUE INDEX recruit_other_offers_v2_active_school_unique
ON public.recruit_other_offers_v2 (
  recruit_id,
  school_id
)
WHERE archived_at IS NULL;

COMMIT;
