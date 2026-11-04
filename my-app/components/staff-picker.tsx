'use client'

import { useId } from 'react'
import { inputClass } from '@/lib/form-styles'
import type { StaffOption } from '@/lib/staff/types'

type Props = {
  staff: StaffOption[]
  name?: string                         // form field name sent with the save
  label?: string
  value?: string                        // controlled: parent tracks the choice
  defaultValue?: string                 // uncontrolled: form tracks the choice
  onChange?: (id: string) => void
  error?: string
  disabled?: boolean
}

export function StaffPicker({
  staff,
  name = 'staff_id',
  label = 'Entered by',
  value,
  defaultValue,
  onChange,
  error,
  disabled,
}: Props) {
  const id = useId()                    // unique per picker, even with several on one page

  if (staff.length === 0) {
    return (
      <p className="text-sm text-amber-800">
        No active staff names. Ask an admin to add one.
      </p>
    )
  }

  // Use value OR defaultValue, never both (React warns otherwise).
  const valueProps = value !== undefined ? { value } : { defaultValue: defaultValue ?? '' }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <select
        id={id}
        name={name}
        {...valueProps}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        required
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass}
      >
        <option value="" disabled>Choose…</option>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>{s.display_name}</option>
        ))}
      </select>
      {error && <p id={`${id}-error`} className="text-sm text-red-600">{error}</p>}
    </div>
  )
}