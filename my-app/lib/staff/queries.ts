import { createClient } from '@/lib/supabase/server'
import type { StaffOption } from './types'

export async function listActiveStaff(): Promise<{ staff: StaffOption[]; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('staff_members')
    .select('id, display_name').eq('is_active', true).order('display_name')
  return { staff: data ?? [], error: error?.message }
}
