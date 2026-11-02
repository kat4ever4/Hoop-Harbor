// Turns the submitted form into database values, or a list of errors to show next to each field.
// Pure function (no database), so it is easy to unit test.

import { parseHeightToInches } from '@/lib/format-height'
import { POSITIONS, type GuardianContact, type RecruitValues } from './fields'

export type FieldErrors = Partial<Record<string, string>>

type FormLike = { get(name: string): FormDataEntryValue | null; getAll(name: string): FormDataEntryValue[] }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

function text(form: FormLike, name: string): string | null {
  const v = form.get(name)
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  return trimmed === '' ? null : trimmed
}

function lines(form: FormLike, name: string): string[] {
  return (text(form, name) ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function validPhone(p: string) {
  const digits = p.replace(/[^\d]/g, '')
  return /^[\d\s()+.-]+$/.test(p) && digits.length >= 10 && digits.length <= 15
}

export function parseRecruitForm(form: FormLike): { values: RecruitValues; errors: FieldErrors } {
  const errors: FieldErrors = {}

  const first_name = text(form, 'first_name')
  const last_name = text(form, 'last_name')
  if (!first_name) errors.first_name = 'First name is required.'
  if (!last_name) errors.last_name = 'Last name is required.'

  const yearText = text(form, 'graduation_year')
  let graduation_year: number | null = null
  if (!yearText) errors.graduation_year = 'Graduation year is required.'
  else if (!/^\d{4}$/.test(yearText) || Number(yearText) < 2000 || Number(yearText) > 2100)
    errors.graduation_year = 'Enter a 4-digit year, like 2028.'
  else graduation_year = Number(yearText)

  const heightText = text(form, 'height')
  let height_inches: number | null = null
  if (heightText) {
    height_inches = parseHeightToInches(heightText)
    if (height_inches === null || height_inches < 36 || height_inches > 96)
      errors.height = 'Enter height as feet-inches, like 5-10.'
  }

  const positions = form
    .getAll('positions')
    .filter((p): p is string => typeof p === 'string' && (POSITIONS as readonly string[]).includes(p))

  const recruit_email = text(form, 'recruit_email')
  if (recruit_email && !EMAIL.test(recruit_email)) errors.recruit_email = 'Enter a valid email address.'
  const recruit_phone = text(form, 'recruit_phone')
  if (recruit_phone && !validPhone(recruit_phone)) errors.recruit_phone = 'Enter a valid phone number.'

  const birthday = text(form, 'birthday')
  if (birthday && !DATE.test(birthday)) errors.birthday = 'Enter a valid date.'

  const guardian_contacts: GuardianContact[] = []
  for (const n of [1, 2]) {
    const g = {
      name: text(form, `guardian${n}_name`),
      relationship: text(form, `guardian${n}_relationship`),
      email: text(form, `guardian${n}_email`),
      phone: text(form, `guardian${n}_phone`),
    }
    if (!g.name && !g.relationship && !g.email && !g.phone) continue
    if (!g.name) errors[`guardian${n}_name`] = 'Add a name for this parent/guardian.'
    if (g.email && !EMAIL.test(g.email)) errors[`guardian${n}_email`] = 'Enter a valid email address.'
    if (g.phone && !validPhone(g.phone)) errors[`guardian${n}_phone`] = 'Enter a valid phone number.'
    guardian_contacts.push({ ...g, name: g.name ?? '' })
  }

  const video_links = lines(form, 'video_links')
  const profile_links = lines(form, 'profile_links')
  if (video_links.some((l) => !/^https?:\/\//i.test(l))) errors.video_links = 'Each link should start with http:// or https://'
  if (profile_links.some((l) => !/^https?:\/\//i.test(l))) errors.profile_links = 'Each link should start with http:// or https://'

  const values: RecruitValues = {
    first_name: first_name ?? '',
    last_name: last_name ?? '',
    preferred_name: text(form, 'preferred_name'),
    graduation_year,
    positions,
    height_inches,
    high_school: text(form, 'high_school'),
    city: text(form, 'city'),
    state_country: text(form, 'state_country'),
    club_team: text(form, 'club_team'),
    circuit: text(form, 'circuit'),
    age_group: text(form, 'age_group'),
    jersey_number: text(form, 'jersey_number'),
    recruit_email,
    recruit_phone,
    guardian_contacts,
    birthday,
    academic_information: text(form, 'academic_information'),
    video_links,
    profile_links,
    extra_notes: text(form, 'extra_notes'),
  }

  return { values, errors }
}
