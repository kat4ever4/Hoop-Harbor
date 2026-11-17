import Link from 'next/link'
import type { DuplicateMatch } from '@/lib/recruits/duplicates'

/** A list of recruits that may be the same player, each with an "Open existing" link. Reused by F8 (Unarchive). */
export function DuplicateMatches({ matches }: { matches: DuplicateMatch[] }) {
  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
      {matches.map((m) => (
        <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div>
            <p className="font-medium text-slate-900">{m.name}</p>
            <p className="text-sm text-slate-500">
              {[m.graduation_year && `Class of ${m.graduation_year}`, m.high_school, m.stage].filter(Boolean).join(' · ')}
            </p>
          </div>
          <Link
            href={`/recruits/${m.id}`}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Open existing
          </Link>
        </li>
      ))}
    </ul>
  )
}