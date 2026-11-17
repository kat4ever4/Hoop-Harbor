import { Check } from 'lucide-react'
import { STEPS, type StepIndex } from '@/lib/imports/types'

export function StepIndicator({ current }: { current: StepIndex }) {
  return (
    <>
      {/* Phone: one short line, because five labels won't fit. */}
      <p className="mb-4 text-sm font-medium text-slate-600 sm:hidden">
        Step {current + 1} of {STEPS.length} · <span className="text-slate-900">{STEPS[current]}</span>
      </p>

      {/* Wider screens: all five steps in a row. */}
      <ol className="mb-6 hidden items-center gap-2 sm:flex">
        {STEPS.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={label} aria-current={active ? 'step' : undefined} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done ? 'bg-indigo-600 text-white' : active ? 'border-2 border-indigo-600 text-indigo-700' : 'border border-slate-300 text-slate-400'
                }`}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
              </span>
              <span className={`text-sm ${active ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                {label}
                {done && <span className="sr-only"> (done)</span>}
              </span>
              {i < STEPS.length - 1 && <span aria-hidden className="h-px flex-1 bg-slate-200" />}
            </li>
          )
        })}
      </ol>
    </>
  )
}