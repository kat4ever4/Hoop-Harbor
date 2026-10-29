import { createClient } from '@/lib/supabase/server'
import type { Recruit } from './fields'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type RecruitListItem = Pick<
  Recruit,
  'id' | 'first_name' | 'last_name' | 'preferred_name' | 'graduation_year' | 'positions' | 'high_school' | 'club_team'
>

export async function listRecruits(): Promise<{ recruits: RecruitListItem[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('recruits')
    .select('id, first_name, last_name, preferred_name, graduation_year, positions, high_school, club_team')
    .order('last_name')
    .order('first_name')
  return { recruits: (data ?? []) as RecruitListItem[], error: error?.message }
}

/** Returns null when the id is not a real recruit (including ids like "999999"). */
export async function getRecruit(id: string): Promise<Recruit | null> {
  if (!UUID.test(id)) return null
  const supabase = await createClient()
  const { data } = await supabase.from('recruits').select('*').eq('id', id).maybeSingle()
  return (data as Recruit | null) ?? null
}
