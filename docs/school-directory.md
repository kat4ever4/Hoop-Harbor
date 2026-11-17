# School directory and alias lookup

The school directory uses one `public.schools` table:

| Column | Meaning |
| --- | --- |
| `id uuid` | Stable school ID referenced by outside offers |
| `name text` | Canonical display name |
| `normalized_name text` | Generated lowercase, trimmed name; unique |
| `aliases text[]` | Alternate search names; defaults to an empty array |

The consolidation migration copies every existing alias into its school's array, verifies preservation, and drops `public.school_aliases`. Existing school IDs, offer foreign keys, and staff-only read permissions remain intact. A trigger lowercases and trims aliases, removes blanks/nulls and duplicates, and sorts the array when it is written through SQL or Supabase Studio.

Sample aliases include `bu` and `boston u` for Boston University, `bucknell` for Bucknell University, and `uconn` and `connecticut` for University of Connecticut. These are directory examples for fictional recruiting activity, not claims about actual offers.

`resolveSchool()` in `my-app/app/recruits/recruiting-actions.ts` searches both `normalized_name` and `aliases` on `schools`. It deduplicates matches by school ID and saves the canonical ID and display name. A canonical name works even if its aliases array is empty. Input is trimmed and lowercased; punctuation is treated literally.

Arrays do not enforce uniqueness of individual aliases across schools. Multiple matching schools produce an error asking for the full official name; unknown names and database lookup failures also stop the save. If a full official name itself collides with another school's alias, an administrator must correct the directory ambiguity. The existing unique index on active offers still prevents duplicate offers from the same canonical school.

## Local sample data

`supabase/config.toml` runs these seeds in order:

1. `seed.sql`
2. `seed-v2.sql`
3. `seed-schools.sql`
4. `seed-pipeline-v2.sql`

The school seed creates seven example schools and merges sample aliases without removing custom ones. The pipeline seed resolves each sample offer's `school_id` from the canonical directory; a missing school fails the seed instead of creating an unlinked offer.

## Validation and deployment

Run the normal lint, typecheck, and unit test commands from `my-app/`. The outside-offer tests cover canonical names, aliases, normalization, ambiguous matches, lookup failures, punctuation, and duplicate offers. Run `supabase/tests/school-directory.sql` as the database owner on a test database after migrations and seeds. It rolls back its fixtures and checks normalization, retained offer references, and anonymous/nonstaff/active/inactive staff access.

Apply the migration together with the matching application change: older server actions still query `school_aliases` and cannot resolve schools after that table is dropped. Historical migration files remain unchanged so fresh databases can replay the full history.
