'use client'

import { Star } from 'lucide-react'

type Props = { value: number | null; onChange?: (v: number | null) => void; label?: string }

const STARS = [1, 2, 3, 4, 5]

export function StarRating({ value, onChange, label = 'Rating' }: Props) {
  const filled = (i: number) => value != null && i <= value

  if (!onChange) {
    if (value == null) return null
    return (
      <span className="flex" aria-label={`${value} out of 5`}>
        {STARS.map((i) => (
          <Star key={i} aria-hidden className={`h-4 w-4 ${filled(i) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        ))}
      </span>
    )
  }

  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {STARS.map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          onClick={() => onChange(value === i ? null : i)}
          className="rounded-md p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Star className={`h-6 w-6 ${filled(i) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        </button>
      ))}
    </div>
  )
}