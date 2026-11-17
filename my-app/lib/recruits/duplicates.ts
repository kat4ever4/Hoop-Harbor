// F4: decide whether a new recruit probably already exists.
// Rule (release plan): same last name AND same graduation year, PLUS at least one of:
// a similar first name, the same high school, or the same club team.
// It only warns, never blocks (twins and common names exist).

export type DuplicateCandidate = {
  first_name: string
  last_name: string
  preferred_name?: string | null
  graduation_year: number | null
  high_school?: string | null
  club_team?: string | null
}

export type ExistingRecruit = DuplicateCandidate & { id: string }

export type DuplicateMatch = {
  id: string
  name: string
  graduation_year: number | null
  high_school: string | null
  stage: string | null // filled in once recruits have a pipeline stage (F3)
}

/** "López", "lopez", "O'Neil", "o neil" → comparable keys. */
export function normalize(s: string | null | undefined): string {
  return (s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/** "Westfield High School" and "Westfield HS" → "westfield". */
export function schoolKey(s: string | null | undefined): string {
  return normalize(s).replace(/(highschool|hs)$/, '')
}

/** Number of single-letter edits to turn a into b. */
export function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1))
      diag = tmp
    }
  }
  return prev[b.length]
}

function similarFirstName(a: DuplicateCandidate, b: DuplicateCandidate): boolean {
  const as = [a.first_name, a.preferred_name].map(normalize).filter(Boolean)
  const bs = [b.first_name, b.preferred_name].map(normalize).filter(Boolean)
  return as.some((x) =>
    bs.some((y) => x === y || editDistance(x, y) <= 2 || (Math.min(x.length, y.length) >= 3 && (x.startsWith(y) || y.startsWith(x)))),
  )
}

function sameNonEmpty(a: string, b: string): boolean {
  return a !== '' && a === b
}

export function isLikelyDuplicate(candidate: DuplicateCandidate, existing: DuplicateCandidate): boolean {
  if (candidate.graduation_year == null || candidate.graduation_year !== existing.graduation_year) return false
  if (!sameNonEmpty(normalize(candidate.last_name), normalize(existing.last_name))) return false
  return (
    similarFirstName(candidate, existing) ||
    sameNonEmpty(schoolKey(candidate.high_school), schoolKey(existing.high_school)) ||
    sameNonEmpty(normalize(candidate.club_team), normalize(existing.club_team))
  )
}

export function findLikelyDuplicates(candidate: DuplicateCandidate, pool: ExistingRecruit[]): DuplicateMatch[] {
  return pool
    .filter((r) => isLikelyDuplicate(candidate, r))
    .map((r) => ({
      id: r.id,
      name: `${r.first_name} ${r.last_name}`,
      graduation_year: r.graduation_year,
      high_school: r.high_school ?? null,
      stage: null,
    }))
}