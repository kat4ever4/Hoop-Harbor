import Link from 'next/link'

export function RecruitNotFound() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">Recruit not found</h2>
      <p className="mt-2 text-slate-500">This recruit does not exist, or your account cannot see it.</p>
      <Link href="/recruits" className="mt-4 inline-block font-medium text-indigo-600 hover:underline">← Back to recruits</Link>
    </div>
  )
}
