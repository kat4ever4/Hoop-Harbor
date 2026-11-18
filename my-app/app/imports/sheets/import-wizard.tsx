'use client'

import { useState } from 'react'
import { EMPTY_WIZARD, STEPS, type StepIndex, type WizardState } from '@/lib/imports/types'
import { UploadStep } from './upload-step'
import { MapStep, mapStepReady } from './map-step'
import { PreviewStep } from './preview-step'
import { CommitStep } from './commit-step'
import { SummaryStep } from './summary-step'

export function ImportWizard() {
  // All wizard data in one place, so Back never loses work.
  const [w, setW] = useState<WizardState>(EMPTY_WIZARD)
  const update = (changes: Partial<WizardState>) => setW((prev) => ({ ...prev, ...changes }))
  const go = (step: StepIndex) => update({ step })
  const last = (STEPS.length - 1) as StepIndex

  // Can the coach leave this step yet?
  const canNext =
    w.step === 0 ? w.file !== null && w.headers.length > 0
    : w.step === 1 ? mapStepReady(w)
    : w.step === 2 ? w.preview !== null
    : false // Commit uses its own Import button; Summary is the end

  return (
    <div className="flex flex-col gap-6">
      {/* Step bar */}
      <ol className="flex gap-2 text-xs sm:text-sm">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === w.step ? 'step' : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-center sm:flex-row sm:gap-1 ${
              i === w.step ? 'bg-blue-600 font-semibold text-white'
                : i < w.step ? 'bg-blue-100 text-blue-800' : 'bg-slate-200'
            }`}
          >
            <span className="font-semibold">{i + 1}.</span>
            <span className="leading-tight">{label}</span>
          </li>
        ))}
      </ol>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {w.step === 0 && <UploadStep w={w} update={update} />}
        {w.step === 1 && <MapStep w={w} update={update} />}
        {w.step === 2 && <PreviewStep w={w} update={update} />}
        {w.step === 3 && <CommitStep w={w} update={update} />}
        {w.step === 4 && <SummaryStep w={w} onStartOver={() => setW(EMPTY_WIZARD)} />}
      </section>

      <div className="flex justify-between">
        {/* After importing, there's no going back: Undo (Friday) is the way to reverse it. */}
        <button disabled={w.step === 0 || w.step === last} onClick={() => go((w.step - 1) as StepIndex)}
          className="rounded-lg border px-4 py-2 disabled:opacity-40">Back</button>
        {w.step < 3 && (
          <button disabled={!canNext} onClick={() => go((w.step + 1) as StepIndex)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-40">Next</button>
        )}
      </div>
    </div>
  )
}