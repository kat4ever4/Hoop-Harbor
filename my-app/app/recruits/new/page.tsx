import { Suspense } from 'react'
import { SiteNav } from '@/components/layout/site-nav'
import { getAccess } from '@/lib/recruits/access'
import { AccessNotice } from '../access-notice'
import { RecruitForm } from '../recruit-form'

async function Notice() {
  return <AccessNotice access={await getAccess()} />
}

export default function NewRecruitPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-700">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-grow p-4 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">New Recruit</h1>
        <Suspense fallback={null}><Notice /></Suspense>
        <RecruitForm />
      </main>
    </div>
  )
}
