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
  changed_by_staff_id?: string | null;
}

export interface PipelineHistoryItem {
  id: string;
  changed_at: string;
  staff_name_at_change: string | null;
  action: string;
}

export interface RecruitStatus {
  pipeline_stage: string | null;
  usna_offer_date: string | null;
  usna_offered_by_staff_id: string | null; // <-- Replaces usna_offered_by
  pipeline_changed_by_staff_id?: string | null;
  other_offers: OtherOffer[];
  visits: Visit[];
  pipeline_history?: PipelineHistoryItem[]; // <-- Add this array
}

