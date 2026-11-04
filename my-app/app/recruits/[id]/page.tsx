import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'
import { ArrowLeft, Pencil } from 'lucide-react'
import { SiteNav } from '@/components/layout/site-nav'
import { getAccess } from '@/lib/recruits/access'
import { getRecruit, listRecruitNotes } from '@/lib/recruits/queries'
import { listActiveStaff } from '@/lib/staff/queries'
import type { StaffOption } from '@/lib/staff/types'
import type { RecruitNote } from '@/lib/recruits/notes'
import { NoteForm } from '../note-form'
import { fullName, type Recruit } from '@/lib/recruits/fields'
import { inchesToHeight } from '@/lib/format-height'
import { AccessNotice } from '../access-notice'
import { RecruitNotFound } from '../not-found-message'

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 border-b border-slate-100 pb-3 text-sm font-bold uppercase tracking-wider text-slate-400">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-900 [overflow-wrap:anywhere]">{value || '—'}</dd>
    </div>
  )
}

function Links({ urls }: { urls: string[] }) {
  if (urls.length === 0) return '—'
  return (
    <span className="flex flex-col items-end gap-1">
      {urls.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{u.replace(/^https?:\/\//, '')}</a>)}
    </span>
  )
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })

function Profile({ r, notes, staff, notesError, staffError }: {
  r: Recruit; notes: RecruitNote[]; staff: StaffOption[]; notesError?: string; staffError?: string
}) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-slate-800 to-indigo-900 p-6 text-white sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{fullName(r)}</h1>
          <p className="mt-1 text-indigo-100">
            {[r.graduation_year && `Class of ${r.graduation_year}`, r.positions.join(' / '), r.high_school].filter(Boolean).join(' · ')}
          </p>
          <p className="mt-2 text-xs text-indigo-200">Last updated {when(r.updated_at)}</p>
        </div>
        <Link href={`/recruits/${r.id}/edit`}
          className="flex items-center justify-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25">
          <Pencil className="h-4 w-4" /> Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Overview">
          <dl>
            <Row label="Graduation year" value={r.graduation_year} />
            <Row label="Position(s)" value={r.positions.join(', ')} />
            <Row label="Height" value={r.height_inches != null ? inchesToHeight(r.height_inches) : null} />
            <Row label="Weight" value={r.weight_lbs != null ? `${r.weight_lbs} lb` : null} />
            <Row label="Jersey #" value={r.jersey_number} />
            <Row label="High school" value={r.high_school} />
            <Row label="Hometown" value={[r.city, r.state_country].filter(Boolean).join(', ')} />
            <Row label="Club / travel team" value={r.club_team} />
            <Row label="Circuit" value={r.circuit} />
            <Row label="Age group" value={r.age_group} />
          </dl>
        </Card>

        <Card title="Contact">
          <dl>
            <Row label="Email" value={r.recruit_email && <a href={`mailto:${r.recruit_email}`} className="text-indigo-600">{r.recruit_email}</a>} />
            <Row label="Phone" value={r.recruit_phone && <a href={`tel:${r.recruit_phone}`} className="text-indigo-600">{r.recruit_phone}</a>} />
            <Row label="Birthday" value={r.birthday} />
            {r.guardian_contacts.map((g, i) => (
              <Row key={i} label={g.relationship || 'Parent/guardian'}
                value={<span className="flex flex-col items-end">{g.name}<span className="font-normal text-slate-500">{[g.email, g.phone].filter(Boolean).join(' · ')}</span></span>} />
            ))}
          </dl>
        </Card>

        <Card title="Links & academics">
          <dl>
            <Row label="Video" value={<Links urls={r.video_links} />} />
            <Row label="Profiles" value={<Links urls={r.profile_links} />} />
            <Row label="Academics" value={r.academic_information} />
            <Row label="GPA" value={r.gpa != null ? `${r.gpa} / ${r.gpa_scale}` : null} />
          </dl>
          {r.medical_notes && <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
            <h3 className="font-semibold">Medical notes</h3>
            <p className="whitespace-pre-wrap">{r.medical_notes}</p>
          </div>}
        </Card>

        <Card title="Recruit notes">
          {notesError ? <p role="alert" className="text-sm text-red-700">Could not load notes. Please try again.</p>
            : notes.length === 0 ? <p className="text-sm text-slate-500">No notes yet.</p>
            : <ol className="flex flex-col gap-4">
              {notes.map((note) => <li key={note.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                <p className="font-semibold">{note.author?.display_name ?? 'Unknown staff'} · {note.note_type}</p>
                <p className="text-xs text-slate-500">{when(note.occurred_at)}</p>
                {note.title && <h3 className="mt-2 font-semibold">{note.title}</h3>}
                <p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere]">{note.body}</p>
              </li>)}
            </ol>}
          {staffError ? <p role="alert" className="mt-4 text-sm text-red-700">Could not load staff names. Please try again.</p>
            : <NoteForm recruitId={r.id} staff={staff} />}
        </Card>
      </div>
    </>
  )
}

async function ProfileContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [access, recruit] = await Promise.all([getAccess(), getRecruit(id)])
  const [noteResult, staffResult] = recruit
    ? await Promise.all([listRecruitNotes(id), listActiveStaff()])
    : [{ notes: [] }, { staff: [] }]
  return (
    <>
      <AccessNotice access={access} />
      {recruit ? <Profile r={recruit} notes={noteResult.notes} staff={staffResult.staff}
        notesError={noteResult.error} staffError={staffResult.error} /> : <RecruitNotFound />}
    </>
  )
}

export default function RecruitPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-700">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl flex-grow p-4 sm:p-8">
        <Link href="/recruits" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> All recruits
        </Link>
        <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
          <ProfileContent params={params} />
        </Suspense>
      </main>
    </div>
  )
}
