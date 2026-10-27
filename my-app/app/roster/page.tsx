"use client";

import { useMemo, useState } from "react";
import { Filter, Plus, Search, Star } from "lucide-react";
import { SiteNav } from "@/components/layout/site-nav";

type Athlete = {
  name: string;
  stars: number;
  classYear: string;
  position: string;
  status: string;
};

// Sample data for now. Later (F1) this comes from the Supabase `recruits` table.
const ATHLETES: Athlete[] = [
  { name: "Marcus Johnson", stars: 4, classYear: "2025", position: "Quarterback", status: "Committed" },
  { name: "Sarah Jenkins", stars: 2, classYear: "2026", position: "Point Guard", status: "Offered" },
  { name: "David Chen", stars: 3, classYear: "2025", position: "Midfielder", status: "Evaluating" },
  { name: "Elena Rodriguez", stars: 4, classYear: "2027", position: "Point Guard", status: "Target" },
  { name: "Jamal Crawford", stars: 3, classYear: "2026", position: "Quarterback", status: "Target" },
  { name: "Tyler Smith", stars: 3, classYear: "2025", position: "Quarterback", status: "Evaluating" },
];

const STATUS_STYLES: Record<string, string> = {
  Committed: "bg-green-100 text-green-700",
  Offered: "bg-blue-100 text-blue-700",
  Evaluating: "bg-purple-100 text-purple-700",
  Target: "bg-yellow-100 text-yellow-700",
};

const ALL = "All";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function unique(values: string[]) {
  return [...new Set(values)].sort();
}

const selectClass =
  "block cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-indigo-500";

export default function RosterPage() {
  const [search, setSearch] = useState("");
  const [classYear, setClassYear] = useState(ALL);
  const [position, setPosition] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return ATHLETES.filter(
      (a) =>
        (term === "" || a.name.toLowerCase().includes(term)) &&
        (classYear === ALL || a.classYear === classYear) &&
        (position === ALL || a.position === position) &&
        (status === ALL || a.status === status),
    );
  }, [search, classYear, position, status]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-700">
      <SiteNav />

      <main className="mx-auto w-full max-w-7xl flex-grow p-6 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Athlete Roster</h1>

        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 font-medium text-slate-500">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filters:</span>
              </div>

              <select aria-label="Class year" value={classYear} onChange={(e) => setClassYear(e.target.value)} className={selectClass}>
                <option value={ALL}>Class Year</option>
                {unique(ATHLETES.map((a) => a.classYear)).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>

              <select aria-label="Position" value={position} onChange={(e) => setPosition(e.target.value)} className={selectClass}>
                <option value={ALL}>Position</option>
                {unique(ATHLETES.map((a) => a.position)).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>

              <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                <option value={ALL}>Status</option>
                {unique(ATHLETES.map((a) => a.status)).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="flex w-full flex-wrap items-center gap-4 lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search athletes..."
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => alert("New Recruit form comes with F1")}
                className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 sm:w-auto"
              >
                <Plus className="h-3 w-3" /> New Recruit
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="w-1/3 px-6 py-4">Athlete Name</th>
                  <th scope="col" className="w-1/6 px-6 py-4">Class</th>
                  <th scope="col" className="w-1/4 px-6 py-4">Position</th>
                  <th scope="col" className="w-1/6 px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      No athletes match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a.name} className="hover:bg-gray-50">
                      <td className="flex items-center gap-4 px-6 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          {initials(a.name)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{a.name}</div>
                          <div className="mt-1 flex gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={i < a.stars ? "h-3 w-3 fill-yellow-400 text-yellow-400" : "h-3 w-3 text-yellow-400"}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">{a.classYear}</td>
                      <td className="px-6 py-4 text-gray-500">{a.position}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLES[a.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
