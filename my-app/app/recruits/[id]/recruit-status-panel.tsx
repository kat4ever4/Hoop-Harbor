import { createClient } from '@/lib/supabase/server'
import { stageByKey } from '@/lib/status/stages'
import type {
  RecruitStatus,
  StaffOption,
  Visit,
  VisitType,
} from '@/lib/status/types'
import { StatusSection } from './status-section'

type StaffRow = StaffOption & { is_active: boolean }

type HistoryRow = {
  action: string
  changed_at: string
  staff_name_at_change: string
  before_values: { pipeline_stage?: string } | null
  after_values: { pipeline_stage?: string } | null
}

const VISIT_TYPES = new Set<VisitType>([
  'official',
  'unofficial',
  'campus_tour',
  'home',
  'school',
  'other',
])

export async function RecruitStatusPanel({
  recruitId,
}: {
  recruitId: string
}) {
  const supabase = await createClient()

  const { data: staffId, error: authError } =
    await supabase.rpc('current_staff_id')

  if (authError || !staffId) {
    return (
      <p role="alert" className="text-sm text-amber-700">
        An active staff account is required to view recruiting status.
      </p>
    )
  }

  const [
    recruitRes,
    staffRes,
    historyRes,
    offersRes,
    visitsRes,
    schoolsRes,
  ] = await Promise.all([
    supabase
      .from('recruits')
      .select('pipeline_stage,usna_offer_date,usna_offered_by_staff_id')
      .eq('id', recruitId)
      .maybeSingle(),

    supabase
      .from('staff_members')
      .select('id,display_name,is_active')
      .order('display_name'),

    supabase
      .from('recruit_pipeline_history')
      .select('action,changed_at,staff_name_at_change,before_values,after_values')
      .eq('recruit_id', recruitId)
      .eq('entity_type', 'pipeline')
      .order('changed_at', { ascending: false })
      .limit(100),

    supabase
      .from('recruit_other_offers')
      .select('id,school,date_learned,source')
      .eq('recruit_id', recruitId)
      .is('archived_at', null)
      .order('date_learned', { ascending: false }),

    supabase
      .from('recruit_visits')
      .select('id,visit_type,visit_date,status')
      .eq('recruit_id', recruitId)
      .is('archived_at', null)
      .order('visit_date', { ascending: false }),

    supabase
      .from('schools')
      .select('name')
      .order('name'),
  ])

  if (
    !recruitRes.data ||
    recruitRes.error ||
    staffRes.error ||
    historyRes.error ||
    offersRes.error ||
    visitsRes.error ||
    schoolsRes.error
  ) {
    return (
      <p role="alert" className="text-sm text-red-700">
        Could not load recruiting status. Refresh and try again.
      </p>
    )
  }

  const staffRows = (staffRes.data ?? []) as StaffRow[]

  const staffNames = new Map(
    staffRows.map((s) => [s.id, s.display_name])
  )

  const history = (
    (historyRes.data ?? []) as HistoryRow[]
  ).find(
    (row) =>
      row.action === 'created' ||
      row.before_values?.pipeline_stage !==
        row.after_values?.pipeline_stage
  )

  const visits: Visit[] = (visitsRes.data ?? []).flatMap((row) => {
    if (
      !VISIT_TYPES.has(row.visit_type as VisitType) ||
      (row.status !== 'planned' && row.status !== 'completed')
    ) {
      return []
    }

    return [{
      id: row.id,
      visit_type: row.visit_type as VisitType,
      visit_date: row.visit_date,
      status: row.status as 'planned' | 'completed',
    }]
  })

  const status: RecruitStatus = {
    pipeline_stage:
      stageByKey(recruitRes.data.pipeline_stage)?.key ?? null,

    stage_changed_at: history?.changed_at ?? null,

    stage_changed_by:
      history?.staff_name_at_change ?? null,

    usna_offer_date: recruitRes.data.usna_offer_date,

    usna_offered_by:
      staffNames.get(
        recruitRes.data.usna_offered_by_staff_id ?? ''
      ) ?? null,

    other_offers: (offersRes.data ?? []).map((row) => ({
      id: row.id,
      school: row.school,
      date_learned: row.date_learned,
      source: row.source,
    })),

    visits,
  }

  return (
    <StatusSection
      recruitId={recruitId}
      status={status}
      staff={staffRows
        .filter((s) => s.is_active)
        .map(({ id, display_name }) => ({
          id,
          display_name,
        }))}
      schoolNames={(schoolsRes.data ?? []).map((s) => s.name)}
    />
  )
}
