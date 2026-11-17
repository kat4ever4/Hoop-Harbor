# Contributing to Hoop Harbor

How our team of four works together without breaking each other's code. Read this before your first pull request.

## Summary

1. Never push to `main`. Every change goes through a pull request (PR).
2. One branch per task, named by type: `feature/`, `fix/`, `chore/`, `docs/`.
3. Before opening a PR: lint, typecheck, and unit tests all pass locally.
4. A PR merges only with **green CI** and **one approval** from someone who didn't write it.
5. Never `git add .`. Add files by name, and check `git status` first.

## 1. Start a task

```bash
git checkout main && git pull
git checkout -b feature/f3-status-ui
```

| Prefix | Use for | Example |
|---|---|---|
| `feature/` | A release-plan feature | `feature/f4-duplicate-dialog` |
| `fix/` | A bug fix | `fix/recruits-signed-out` |
| `chore/` | Setup, cleanup, dependencies | `chore/staff-page-cleanup` |
| `docs/` | Documentation only | `docs/testing-guide` |

If your work depends on a teammate's unmerged branch, branch from theirs. After it merges, catch up:
```bash
git checkout main && git pull
git checkout <your-branch> && git rebase main
```

## 2. Commit

Make small commits, one idea each. Start the message with a type and, for features, the feature number:

```
feat(F2): note list with edit in place
fix(F4): center duplicate dialog
chore: remove unused imports on /staff
docs: add testing guide
test(F4): duplicate matching rule
```

**Add files by name**, never `git add .`:
```bash
git status                                  # see what changed
git add my-app/lib/recruits/duplicates.ts   # only the files for this commit
git status                                  # confirm nothing extra is staged
git commit -m "feat(F4): duplicate-recruit matching rule"
```

**Never commit:**
- `.env.local`, or any key, password, or service-role secret
- `.next/`, `node_modules/`, `playwright-report/`, `test-results/`
- Scratch pages (e.g. `app/dev/`) or `.patch` files
- **Real recruit data.** Fake data only. Real data lives only in the production database, entered by coaches.

## 3. Check before pushing

From `my-app/`:
```bash
npm run lint && npm run typecheck && npm run test:run
```
The test summary must show **no red "Errors" line**, even when every test passes. CI fails on those too.

Then try your change in the browser (see `docs/testing.md`).

## 4. Open a pull request

```bash
git push -u origin <your-branch>
```

On GitHub, open a PR into `main`:

- **Title:** the feature and what it does, e.g. `F4 — Duplicate Recruit Warning`.
- **Description:**
  - what changed and why
  - the feature's **acceptance-test checklist** with boxes ticked (or marked "waiting on …")
  - a phone-width screenshot for any UI change
  - anything a reviewer should check carefully
- **Draft PR:** use one if it isn't ready to merge yet (e.g. still on mock data).
- **Reviewer:** someone who didn't write it.

## 5. Review

As a reviewer:
- Pull the branch or open its **Vercel preview** link (in the PR's checks) and try the feature.
- Check it matches the user story and acceptance test in the release plan.
- Comment on anything unclear. "Looks good" is fine when it is.

As an author, answer every comment, either with a fix or a reason.

## 6. Merge

- **CI green:** "Lint, types, unit tests, build" and "Playwright smoke tests."
- **One approval.**
- Up to date with `main`. If GitHub shows a conflict, rebase or merge `main` into your branch and fix it.

After merging, tell the team in the group chat: *"Merged X. Pull `main` and rebase."*

## Definition of Done

A feature is done when:
- [ ] Its acceptance test passes on the Vercel preview, on a phone and on desktop
- [ ] Lint, typecheck, and unit tests pass, and CI is green
- [ ] Docs are updated in the same PR (developer docs in `docs/`, user guides for anything coaches use)
- [ ] Any new library is added to `docs/decisions.md` with its license
- [ ] It's merged into `main` with one approval

## Directories

| What | Where |
|---|---|
| Pages (URLs) | `my-app/app/` |
| Shared components | `my-app/components/` |
| Logic, queries, types | `my-app/lib/` |
| Database changes | `my-app/supabase/migrations/` (never edit the hosted database by hand) |
| Unit tests | Next to the file they test: `thing.ts` → `thing.test.ts` |
| Browser tests | `my-app/tests/e2e/` |
| Developer docs | `docs/` |
