'use client'

import { inputClass } from '@/lib/form-styles'
import { duplicateTargets, FIELD_OPTIONS, IGNORE, missingRequired } from '@/lib/imports/mapping'
import { REQUIRED_FIELDS, type WizardState } from '@/lib/imports/types'

type Props = {
  w: WizardState
  update: (changes: Partial<WizardState>) => void
}

const REQUIRED = new Set<string>(REQUIRED_FIELDS)

export function MapStep({ w, update }: Props) {
  const missing = missingRequired(w.mapping)
  const doubled = duplicateTargets(w.mapping)

  const setField = (header: string, field: string) =>
    update({ mapping: { ...w.mapping, [header]: field }, preview: null })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-600">
        Match each column in your sheet to a recruit field. We guessed where we could. Required fields are marked *.
      </p>

      <ul className="flex flex-col divide-y divide-slate-200">
        {w.headers.map((header) => (
          // Phone: column name above its dropdown. Wider: side by side.
          <li key={header} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
            <label htmlFor={`map-${header}`} className="font-medium text-slate-800 sm:w-1/3">
              {header}
            </label>
            <select
              id={`map-${header}`}
              value={w.mapping[header] ?? IGNORE}
              onChange={(e) => setField(header, e.target.value)}
              className={`${inputClass} sm:flex-1`}
            >
              <option value={IGNORE}>— Don’t import —</option>
              {FIELD_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}{REQUIRED.has(f.value) ? ' *' : ''}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      {missing.length > 0 && (
        <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Still needed: {missing.join(', ')}.
        </p>
      )}
      {doubled.length > 0 && (
        <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          More than one column is set to: {doubled.join(', ')}. Pick one.
        </p>
      )}
    </div>
  )
}

/** The wizard uses this to enable/disable Next on the Map step. */
export function mapStepReady(w: WizardState) {
  return missingRequired(w.mapping).length === 0 && duplicateTargets(w.mapping).length === 0
}