import type { createClient } from '@/lib/supabase/server'
import {
  findLikelyDuplicates,
  type DuplicateCandidate,
  type DuplicateMatch,
} from './duplicates'

type Supabase = Awaited<ReturnType<typeof createClient>>

type DuplicateRow = {
  id: string
  first_name: string
  last_name: string
  graduation_year: number | null
  high_school: string | null
  pipeline_stage: string | null
}

export type DuplicateLookupResult = {
  matches: DuplicateMatch[]
  error: string | null
}

export async function findPossibleDuplicates(
  supabase: Supabase,
  candidate: DuplicateCandidate,
): Promise<DuplicateLookupResult> {
  if (candidate.graduation_year == null) {
    return { matches: [], error: null }
  }

  const [rpcResult, listResult] = await Promise.all([
    supabase.rpc('find_possible_duplicates', {
      p_first: candidate.first_name,
      p_last: candidate.last_name,
      p_grad_year: candidate.graduation_year,
      p_school: candidate.high_school ?? null,
      p_club: candidate.club_team ?? null,
    }),
    supabase
      .from('recruits')
      .select(
        'id, first_name, last_name, preferred_name, graduation_year, high_school, club_team'
      )
      .eq('graduation_year', candidate.graduation_year),
  ])

  if (
    rpcResult.error ||
    !rpcResult.data ||
    listResult.error ||
    !listResult.data
  ) {
    return {
      matches: [],
      error: 'Could not check for duplicate recruits. Please try again.',
    }
  }

  const matches = new Map<string, DuplicateMatch>()

  // Retain preferred-name and school-normalization matching.
  for (const match of findLikelyDuplicates(candidate, listResult.data)) {
    matches.set(match.id, match)
  }

  // Include matches returned by the SQL duplicate finder.
  for (const row of rpcResult.data as DuplicateRow[]) {
    matches.set(row.id, {
      id: row.id,
      name: `${row.first_name} ${row.last_name}`,
      graduation_year: row.graduation_year,
      high_school: row.high_school,
      stage: row.pipeline_stage ?? null,
    })
  }

  return {
    matches: [...matches.values()],
    error: null,
  }
}
