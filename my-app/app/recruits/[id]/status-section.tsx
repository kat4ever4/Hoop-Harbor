// my-app/app/recruits/[id]/status-section.tsx
'use client';

import React, { useState } from 'react';
import type { RecruitStatus, StaffOption, VisitType } from '@/lib/status/types';
import { STAGES } from '@/lib/status/stages';
import { StageBadge } from '@/components/stage-badge';

// Copied from app/recruits/[id]/page.tsx as requested
function when(dateString: string | null) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateOnly(dateString: string | null) {
  if (!dateString) return '';
  const d = new Date(dateString);
  // Adjust for timezone offset to prevent date shifting
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString();
}

const VISIT_LABELS: Record<VisitType, string> = {
  official: 'Official visit',
  unofficial: 'Unofficial visit',
  campus_tour: 'Campus tour',
  home: 'Home visit',
  school: 'School visit',
  other: 'Other',
};

interface StatusSectionProps {
  recruitId: string;
  status: RecruitStatus;
  staff: StaffOption[];
}

export function StatusSection({ recruitId, status, staff }: StatusSectionProps) {
  // 4a. Status Card State
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [selectedStage, setSelectedStage] = useState(status.pipeline_stage || '');
  const [stageStaffId, setStageStaffId] = useState('');

  // 4b. USNA Offer State
  const [isAddingUsnaOffer, setIsAddingUsnaOffer] = useState(false);
  const [usnaDate, setUsnaDate] = useState('');
  const [usnaStaffId, setUsnaStaffId] = useState('');

  // 4c. Other Offers State
  const [isAddingOtherOffer, setIsAddingOtherOffer] = useState(false);
  const [otherSchool, setOtherSchool] = useState('');
  const [otherDate, setOtherDate] = useState('');
  const [otherSource, setOtherSource] = useState('');
  const [otherStaffId, setOtherStaffId] = useState('');

  // 4d. Visits State
  const [isAddingVisit, setIsAddingVisit] = useState(false);
  const [visitType, setVisitType] = useState<VisitType | ''>('');
  const [visitDate, setVisitDate] = useState('');
  const [visitStatus, setVisitStatus] = useState<'planned' | 'completed'>('planned');
  const [visitStaffId, setVisitStaffId] = useState('');

  return (
    <div className="space-y-6">
      {/* 4a. Status Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stage</h2>
        
        {!isEditingStage ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="scale-110 origin-left mb-2">
                <StageBadge stage={status.pipeline_stage} />
              </div>
              <p className="text-sm text-gray-500">
                Changed {status.stage_changed_by ? `by ${status.stage_changed_by}` : ''} 
                {status.stage_changed_at ? ` · ${when(status.stage_changed_at)}` : ''}
              </p>
            </div>
            <button 
              onClick={() => setIsEditingStage(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Change stage
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 p-4 rounded-md">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="block w-full sm:w-auto rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="" disabled>Select stage...</option>
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>

            <select
              value={stageStaffId}
              onChange={(e) => setStageStaffId(e.target.value)}
              className="block w-full sm:w-auto rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="" disabled>Select staff member...</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.display_name}</option>
              ))}
            </select>

            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                disabled={!selectedStage || !stageStaffId}
                onClick={() => {
                  // TODO(F3): send pipeline_stage: selectedStage, pipeline_changed_by_staff_id: stageStaffId
                  setIsEditingStage(false);
                }}
                className="flex-1 sm:flex-none rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingStage(false)}
                className="flex-1 sm:flex-none rounded bg-white px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4b. USNA Offer */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">USNA Offer</h2>
        
        {status.usna_offer_date && !isAddingUsnaOffer ? (
          <div className="text-sm text-gray-900">
            <span className="font-medium">Offered on {formatDateOnly(status.usna_offer_date)}</span>
            {status.usna_offered_by && <span className="text-gray-500"> by {status.usna_offered_by}</span>}
          </div>
        ) : !isAddingUsnaOffer ? (
          <div>
            <p className="text-sm text-gray-500 mb-3">No USNA offer yet</p>
            <button 
              onClick={() => setIsAddingUsnaOffer(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + Add USNA offer
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 p-4 rounded-md">
            <input
              type="date"
              value={usnaDate}
              onChange={(e) => setUsnaDate(e.target.value)}
              className="block w-full sm:w-auto rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <select
              value={usnaStaffId}
              onChange={(e) => setUsnaStaffId(e.target.value)}
              className="block w-full sm:w-auto rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="" disabled>Select staff member...</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.display_name}</option>
              ))}
            </select>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                disabled={!usnaDate || !usnaStaffId}
                onClick={() => {
                  // TODO(F3): send usna_offer_date: usnaDate, usna_offered_by_staff_id: usnaStaffId
                  setIsAddingUsnaOffer(false);
                }}
                className="flex-1 sm:flex-none rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setIsAddingUsnaOffer(false)}
                className="flex-1 sm:flex-none rounded bg-white px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4c. Other Schools' Offers */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Other Offers</h2>
          <button onClick={() => setIsAddingOtherOffer(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            + Add offer
          </button>
        </div>

        {status.other_offers.length > 0 ? (
          <>
            {/* Desktop Table */}
            <table className="hidden sm:table min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date Learned</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {status.other_offers.map((offer) => (
                  <tr key={offer.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{offer.school}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateOnly(offer.date_learned)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{offer.source || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Stacked Cards */}
            <div className="sm:hidden flex flex-col gap-3">
              {status.other_offers.map((offer) => (
                <div key={offer.id} className="border border-gray-200 rounded-md p-3 bg-white">
                  <div className="font-medium text-gray-900 mb-1">{offer.school}</div>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>{formatDateOnly(offer.date_learned)}</span>
                    {offer.source && <span>Source: {offer.source}</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 italic">No other offers recorded</p>
        )}
      </div>

      {/* 4d. Visits */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Visits</h2>
          <button onClick={() => setIsAddingVisit(true)} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            + Add visit
          </button>
        </div>

        {status.visits.length > 0 ? (
          <>
            <table className="hidden sm:table min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {status.visits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{VISIT_LABELS[visit.visit_type]}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateOnly(visit.visit_date)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${visit.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="sm:hidden flex flex-col gap-3">
              {status.visits.map((visit) => (
                <div key={visit.id} className="border border-gray-200 rounded-md p-3 bg-white flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{VISIT_LABELS[visit.visit_type]}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{formatDateOnly(visit.visit_date)}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${visit.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {visit.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 italic">No visits recorded</p>
        )}
      </div>

      {/* Dialog for Adding Other Offer */}
      {isAddingOtherOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Add Other School Offer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                <input 
                  type="text" 
                  value={otherSchool} 
                  onChange={(e) => setOtherSchool(e.target.value)}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. University of Connecticut"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Learned</label>
                <input 
                  type="date" 
                  value={otherDate} 
                  onChange={(e) => setOtherDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <input 
                  type="text" 
                  value={otherSource} 
                  onChange={(e) => setOtherSource(e.target.value)}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. Twitter, AAU coach"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Added by</label>
                <select
                  value={otherStaffId}
                  onChange={(e) => setOtherStaffId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="" disabled>Select staff member...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.display_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddingOtherOffer(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                disabled={!otherSchool || !otherDate || !otherStaffId}
                onClick={() => {
                  // TODO(F3): Insert into recruit_other_offers_v2 with changed_by_staff_id
                  setIsAddingOtherOffer(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Save Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for Adding Visit */}
      {isAddingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Add Visit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  value={visitType} 
                  onChange={(e) => setVisitType(e.target.value as VisitType)}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="" disabled>Select visit type...</option>
                  {(Object.keys(VISIT_LABELS) as VisitType[]).map(key => (
                    <option key={key} value={key}>{VISIT_LABELS[key]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  value={visitDate} 
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={visitStatus} 
                  onChange={(e) => setVisitStatus(e.target.value as 'planned' | 'completed')}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Added by</label>
                <select
                  value={visitStaffId}
                  onChange={(e) => setVisitStaffId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="" disabled>Select staff member...</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>{s.display_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddingVisit(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                disabled={!visitType || !visitDate || !visitStaffId}
                onClick={() => {
                  // TODO(F3): Insert into recruit_visits_v2 with changed_by_staff_id
                  setIsAddingVisit(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Save Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
