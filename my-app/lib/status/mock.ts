//Delete once real data available (mock data usage)
import type { RecruitStatus, StaffOption } from './types';

export const MOCK_STAFF_OPTIONS: StaffOption[] = [
  { id: 'staff-1', display_name: 'Dana Mercer' },
  { id: 'staff-2', display_name: 'Robin Ellis' },
  { id: 'staff-3', display_name: 'Casey Rowan' },
];

export const MOCK_RECRUIT_STATUS: RecruitStatus = {
  pipeline_stage: 'priority',
  stage_changed_at: '2026-10-15T14:30:00Z',
  stage_changed_by: 'Dana Mercer',
  usna_offer_date: '2026-10-20',
  usna_offered_by: 'Casey Rowan',
  other_offers: [
    {
      id: 'offer-1',
      school: 'Army West Point',
      date_learned: '2026-09-10',
      source: 'High School Coach',
    },
    {
      id: 'offer-2',
      school: 'Air Force',
      date_learned: '2026-10-01',
      source: 'Twitter Announcement',
    },
  ],
  visits: [
    {
      id: 'visit-1',
      visit_type: 'unofficial',
      visit_date: '2026-05-14',
      status: 'completed',
    },
    {
      id: 'visit-2',
      visit_type: 'home',
      visit_date: '2026-11-02', // Planned visit dated yesterday
      status: 'planned',
    },
  ],
};
