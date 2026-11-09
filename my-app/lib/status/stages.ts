export const STAGES = [
  { key: 'identified',          label: 'Identified',          color: 'slate'  },
  { key: 'evaluating',          label: 'Evaluating',          color: 'purple' },
  { key: 'priority',            label: 'Priority',            color: 'amber'  },
  { key: 'offered',             label: 'Offered',             color: 'blue'   },
  { key: 'committed_to_usna',   label: 'Committed to USNA',   color: 'green'  },
  { key: 'committed_elsewhere', label: 'Committed Elsewhere', color: 'red'    },
  { key: 'not_pursuing',        label: 'Not Pursuing',        color: 'slate'  },
  { key: 'to_be_confirmed',     label: 'To be confirmed',     color: 'slate'  },
] as const

export type StageKey = (typeof STAGES)[number]['key']
export const stageByKey = (k: string | null) => STAGES.find((s) => s.key === k) ?? null

