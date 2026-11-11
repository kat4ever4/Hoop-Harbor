# Hoop Harbor — Database Guide

## 1. Overview

Hoop Harbor uses **Supabase PostgreSQL** for recruiting data and **Supabase Auth** for logins. The Next.js application accesses PostgreSQL through Supabase clients and server actions.

**DATABASE STRUCTURE UNDERGOING CHANGES. NEED TO CONSOLIDATE**

The school directory has now been consolidated into `schools.aliases text[]`.
See [School directory and alias lookup](school-directory.md) for the current structure, sample data, and migration checks. Historical migrations still mention the former `school_aliases` table.

The project currently contains two generations of recruiting tables:

- **Original tables** (`recruits`, `staff_members`) support the existing recruit pages and their original staff permissions.
- **Version 2 tables** (`*_v2`) support richer recruit details, staff attribution, notes, recruiting stages, outside offers, visits, and an audit history.

### Projects

Supabase project | Purpose |
| --- | --- |
`hoop-harbor-test` | Development, migration verification, and integration tests |
`hoop-harbor-prod` | Real deployment; changes require review. **CURRENTLY PAUSED** |

## 2. Tables
**THESE NEED TO CHANGE TO CONSOLIDATE**
| Table | Purpose and important fields |
| --- | --- |
| `recruits` | Original recruit profiles: name, graduation year, positions, school, contact details, links, and other profile details. Used by the original recruit screens. |
| `staff_members` | Original staff authorization mapping: `user_id`, `role` (`staff` or `admin`). |
| `recruits_v2` | Expanded recruit profile: identity, academics, height/weight, contacts, recruiting status, `pipeline_stage`, optional USNA-offer date and coach. |
| `staff_members_v2` | Staff directory: `id`, optional Supabase Auth `user_id`, `display_name`, `role`, `is_active`. Staff IDs are used to attribute changes. |
| `recruit_notes_v2` | Notes tied to recruits: `recruit_id`, `author_id`, `note_type`, `title`, `body`, `occurred_at`, timestamps. Note types include `general`, `evaluation`, `interaction`, and `medical`. |
| `recruit_visits_v2` | Recruit visits: `recruit_id`, `visit_type`, `visit_date`, `status`, `details`, `changed_by_staff_id`, and optional `archived_at`. Status is `planned` or `completed`. |
| `recruit_other_offers_v2` | Offers from other schools: `recruit_id`, `school`, canonical `school_id`, `date_learned`, `source`, `changed_by_staff_id`, and optional `archived_at`. |
| `recruit_pipeline_history_v2` | Audit trail for pipeline, visit, and other-offer changes. Stores action (`created`/`updated`), actor, timestamp, and before/after JSON. |
| `schools` | Canonical school directory with `id`, `name`, generated `normalized_name`, and normalized alternate names in `aliases text[]`. |

## 3. Row-Level Security (RLS)

**RLS determines which rows a logged-in user may read or change.** A valid login by itself does **not** imply unrestricted access. Supabase Auth identifies the user. RLS policies check that identity against the staff tables. In `public`, all ten tables listed above have RLS enabled in the verified test database.

| Tables | Policy Behavior|
| --- | --- |
| `recruits` | Users who pass `is_hoop_harbor_staff()` may read, insert, edit, and delete original recruit records. That helper checks the original `staff_members` mapping. |
| `staff_members` | RLS is enabled, but no direct client-access policies are defined. Ordinary clients cannot freely query staff memberships; the original authorization helper accesses them internally. |
| `staff_members_v2` | Signed-in users linked to **active** v2 staff can read the directory. There are no ordinary client insert/update/delete policies here. |
| `recruits_v2` | Linked, active staff can read, add, and edit recruits. **Only active v2 admins** can delete recruits. |
| `recruit_notes_v2` | Linked, active staff can read notes. A new note's `author_id` must be **the current signed-in staff member**. Only its author or an active v2 admin may update or delete it. |
| `recruit_visits_v2` | Linked, active staff can read, add, and update visits. The database also requires a valid active `changed_by_staff_id` to write history. There is no direct delete policy. |
| `recruit_other_offers_v2` | Linked, active staff can read, add, and update outside offers. The database also requires a valid active `changed_by_staff_id`. There is no direct delete policy. |
| `recruit_pipeline_history_v2` | Linked, active staff can read history; ordinary clients have no insert, update, or delete policy. The database trigger writes the audit entries. |
| `schools` | Linked, active staff can read schools and their aliases. No client-side write policies are defined; directory changes are managed through reviewed SQL/migrations. |

### How staff checking works

- `current_staff_v2_id()` looks up the current user's active entry in `staff_members_v2` using `auth.uid()`.
- `is_staff_v2_admin()` additionally checks that the active staff member has role `admin`.
- The original `recruits` table uses a **different** check, `is_hoop_harbor_staff()`, against `staff_members` (without `_v2`).

## 4. Migration workflow

A **migration** is a versioned `.sql` file describing a database change. Commit it to Git so teammates and deployments apply the same changes in order. The migration directory for this repository is:

```text
my-app/supabase/migrations/
```

### Typical workflow

Run commands from **`my-app/`**, the directory that contains `supabase/`:

```bash
# 1. Create a migration file with a generated timestamp.
npx supabase migration new <migration_name>

# 2. Edit the new SQL file in supabase/migrations/.
#    Prefer changes that preserve existing tables/data unless removal is intentional.

# 3. If Docker/local Supabase is available, test from a clean local DB.
npx supabase start
npx supabase db reset --local

# 4. Check which hosted test project is linked and compare histories.
npx supabase link --project-ref YOUR_TEST_PROJECT_REF
npx supabase migration list --remote

# 5. Preview changes WITHOUT modifying the hosted test DB.
npx supabase db push --remote --dry-run

# 6. Apply to the hosted TEST database only after reviewing the preview.
npx supabase db push --remote

# 7. Verify the changed tables/functions and run application tests.
npm run lint
npx tsc --noEmit
npx vitest run
```


### If `db push` fails

**Common Error:** GNBA network restrictions may block connections to Supabase, causing `db push` to fail.

**Solution:**
1. Connect your computer to a mobile hotspot.
2. Navigate to the `my-app` directory.
3. Run the following command to push migrations to the hosted Supabase database:

```bash
npx supabase db push --remote
```

**Note:** Make sure your Supabase CLI is linked to the correct project before running the command. Use `--remote` to target the hosted database instead of the local database.
