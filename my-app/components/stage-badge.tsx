import React from 'react';
import { StageKey, stageByKey } from '@/lib/status/stages'; // Adjust import path as needed

export function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'identified':
      return 'bg-blue-500 text-white border-blue-600'
    case 'evaluating':
      return 'bg-yellow-500 text-white border-yellow-600'
    case 'priority':
      return 'bg-purple-500 text-white border-purple-600'
    case 'offered':
      return 'bg-emerald-500 text-white border-emerald-600'
    case 'committed to usna':
      return 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300'
    case 'committed elsewhere':
      return 'bg-slate-500 text-white border-slate-600'
    case 'not pursuing':
      return 'bg-red-500 text-white border-red-600'
    case 'to be confirmed':
    default:
      return 'bg-slate-300 text-slate-700 border-slate-400'
  }
}

interface StageBadgeProps {
  stage: StageKey | null;
}

export function StageBadge({ stage }: StageBadgeProps) {
  if (!stage) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        —
      </span>
    );
  }

  const stageData = stageByKey(stage);
  if (!stageData) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        —
      </span>
    );
  }
  
  const { label } = stageData;
  const colorClass = getStatusColor(label);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {label}
    </span>
  );
}
