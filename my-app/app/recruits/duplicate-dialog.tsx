'use client'

import { useEffect, useRef } from 'react'
import { DuplicateMatches } from '@/components/duplicate-matches'
import type { DuplicateMatch } from '@/lib/recruits/duplicates'

type Props = {
  matches: DuplicateMatch[]
  pending: boolean
  onClose: () => void
}

/**
 * F4 warning. Rendered INSIDE the recruit <form>, so "Create anyway" is a normal
 * submit button that resends everything the coach typed, plus intent=force.
 */
export function DuplicateDialog({ matches, pending, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog || dialog.open) return
    // showModal dims the page and traps focus. Test browsers (jsdom) lack it, so fall back to `open`.
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
  }, [])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="duplicate-title"
      className="w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl [color-scheme:light] backdrop:bg-slate-900/50"
    >
      <div className="space-y-4 p-5">
        <h2 id="duplicate-title" className="text-lg font-semibold">This recruit may already exist</h2>
        <p className="text-sm text-slate-600">
          {matches.length === 1 ? 'This recruit looks' : 'These recruits look'} similar. Open the existing record, or
          create a new one anyway.
        </p>
        <DuplicateMatches matches={matches} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Go back
          </button>
          <button
            type="submit"
            name="intent"
            value="force"
            disabled={pending}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:bg-amber-300"
          >
            {pending ? 'Saving…' : 'Create anyway'}
          </button>
        </div>
      </div>
    </dialog>
  )
}