import { createClient } from '@/lib/supabase/server'
import type { Recruit } from './fields'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type RecruitListItem = Pick<
  Recruit,
  'id' | 'first_name' | 'last_name' | 'preferred_name' | 'graduation_year' | 'positions' | 'high_school' | 'club_team' | 'pipeline_stage'
>

export async function listRecruits(): Promise<{ recruits: RecruitListItem[]; error?: string }> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('recruits')
    .select('id, first_name, last_name, preferred_name, graduation_year, positions, high_school, club_team, pipeline_stage')
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

export async function getRecruitStatus(id: string): Promise<RecruitStatus | null> {
  if (!UUID.test(id)) return null
  const supabase = await createClient()

  const { data } = await supabase
    .from('recruits')
    .select(`
      pipeline_stage,
      usna_offer_date,
      usna_offered_by_staff_id,
      pipeline_changed_by_staff_id,
      other_offers:recruit_other_offers(id, school, date_learned, source, changed_by_staff_id),
      visits:recruit_visits(id, visit_type, visit_date, status, changed_by_staff_id),
      pipeline_history:recruit_pipeline_history(id, changed_at, staff_name_at_change, action).order('changed_at', { ascending: false }).limit(1)
    `)
    .eq('id', id)
    .maybeSingle()

  return (data as RecruitStatus | null) ?? null
}
