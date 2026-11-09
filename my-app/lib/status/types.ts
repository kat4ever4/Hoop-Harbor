import type { StageKey } from './stages'

export type StaffOption = { id: string; display_name: string }

export type OtherOffer = {
  id: string
  school: string                 // free text for now (no school list yet)
  date_learned: string
  source: string | null
}

export type VisitType = 'official' | 'unofficial' | 'campus_tour' | 'home' | 'school' | 'other'
export type Visit = {
  id: string
  visit_type: VisitType
  visit_date: string
  status: 'planned' | 'completed'   // no 'cancelled' yet
}

export type RecruitStatus = {
  pipeline_stage: StageKey | null
  stage_changed_at: string | null    // from newest pipeline history row
  stage_changed_by: string | null    // staff_name_at_change from that row
  usna_offer_date: string | null
  usna_offered_by: string | null     // display name of usna_offered_by_staff_id
  other_offers: OtherOffer[]         // only rows where archived_at IS NULL
  visits: Visit[]                    // only rows where archived_at IS NULL
}

