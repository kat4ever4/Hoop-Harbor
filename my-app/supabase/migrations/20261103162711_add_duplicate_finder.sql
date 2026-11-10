-- F4: Duplicate Recruit Warning
-- Enable fuzzy matching for similar first names

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch
WITH SCHEMA extensions;

-- Find possible duplicate recruits
CREATE OR REPLACE FUNCTION public.find_possible_duplicates(
    p_first text,
    p_last text,
    p_grad_year integer,
    p_school text,
    p_club text
)
RETURNS SETOF public.recruits_v2
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
    SELECT r.*
    FROM public.recruits_v2 AS r
    WHERE
        -- Must have the same last name
        lower(btrim(r.last_name)) = lower(btrim(p_last))

        -- Must have the same graduation year
        AND r.graduation_year = p_grad_year

        -- At least one of these must match
        AND (
            -- Similar first name
            (
                p_first IS NOT NULL
                AND r.first_name IS NOT NULL
                AND extensions.levenshtein(
                    lower(btrim(r.first_name)),
                    lower(btrim(p_first))
                ) <= 2
            )

            OR

            -- Same high school
            (
                NULLIF(btrim(p_school), '') IS NOT NULL
                AND lower(btrim(r.high_school)) =
                    lower(btrim(p_school))
            )

            OR

            -- Same club team
            (
                NULLIF(btrim(p_club), '') IS NOT NULL
                AND lower(btrim(r.club_team)) =
                    lower(btrim(p_club))
            )
        );
$$;
