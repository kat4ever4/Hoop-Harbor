import { createClient } from '@/lib/supabase/server'

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
