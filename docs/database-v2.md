# Recruiting database and table promotion

The application uses the replacement recruiting schema under permanent names. Migration [`20261103220000_promote_recruit_tables.sql`](../my-app/supabase/migrations/20261103220000_promote_recruit_tables.sql) renames the tables atomically:

| Previous table | Current table | Purpose |
| --- | --- | --- |
| `recruits` | `recruits_v1` | Archived original recruits, including their `extra_notes` |
| `staff_members` | `staff_members_v1` | Archived original memberships |
| `recruits_v2` | `recruits` | Active recruit profiles |
| `staff_members_v2` | `staff_members` | Active staff profiles and optional login links |
| `recruit_notes_v2` | `recruit_notes` | General, evaluation, interaction, and medical notes |
| `recruit_other_offers_v2` | `recruit_other_offers` | Offers from other schools |
| `recruit_visits_v2` | `recruit_visits` | Visits and their status |
| `recruit_pipeline_history_v2` | `recruit_pipeline_history` | Attributed pipeline, offer, and visit history |

Existing replacement-table records and foreign keys stay intact. Original recruit records remain in `recruits_v1`; they are not merged into the replacement dataset. Application roles cannot read or write the archived tables. Database administrators retain access to them.

Existing approved login accounts are copied from the original staff table into the promoted table. If an account already has a replacement staff profile, its name, role, and active/inactive status are preserved. New copied profiles use account metadata or the email prefix for their display name.

The migration also repairs the staff-access functions and pipeline trigger bodies. `current_staff_id()` resolves the signed-in active profile; `is_staff_admin()` checks its role. The existing `is_hoop_harbor_staff()` helper now uses promoted membership.

## Deploying the change

Apply the schema and deploy the matching application as one coordinated release. The previous application still submits `extra_notes`, which is absent from the promoted recruit table. A Git branch push alone does not apply database migrations or replace the production application.

1. Confirm the target database has migrations through `20261103140000` applied. The two replacement-schema migrations must precede promotion. Reconcile any manually applied migrations with the CLI history before running `supabase db push`.
2. Apply pending migrations to the intended database using the established deployment process. For local Supabase, run `npx supabase migration up --local` from `my-app/`. For a linked hosted project, inspect `npx supabase migration list` and `npx supabase db push --dry-run` before `npx supabase db push`.
3. Deploy this branch's application with the same database configuration. Verify staff login, recruit create/edit, and notes with both Automatic and a selected coach.

Do not reset an existing database to perform the promotion. The migration preserves records and adds Coach A and Coach B without requiring a seed rerun. If applying the promotion SQL manually, record migration `20261103220000` as applied for that same project after confirming success.

## Notes and staff selection

Recruit profiles display notes from `recruit_notes`, including their author name, type, title, body, and observation time. The note form defaults to **Automatic (your account)** and also lists active staff profiles from `staff_members`. Selecting Coach A or Coach B attributes the note to that profile, even when a different staff account is signed in.

The database permits insertion only when the caller is active staff and the selected author is an active staff profile. Omitting `author_id` in a database insert defaults to `current_staff_id()`. Anonymous, nonstaff, and inactive accounts remain blocked. A selected name is attribution, not authentication.

Existing edit/delete rules remain: authors and admins can edit/delete notes, and edits cannot change a note's author, recruit, or creation time. Selecting a different author does not give the submitting account ownership of that note. The current note UI supports creation and reading.

General notes are separate records instead of the original `extra_notes` field. The recruit form edits `medical_notes`; the profile also shows weight and GPA from the replacement schema.

## Staff accounts

Sample profiles are Dana Mercer (admin), Robin Ellis (staff), Casey Rowan (staff), Coach A (staff), and Coach B (staff). They have no login accounts or passwords. Their nullable, unique `user_id` links to Supabase Auth only when an administrator explicitly assigns an account. A fictional profile cannot authenticate or grant access on its own.

After signing up through the application, use [`add-staff-member.sql`](../my-app/supabase/add-staff-member.sql) with your email, name, and intended role to grant access. Membership is managed through trusted administrator operations, not client writes. Setting `is_active = false` removes access while retaining attribution.

Active staff can read recruit information and create/edit recruits. Only admins can delete recruits. Notes cascade when an otherwise deletable recruit is removed; pipeline history prevents hard deletion of recruits with recorded activity.

## Fictional sample data

After all migrations, local Supabase loads:

- [`seed.sql`](../my-app/supabase/seed.sql): original fixtures in `recruits_v1`.
- [`seed-v2.sql`](../my-app/supabase/seed-v2.sql): 50 active recruits, three additional staff profiles, and 150 notes under the permanent table names. Coach A and Coach B are inserted by the promotion migration.
- [`seed-pipeline-v2.sql`](../my-app/supabase/seed-pipeline-v2.sql): all eight pipeline stages, 75 other-school offers, 60 visits, and generated history.

The filenames retain their historical version labels; their SQL targets the promoted tables. Run these updated seed files only after promotion. Fixed IDs and conflict handling preserve edits and avoid duplicates on reruns.

All sample people, observations, and health details are fictional. Emails and media links use `example.com`; phones use fictional 202-555-01xx numbers. Some offer/visit school names are real institutions, but all recruiting claims are fictional. Load sample datasets only in development/test databases.

For a disposable local database, `npx supabase db reset` applies all migrations and seeds, **deleting existing local data**. For an existing test database, run only the desired seed files with an administrator connection after applying migrations. Publishable/anon keys cannot apply migrations.

## Pipeline, offers, and visits

`recruits.pipeline_stage` is the pipeline source of truth:

| Label | Stored value |
| --- | --- |
| Identified | `identified` |
| Evaluating | `evaluating` |
| Priority | `priority` |
| Offered | `offered` |
| Committed to USNA | `committed_to_usna` |
| Committed Elsewhere | `committed_elsewhere` |
| Not Pursuing | `not_pursuing` |
| To be confirmed | `to_be_confirmed` |

The older `recruiting_status` column is retained but not synchronized. USNA offers use `usna_offer_date` and `usna_offered_by_staff_id`, both filled or both empty. Other offers store school, date learned, and source. Visits store type, date, status (`planned` or `completed`), and details.

Pipeline changes require an active `pipeline_changed_by_staff_id`; other offers and visits require `changed_by_staff_id`. Triggers record selected staff, their name at the time, the authenticated account when available, timestamps, and before/after values in `recruit_pipeline_history`. Clients can read history but cannot write it directly. Archive offers/visits with `archived_at` and the selected staff ID. These features retain their existing database behavior; this change adds the notes UI.

## Verification

After all migrations and sample seeds, run as the database owner against a test database:

```bash
psql "$HOOP_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/schema-v2.sql
psql "$HOOP_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/pipeline-v2.sql
```

Both tests roll back temporary accounts and changes. They verify promoted names, sample relationships, selected and automatic note attribution, inactive-author rejection, anonymous/nonstaff/inactive account denial, archive protection, author/admin permissions, pipeline history, and archiving. Run `npm run test:run`, `npm run typecheck`, `npm run lint`, and `npm run build` for application checks.
