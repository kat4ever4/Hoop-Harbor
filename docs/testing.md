# Testing Guide

How we check that Hoop Harbor works: what each kind of test is for, how to run it, and how the release plan's acceptance tests are covered.

## The four layers

| Layer | Tool | Checks | Example | Runs in CI? |
|---|---|---|---|---|
| **Unit** | Vitest + Testing Library | One function or component, with fake data | "Jordyn Smith matches Jordan Smith" | ✅ Every PR |
| **Database** | SQL scripts (`supabase/tests/`) | Tables, rules (RLS), and triggers | "a note needs an active staff author" | ❌ Run by hand |
| **Browser (E2E)** | Playwright | Real pages in a real browser | "the home page loads with no sideways scroll" | ✅ Every PR |
| **Acceptance** | A person, following a checklist | A whole feature, as a coach would use it | The F4 acceptance test in the release plan | ❌ At sprint review |

## Commands

From `my-app/`:

| Command | What it does |
|---|---|
| `npm run lint` | Style and common-mistake checks (ESLint) |
| `npm run typecheck` | TypeScript type checks |
| `npm run test:run` | All unit tests, once |
| `npm test` | Unit tests in watch mode (reruns on save) |
| `npm run test:e2e` | Playwright browser tests |
| `npm run test:e2e:ui` | Playwright with a visual runner, for debugging |
| `npm run build` | A full production build (CI runs this too) |

**Before every push:**
```bash
npm run lint && npm run typecheck && npm run test:run
```

**Read the whole summary.** "All tests passed" is not enough. If there's a red **Errors** line (an unhandled error), CI fails. 

## Unit tests (Vitest)

- **Where:** next to the file being tested. `lib/recruits/duplicates.ts` → `lib/recruits/duplicates.test.ts`.
- **Environment:** `jsdom`, a fake browser. Some browser features are missing (e.g. `scrollIntoView`, `<dialog>.showModal`), so guard them with `?.` or a fallback.
- **Database calls are faked** with `vi.mock('@/lib/supabase/server', …)`, so unit tests never need a database. See `app/recruits/actions.test.ts`.

## Database tests (SQL)

`supabase/tests/*.sql` check the schema, row-level security, and triggers. Run them against a **local** database after migrations and seeds. Each script runs inside a transaction and rolls back, so it leaves no data behind. See `docs/database-v2.md` for exact commands.

## Browser tests (Playwright)

- **Where:** `tests/e2e/*.spec.ts`
- **Today:** smoke tests only, covering the home page, no sideways scrolling, and the PWA manifest. They run in CI after the unit-test job passes. The CI job shows **"skipped"** if the unit-test job failed.
- **Planned for Sprint 3:** sign-in setup plus F2/F4 flows. These write data, so they'll be tagged `@db` and need a seeded test login.

## Acceptance tests → automated coverage

| Feature | Acceptance test (release plan) | Automated today |
|---|---|---|
| F1 Recruit Database & Profile | Steps 1–6 | `lib/recruits/validate.test.ts`, `app/recruits/actions.test.ts`, `lib/format-height.test.ts` |
| F2 Evaluation Notes | Steps 1–5 | `app/recruits/[id]/add-note.test.tsx` (Save disabled, Retry reuses the same request ID), `lib/notes/*.test.ts` |
| F3 Recruiting Status | Steps 1–5 | Naman's `supabase/tests/pipeline-v2.sql` (change history) |
| F4 Duplicate Warning | Steps 1–4 | `lib/recruits/duplicates.test.ts` (matching rule), `app/recruits/duplicate-dialog.test.tsx`, `app/recruits/actions.test.ts` (warns / Create anyway) |

Every feature's acceptance test is still run **by hand** on the Vercel preview before the sprint review: one phone and one desktop.

## Trying changes in the browser

```bash
npm run dev            # http://localhost:3000
```

**Which database?** Your `my-app/.env.local` decides. For development, always use the **test** project (`uxisjsmkprpkblevonps`), never production. Use the publishable key from the same project.

**Simulating problems:**
- **Offline / failed save:** DevTools → Network → **Offline**. On a phone, use airplane mode.
- **Phone size:** DevTools device toolbar (**Ctrl+Shift+M** in Firefox).
- **Two coaches at once:** two browser windows, or a normal window plus a private window.

## Lab machines and SSH: known problems

| Symptom | Cause | Fix |
|---|---|---|
| Page loads but **buttons do nothing**; console full of `ws://…/_next/hmr` errors | The live-reload connection is blocked over SSH/VPN, and this Next.js version needs it to load page code | Run `npx next dev --webpack` instead of `npm run dev` |
| `docker: command not found` | Lab machines don't have Docker, so local Supabase can't run | Point `.env.local` at the **test** project, or work on your own laptop |
| Login says **NetworkError** | The Supabase project in `.env.local` is paused, wrong, or unreachable | Check the project ID against the Supabase dashboard; restore it if paused |
| `Port 3000 is in use` / `EBUSY … .nfs…` | An old dev server is still running | `pkill -u $USER -f "next dev"`, then `rm -rf .next`, then start again |
| Typecheck errors inside `.next/types/…` about a deleted page | Stale build cache | Stop the server, `rm -rf .next`, rerun |

**Tip:** always stop the dev server with **Ctrl+C** before closing a terminal.

## Test data rules

- **Fake data only**, everywhere except production.
- The **test** database is shared with teammates and PR previews. Rename or clean up records you create for testing, e.g. "F4 test — Jordyn Smith."
- `npx supabase db reset` wipes your **local** database and reloads the seed. Never run it against a hosted project.
