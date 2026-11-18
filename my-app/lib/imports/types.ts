// Shapes the import wizard shares with the backend (agree on these at the day-1 meeting).

export const STEPS = ['Upload', 'Map columns', 'Preview', 'Commit', 'Summary'] as const
export type StepIndex = 0 | 1 | 2 | 3 | 4

export type PreviewRow = {
  rowNumber: number
  status: 'new' | 'duplicate' | 'error'
  values: Record<string, string>
  reason?: string
  match?: { id: string; name: string; gradYear: number | null; school: string | null }
}

export type PreviewResult = {
  counts: { new: number; duplicate: number; error: number }
  rows: PreviewRow[]
  previewId?: string
}

export type CommitResult = {
  batchId: string
  created: number
  skipped: number
  errors: number
}

/** Everything the coach has done so far. Lives in ONE place so Back never loses work. */
export type WizardState = {
  step: StepIndex
  file: File | null
  headers: string[]                                  // the CSV's first row
  mapping: Record<string, string>                    // CSV header -> field name or 'ignore'
  preview: PreviewResult | null
  duplicateChoices: Record<number, 'skip' | 'create'> // rowNumber -> choice
  summary: CommitResult | null
}

export const EMPTY_WIZARD: WizardState = {
  step: 0, file: null, headers: [], mapping: {},
  preview: null, duplicateChoices: {}, summary: null,
}


export const REQUIRED_FIELDS = ['first_name', 'last_name', 'graduation_year'] as const