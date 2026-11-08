import type { createClient } from '@/lib/supabase/server'
import { findLikelyDuplicates, type DuplicateCandidate, type DuplicateMatch } from './duplicates'

type Supabase = Awaited<ReturnType<typeof createClient>>

/**
 * Looks for recruits that may be the same player as `candidate`.
 * Only recruits with the same graduation year are fetched (a small list), then
 * the F4 rule in duplicates.ts decides. If the lookup fails, it returns no
 * matches so the warning never stops a coach from saving.
 */
export async function findPossibleDuplicates(supabase: Supabase, candidate: DuplicateCandidate): Promise<DuplicateMatch[]> {
  if (candidate.graduation_year == null) return []
  const { data, error } = await supabase
    .from('recruits')
    .select('id, first_name, last_name, preferred_name, graduation_year, high_school, club_team')
    .eq('graduation_year', candidate.graduation_year)
  if (error || !data) return []
  return findLikelyDuplicates(candidate, data)
}