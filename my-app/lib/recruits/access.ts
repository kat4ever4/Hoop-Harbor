import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasEnvVars } from '@/lib/utils'

// The database (Row Level Security) only hands recruit rows to a signed-in user
// who also has a row in `staff_members`. Anyone else gets an EMPTY list, not an error,
// so we check up front and tell the user why.
export type Access =
  | { state: 'not-configured' }
  | { state: 'signed-out' }
  | { state: 'not-staff'; email: string }
  | { state: 'staff'; email: string }

export async function getAccess(): Promise<Access> {
  await connection() // always check at request time, never bake the answer in at build time
  if (!hasEnvVars) return { state: 'not-configured' }
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims) return { state: 'signed-out' }
  const email = (claims.email as string | undefined) ?? 'your account'
  const { data: isStaff } = await supabase.rpc('is_hoop_harbor_staff')
  return isStaff ? { state: 'staff', email } : { state: 'not-staff', email }
}
