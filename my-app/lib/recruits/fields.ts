// One place that describes a recruit. Change the position list here to reuse the app for another team.

export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const

export type GuardianContact = {
  name: string
  relationship: string | null
  email: string | null
  phone: string | null
}

/** The columns a coach can edit, in the same shape as the `recruits` table. */
export type RecruitValues = {
  first_name: string
  last_name: string
  preferred_name: string | null
  graduation_year: number | null
  positions: string[]
  height_inches: number | null
  high_school: string | null
  city: string | null
  state_country: string | null
  club_team: string | null
  circuit: string | null
  age_group: string | null
  jersey_number: string | null
  recruit_email: string | null
  recruit_phone: string | null
  guardian_contacts: GuardianContact[]
  birthday: string | null
  academic_information: string | null
  video_links: string[]
  profile_links: string[]
  extra_notes: string | null
}

export type Recruit = RecruitValues & {
  id: string
  created_at: string
  updated_at: string
}

export const EDITABLE_COLUMNS = [
  'first_name', 'last_name', 'preferred_name', 'graduation_year', 'positions',
  'height_inches', 'high_school', 'city', 'state_country', 'club_team', 'circuit',
  'age_group', 'jersey_number', 'recruit_email', 'recruit_phone', 'guardian_contacts',
  'birthday', 'academic_information', 'video_links', 'profile_links', 'extra_notes',
] as const satisfies readonly (keyof RecruitValues)[]

/** Friendly names used in error and conflict messages. */
export const FIELD_LABELS: Record<keyof RecruitValues, string> = {
  first_name: 'First name',
  last_name: 'Last name',
  preferred_name: 'Preferred name',
  graduation_year: 'Graduation year',
  positions: 'Position(s)',
  height_inches: 'Height',
  high_school: 'High school',
  city: 'City',
  state_country: 'State/Country',
  club_team: 'Club or travel team',
  circuit: 'Circuit',
  age_group: 'Age group',
  jersey_number: 'Jersey number',
  recruit_email: 'Recruit email',
  recruit_phone: 'Recruit phone',
  guardian_contacts: 'Parents/guardians',
  birthday: 'Birthday',
  academic_information: 'Academic information',
  video_links: 'Video links',
  profile_links: 'Profile links',
  extra_notes: 'Extra notes',
}

export function fullName(r: Pick<RecruitValues, 'first_name' | 'last_name' | 'preferred_name'>) {
  return r.preferred_name
    ? `${r.first_name} "${r.preferred_name}" ${r.last_name}`
    : `${r.first_name} ${r.last_name}`
}

export function pickEditable(row: Record<string, unknown>): RecruitValues {
  const out: Record<string, unknown> = {}
  for (const col of EDITABLE_COLUMNS) out[col] = row[col] ?? null
  return out as RecruitValues
}

/** Which editable fields differ between two versions of a recruit. */
export function changedFields(a: RecruitValues, b: RecruitValues): (keyof RecruitValues)[] {
  return EDITABLE_COLUMNS.filter((col) => JSON.stringify(a[col] ?? null) !== JSON.stringify(b[col] ?? null))
}
