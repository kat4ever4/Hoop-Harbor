import React from 'react';
import { StageKey, stageByKey } from '@/lib/status/stages'; // Adjust import path as needed

const COLORS: Record<string, string> = {
  slate: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-800',
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  red: 'bg-red-100 text-red-800',
};

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
  
  const { label, color } = stageData;
  const colorClass = COLORS[color] || COLORS.slate;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}
