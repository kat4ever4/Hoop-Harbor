import { createClient } from '@/lib/supabase/server'
import type { Recruit } from './fields'
import type { RecruitStatus, StaffOption } from '@/lib/status/types'
import type { RecruitNote } from './notes'

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

export async function getStaffOptions(): Promise<StaffOption[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_members') // replace with your actual staff/profiles table name
    .select('id, display_name') // match the fields in your StaffOption type
    .order('display_name', { ascending: true })
  
  if (error) throw error
    return data ?? []
export async function listRecruitNotes(id: string): Promise<{ notes: RecruitNote[]; error?: string }> {
  if (!UUID.test(id)) return { notes: [] }
  const supabase = await createClient()
  const { data, error } = await supabase.from('recruit_notes')
    .select('id, title, body, note_type, occurred_at, author:staff_members!author_id(display_name)')
    .eq('recruit_id', id).order('occurred_at', { ascending: false }).order('created_at', { ascending: false })
  // Supabase's ungenerated schema types infer embedded relations as arrays.
  return { notes: (data ?? []) as unknown as RecruitNote[], error: error?.message }
}
