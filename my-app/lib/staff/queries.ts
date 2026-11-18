import { createClient } from '@/lib/supabase/server'
import type { StaffOption } from './types'

export async function getStaffMemberById(staffId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_members')
    .select('id, display_name, role, is_active')
    .eq('id', staffId)
    .maybeSingle()

  if (error) {
    console.error("Error fetching staff member:", error.message)
    return null
  }

  return data
}

export async function listActiveStaff(): Promise<{ staff: StaffOption[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('staff_members')
    .select('id, display_name').eq('is_active', true).order('display_name')
  return { staff: data ?? [], error: error?.message }
}
