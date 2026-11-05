import { CURRENT_STAFF_ID, MOCK_NOTES } from '@/lib/notes/mock-data'
import { MOCK_STAFF } from '@/lib/staff/mock'
import { NotesClient } from './notes-client'

/** The one tag that goes on the profile page. Mock data now; real queries later (Step 7). */
export function NotesSection({ recruitId }: { recruitId: string }) {
  const notes = MOCK_NOTES.filter((n) => n.recruit_id === recruitId)
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 border-b border-slate-100 pb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
        Notes
      </h2>
      <NotesClient
        recruitId={recruitId}
        initialNotes={notes}
        staff={MOCK_STAFF}
        currentStaffId={CURRENT_STAFF_ID}
        pickAuthor
      />
    </section>
  )
}