'use client'

import { useState } from 'react'
import { EMPTY_WIZARD, STEPS, type StepIndex, type WizardState } from '@/lib/imports/types'

export function ImportWizard() {
  // All wizard data in one place, so Back never loses work.
  const [w, setW] = useState<WizardState>(EMPTY_WIZARD)
  const go = (step: StepIndex) => setW((prev) => ({ ...prev, step }))
  const last = (STEPS.length - 1) as StepIndex

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
        <p>{STEPS[w.step]} step goes here.</p>
      </section>

      {/* Temporary buttons so you can click through today */}
      <div className="flex justify-between">
        <button disabled={w.step === 0} onClick={() => go((w.step - 1) as StepIndex)}
          className="rounded-lg border px-4 py-2 disabled:opacity-40">Back</button>
        <button disabled={w.step === last} onClick={() => go((w.step + 1) as StepIndex)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-40">Next</button>
      </div>
    </div>
  )
}