// F5 Map step logic. Pure functions (no React), so Vitest can test them directly.
import { FIELD_LABELS } from '@/lib/recruits/fields'
import { REQUIRED_FIELDS } from './types'

export const IGNORE = 'ignore'

/** Every recruit field a column can map to, in form order. */
export const FIELD_OPTIONS = Object.entries(FIELD_LABELS).map(([value, label]) => ({ value, label }))

/** "Grad Year", "grad_year", "GRAD-YEAR" -> "gradyear" */
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

// Extra names coaches' sheets might use. Add more as real sheets show up.
const ALIASES: Record<string, string[]> = {
  first_name: ['first', 'firstname', 'fname'],
  last_name: ['last', 'lastname', 'lname', 'surname'],
  preferred_name: ['nickname', 'goesby'],
  graduation_year: ['grad', 'gradyear', 'class', 'classyear', 'hsgrad', 'year'],
  positions: ['position', 'pos'],
  height_inches: ['height', 'ht'],
  high_school: ['school', 'hs', 'highschool'],
  state_country: ['state', 'country'],
  club_team: ['club', 'aau', 'travelteam', 'team'],
  jersey_number: ['jersey', 'number', 'no'],
  recruit_email: ['email'],
  recruit_phone: ['phone', 'cell'],
}

/** Best-guess field for one CSV header, or 'ignore' if nothing fits. */
export function guessField(header: string): string {
  const h = squash(header)
  if (!h) return IGNORE
  for (const { value, label } of FIELD_OPTIONS) {
    if (h === squash(value) || h === squash(label)) return value
  }
  for (const [field, names] of Object.entries(ALIASES)) {
    if (names.includes(h)) return field
  }
  return IGNORE
}

/** Guess every header, but never map two headers to the same field (first one wins). */
export function autoMap(headers: string[]): Record<string, string> {
  const used = new Set<string>()
  const mapping: Record<string, string> = {}
  for (const header of headers) {
    const field = guessField(header)
    if (field !== IGNORE && !used.has(field)) {
      mapping[header] = field
      used.add(field)
    } else {
      mapping[header] = IGNORE
    }
  }
  return mapping
}

/** Labels of required fields no column is mapped to yet. Empty = OK to continue. */
export function missingRequired(mapping: Record<string, string>): string[] {
  const mapped = new Set(Object.values(mapping))
  return REQUIRED_FIELDS.filter((f) => !mapped.has(f)).map((f) => FIELD_LABELS[f])
}

/** Fields picked by more than one column. */
export function duplicateTargets(mapping: Record<string, string>): string[] {
  const seen = new Map<string, number>()
  for (const f of Object.values(mapping)) if (f !== IGNORE) seen.set(f, (seen.get(f) ?? 0) + 1)
  return [...seen].filter(([, n]) => n > 1).map(([f]) => FIELD_LABELS[f as keyof typeof FIELD_LABELS] ?? f)
}