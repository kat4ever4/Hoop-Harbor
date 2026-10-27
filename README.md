# Hoop Harbor

A shared recruiting database for a college coaching staff, built as a USNA capstone for the Navy women's basketball program. Coaches keep one current record per recruit instead of several Google Sheets, from a phone or a desktop.

Built with Next.js (TypeScript, React, Tailwind, shadcn/ui), Supabase (PostgreSQL, Auth, Row Level Security), and Vercel. It installs on phones as a Progressive Web App.

## Project layout

```
.github/workflows/ci.yml   CI: lint, types, unit tests, build, Playwright
my-app/                    the Next.js application
  app/                     pages (folder = URL), e.g. app/roster/page.tsx -> /roster
    auth/                  sign-in, sign-up, password reset pages
    manifest.ts            PWA manifest
  components/
    layout/                site-wide pieces (navigation)
    ui/                    shadcn/ui building blocks (button, card, input...)
    *-form.tsx             auth forms
  lib/
    app-config.ts          app name and colors (rebrand here)
    supabase/              Supabase clients and the login guard (proxy.ts)
  proxy.ts                 runs the login guard before each request
  public/                  static files (icons, images)
  supabase/
    migrations/            database schema changes (SQL, in order)
    seed.sql               fictional sample data for development
  tests/e2e/               Playwright browser tests
  *.test.ts                Vitest unit tests sit next to the code they test
```

## Quick start

Requires Node.js 22 and Docker (for local Supabase).

```
cd my-app
npm install
cp .env.example .env.local      # then fill in the Supabase URL and key
npx supabase start              # local database; prints the URL and key
npm run dev                     # http://localhost:3000
```

## Scripts (run inside `my-app/`)

| Command | What it does |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test:run` | Vitest unit tests |
| `npm run test:e2e` | Playwright browser tests |
| `npm run build` | Production build |

## Working together

- Branch from `main` as `feature/...`, `fix/...`, or `chore/...`.
- Open a pull request; CI must pass and one teammate must approve before merging.
- Stage specific files (`git add path/to/file`) rather than `git add .`, and never commit `.env.local`.
- Database changes go in a new file under `my-app/supabase/migrations/`, never edited by hand in the dashboard.

## Environments

| Environment | Where | Database |
| --- | --- | --- |
| Local | `localhost:3000` | Local Supabase (Docker) |
| Preview | Vercel link on each pull request | `hoop-harbor-test` |
| Production | `hoop-harbor.vercel.app` | `hoop-harbor-prod` (no real data yet) |

`REQUIRE_LOGIN=false` (in `.env.local` or Vercel) skips the login redirect for development. Recruit data stays protected by Row Level Security either way. Remove it before real data is added.
