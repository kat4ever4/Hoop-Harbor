'use client'

import Link from 'next/link'
import { startTransition, useActionState, type FormEvent, type ReactNode } from 'react'
import { createRecruit, updateRecruit, type FormState } from './actions'
import { POSITIONS, type Recruit } from '@/lib/recruits/fields'
import { inchesToInput } from '@/lib/format-height'
import { pickEditable } from '@/lib/recruits/fields'

const inputClass =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 aria-[invalid=true]:border-red-500'

function Field({
  name, label, error, children,
}: { name: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p id={`${name}-error`} className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <legend className="px-1 text-sm font-bold uppercase tracking-wider text-slate-500">{title}</legend>
      {/* One column on phones, two on wider screens */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

export function RecruitForm({ recruit }: { recruit?: Recruit }) {
  const editing = !!recruit
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    editing ? updateRecruit : createRecruit,
    {},
  )
  const e = state.errors ?? {}

  // Submit manually so the browser keeps what the coach typed when there is an error.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const data = new FormData(event.currentTarget, submitter)
    startTransition(() => formAction(data))
  }

  const t = (name: string, label: string, value: string | number | null | undefined, extra: object = {}) => (
    <Field name={name} label={label} error={e[name]}>
      <input
        id={name}
        name={name}
        defaultValue={value ?? ''}
        aria-invalid={!!e[name]}
        aria-describedby={e[name] ? `${name}-error` : undefined}
        className={inputClass}
        {...extra}
      />
    </Field>
  )
  const g = recruit?.guardian_contacts ?? []

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {editing && (
        <>
          <input type="hidden" name="id" value={recruit.id} />
          <input type="hidden" name="updated_at" value={state.conflict?.updatedAt ?? recruit.updated_at} />
          <input type="hidden" name="original" value={JSON.stringify(pickEditable(recruit))} />
        </>
      )}

      {state.formError && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">{state.formError}</div>
      )}
      {Object.keys(e).length > 0 && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          Nothing was saved. Fix the highlighted fields and try again.
        </div>
      )}
      {state.conflict && (
        <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">
            Someone else updated this recruit at{' '}
            {new Date(state.conflict.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} while you were editing.
          </p>
          <p className="mt-1">They changed: {state.conflict.theirChanges.join(', ') || 'nothing you can see here'}.</p>
          <p>You changed: {state.conflict.yourChanges.join(', ')}.</p>
          <p className="mt-1">Saving keeps their changes and adds yours. Where you both changed the same field, yours wins.</p>
          <button type="submit" name="intent" value="force" disabled={pending}
            className="mt-3 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700">
            Save my changes too
          </button>
        </div>
      )}

      <Section title="Overview">
        {t('first_name', 'First name *', recruit?.first_name, { autoComplete: 'off' })}
        {t('last_name', 'Last name *', recruit?.last_name, { autoComplete: 'off' })}
        {t('preferred_name', 'Preferred name', recruit?.preferred_name)}
        {t('graduation_year', 'Graduation year *', recruit?.graduation_year, { inputMode: 'numeric', placeholder: '2028' })}
        {t('height', 'Height', recruit?.height_inches != null ? inchesToInput(recruit.height_inches) : '', { placeholder: '5-10' })}
        {t('jersey_number', 'Jersey number', recruit?.jersey_number, { inputMode: 'numeric' })}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Position(s)</span>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                <input type="checkbox" name="positions" value={p} defaultChecked={recruit?.positions.includes(p)} />
                {p}
              </label>
            ))}
          </div>
        </div>
        {t('high_school', 'High school', recruit?.high_school)}
        {t('club_team', 'Club or travel team', recruit?.club_team)}
        {t('city', 'City', recruit?.city)}
        {t('state_country', 'State/Country', recruit?.state_country)}
        {t('circuit', 'Circuit', recruit?.circuit)}
        {t('age_group', 'Age group', recruit?.age_group, { placeholder: '16U' })}
      </Section>

      <Section title="Contact">
        {t('recruit_email', 'Recruit email', recruit?.recruit_email, { type: 'email', inputMode: 'email' })}
        {t('recruit_phone', 'Recruit phone', recruit?.recruit_phone, { type: 'tel', inputMode: 'tel' })}
        {t('birthday', 'Birthday', recruit?.birthday, { type: 'date' })}
        <div className="hidden sm:block" />
        {[1, 2].map((n) => (
          <div key={n} className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:col-span-2 sm:grid-cols-2">
            <p className="text-sm font-semibold text-slate-600 sm:col-span-2">Parent/guardian {n}</p>
            {t(`guardian${n}_name`, 'Name', g[n - 1]?.name)}
            {t(`guardian${n}_relationship`, 'Relationship', g[n - 1]?.relationship, { placeholder: 'Mother, Father, Guardian…' })}
            {t(`guardian${n}_email`, 'Email', g[n - 1]?.email, { type: 'email', inputMode: 'email' })}
            {t(`guardian${n}_phone`, 'Phone', g[n - 1]?.phone, { type: 'tel', inputMode: 'tel' })}
          </div>
        ))}
      </Section>

      <Section title="Links & notes">
        <Field name="video_links" label="Video links (one per line)" error={e.video_links}>
          <textarea id="video_links" name="video_links" rows={3} defaultValue={recruit?.video_links.join('\n')} className={inputClass} />
        </Field>
        <Field name="profile_links" label="Profile links (one per line)" error={e.profile_links}>
          <textarea id="profile_links" name="profile_links" rows={3} defaultValue={recruit?.profile_links.join('\n')} className={inputClass} />
        </Field>
        <Field name="academic_information" label="Academic information (optional)">
          <textarea id="academic_information" name="academic_information" rows={3} defaultValue={recruit?.academic_information ?? ''} className={inputClass} />
        </Field>
        <Field name="extra_notes" label="Extra notes">
          <textarea id="extra_notes" name="extra_notes" rows={3} defaultValue={recruit?.extra_notes ?? ''} className={inputClass} />
        </Field>
      </Section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={editing ? `/recruits/${recruit.id}` : '/recruits'}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-100">
          Cancel
        </Link>
        <button type="submit" disabled={pending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300">
          {pending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
