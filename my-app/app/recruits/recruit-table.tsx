'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Filter, Plus, Search } from 'lucide-react'
import type { RecruitListItem } from '@/lib/recruits/queries'

const ALL = 'All'
const selectClass =
  'block cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-indigo-500'

const name = (r: RecruitListItem) => `${r.first_name} ${r.last_name}`
const initials = (r: RecruitListItem) => `${r.first_name[0] ?? ''}${r.last_name[0] ?? ''}`
const unique = (values: string[]) => [...new Set(values)].sort()

export function RecruitTable({ recruits }: { recruits: RecruitListItem[] }) {
  const [search, setSearch] = useState('')
  const [year, setYear] = useState(ALL)
  const [position, setPosition] = useState(ALL)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return recruits.filter((r) => {
      const haystack = [r.first_name, r.last_name, r.preferred_name, r.high_school, r.club_team].join(' ').toLowerCase()
      return (
        (term === '' || haystack.includes(term)) &&
        (year === ALL || String(r.graduation_year) === year) &&
        (position === ALL || r.positions.includes(position))
      )
    })
  }, [recruits, search, year, position])

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-medium text-slate-500">
            <Filter className="h-4 w-4" />
            <span className="text-sm">Filters:</span>
          </div>
          <select aria-label="Graduation year" value={year} onChange={(e) => setYear(e.target.value)} className={selectClass}>
            <option value={ALL}>Grad Year</option>
            {unique(recruits.map((r) => String(r.graduation_year ?? '')).filter(Boolean)).map((v) => <option key={v}>{v}</option>)}
          </select>
          <select aria-label="Position" value={position} onChange={(e) => setPosition(e.target.value)} className={selectClass}>
            <option value={ALL}>Position</option>
            {unique(recruits.flatMap((r) => r.positions)).map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, school, club…"
              aria-label="Search recruits"
              className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-base text-slate-900 outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <Link href="/recruits/new"
            className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 sm:w-auto">
            <Plus className="h-4 w-4" /> New Recruit
          </Link>
        </div>
      </div>

      <p className="px-5 pt-3 text-sm text-slate-500">{filtered.length} {filtered.length === 1 ? 'recruit' : 'recruits'}</p>

      {filtered.length === 0 ? (
        <p className="px-6 py-12 text-center text-slate-500">
          {recruits.length === 0 ? 'No recruits yet. Tap New Recruit to add one.' : 'No recruits match your filters.'}
        </p>
      ) : (
        <>
          {/* Phones: stacked cards, so nothing scrolls sideways */}
          <ul className="divide-y divide-slate-100 sm:hidden">
            {filtered.map((r) => (
              <li key={r.id}>
                <Link href={`/recruits/${r.id}`} className="flex items-center gap-3 px-5 py-4 active:bg-slate-50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">{initials(r)}</div>
                  <div className="min-w-0">
                    <div className="truncate font-bold text-gray-800">{name(r)}</div>
                    <div className="truncate text-sm text-slate-500">
                      {[r.graduation_year, r.positions.join('/'), r.high_school].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablets and desktops: table */}
          <div className="hidden w-full overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-4">Name</th>
                  <th scope="col" className="px-6 py-4">Grad Year</th>
                  <th scope="col" className="px-6 py-4">Position</th>
                  <th scope="col" className="px-6 py-4">School</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/recruits/${r.id}`} className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">{initials(r)}</div>
                        <span className="font-bold text-gray-800 hover:text-indigo-600">{name(r)}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">{r.graduation_year}</td>
                    <td className="px-6 py-4 text-gray-500">{r.positions.join(', ')}</td>
                    <td className="px-6 py-4 text-gray-500">{r.high_school}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
