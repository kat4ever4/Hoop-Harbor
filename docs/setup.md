# Local setup

This guide runs Hoop Harbor with a local Supabase database. Run application and Supabase commands from `my-app/` unless a step says otherwise.

## Prerequisites

- Git to clone the repository.
- Node.js 22 and npm, matching the version used by GitHub Actions.
- Docker Desktop or Docker Engine, installed and running. Supabase runs its local services in Docker containers.

Check your installation:

```bash
git --version
node --version
npm --version
docker info
```

## Install and start

1. Clone the repository if you do not already have it:

   ```bash
   git clone https://github.com/kat4ever4/Hoop-Harbor.git
   cd Hoop-Harbor
   ```

2. Install the dependencies from the committed lockfile:

   ```bash
   cd my-app
   npm ci
   ```

   The Supabase CLI is included in the project's development dependencies; a global installation is not needed.

3. Create your local environment file. If `.env.local` already exists, edit it instead of overwriting it:

   ```bash
   cp .env.example .env.local
   ```

   In Windows PowerShell, use `Copy-Item .env.example .env.local`.

4. Start the local database and supporting services:

   ```bash
   npx supabase start
   ```

   The first run downloads Docker images and can take several minutes. The CLI prints local service addresses and API keys. Run `npx supabase status` to display them again.

5. Edit `my-app/.env.local` using the values from the local Supabase output:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=replace-with-your-local-publishable-or-anon-key
   ```

   Use the API URL and publishable key (or legacy anon key), not the database connection URL or a secret/service-role key. The example file contains placeholders that must be replaced. Keep `.env.local` out of Git.

6. Start the application:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. The home page redirects to the recruit list; signed-out visitors are sent to the login page. Keep this terminal running while you use the app. Restart the development server after changing `.env.local`.

## Account access and sample recruits

Signing up creates an account, but recruit data is only available to signed-in accounts listed in `staff_members`. An empty list can mean your account does not have staff access yet.

1. Sign up at http://localhost:3000/auth/sign-up. Email confirmation is disabled in the current local Supabase configuration. Hosted projects may require confirmation.
2. Open local Supabase Studio at http://127.0.0.1:54323 and choose the SQL Editor.
3. Copy the SQL from [`my-app/supabase/add-staff-member.sql`](../my-app/supabase/add-staff-member.sql), replace `you@example.com` with the email you signed up with, and execute it against the local database.
4. Sign in again and open http://localhost:3000/recruits.

The repository includes migrations and fictional recruits in [`my-app/supabase/seed-v2.sql`](../my-app/supabase/seed-v2.sql) and [`seed-pipeline-v2.sql`](../my-app/supabase/seed-pipeline-v2.sql), which target the promoted tables after all migrations. The original `seed.sql` now populates the archived `recruits_v1` table. To rebuild an existing local database with the current migrations and seed data:

```bash
npx supabase db reset
```

**This deletes existing local database data, including accounts and staff access.** Only use it when you are willing to discard local data, then repeat the signup and staff-access steps. Do not use `--linked` or a remote database URL for this local reset. Do not load fictional seed data into production.

For development only, adding `REQUIRE_LOGIN=false` to `.env.local` skips the login redirect. It does not grant database access: Row Level Security still protects recruit data. Remove this setting before using real data.

## Common errors

| Problem | What to check |
| --- | --- |
| `npm` or `node` is not found, or installation reports an unsupported Node version | Install Node.js 22, reopen your terminal, and check `node --version`. |
| `npm ci` cannot find `package.json` or the lockfile | Run it inside `Hoop-Harbor/my-app`, not the repository root. |
| Supabase cannot connect to the Docker daemon | Start Docker Desktop or Docker Engine and confirm `docker info` works. On Linux, your user also needs permission to access Docker. |
| Supabase reports a port is already in use | Stop the conflicting local service or other Supabase project. This project uses ports including 54321 (API), 54322 (database), and 54323 (Studio). Run `npx supabase status` to check this project's services. |
| The app reports an invalid URL, invalid API key, or a failed connection | Replace both placeholders in `my-app/.env.local` with values from `npx supabase status`, confirm Supabase is running, and restart `npm run dev`. Keep the URL and key from the same local or hosted project. |
| Login works but the recruit list is empty or saving is denied | Add your signed-up account to `staff_members` in the same database the app uses, then sign in again. See the account-access steps above. |
| Tables or columns are missing after pulling new code | Confirm the app points to your local database. If local data is disposable, run `npx supabase db reset` to apply migrations and seeds, then recreate your account and staff access. |
| Port 3000 is occupied or Next.js reports an existing development-server lock | Use the development server already running, or stop it before starting another one. If Next.js selects a different port, use the address printed in the terminal. |
| A hosted signup requires confirmation but no email arrives | Check spam and the hosted project's email configuration. Local test emails can be viewed at http://127.0.0.1:54324. |

## Run checks

From `my-app/`:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

For browser tests, install Playwright's browsers once, then run the suite:

```bash
npx playwright install --with-deps
npm run test:e2e
```

Playwright starts the development server automatically, or reuses one already running at its configured address. The app still needs valid Supabase environment settings. Use `npm run test:e2e:ui` for the interactive test interface.

## Stop local services

Press `Ctrl+C` in the terminal running Next.js. To stop local Supabase without resetting the database:

```bash
npx supabase stop
```

Return to the [README](../README.md) for the project layout, scripts, and contribution guidelines.
