import { Suspense } from 'react'
import { SiteNav } from '@/components/layout/site-nav'
import { getAccess } from '@/lib/recruits/access'
import { listRecruits } from '@/lib/recruits/queries'
import { AccessNotice } from './access-notice'
import { RecruitTable } from './recruit-table'

async function RecruitList() {
  const access = await getAccess()
  if (access.state === 'not-configured') return <AccessNotice access={access} />
  const { recruits, error } = await listRecruits()
  return (
    <>
      <AccessNotice access={access} />
      {error && <p role="alert" className="mb-4 text-sm text-red-700">Could not load recruits: {error}</p>}
      <RecruitTable recruits={recruits} />
    </>
  )
}

export default function RecruitsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-700">
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl flex-grow p-4 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Recruits</h1>
        <Suspense fallback={<p className="text-slate-500">Loading recruits…</p>}>
          <RecruitList />
        </Suspense>
      </main>
    </div>
  )
}
