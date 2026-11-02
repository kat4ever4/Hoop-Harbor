import { Suspense } from 'react'
import { SiteNav } from '@/components/layout/site-nav'
import { getRecruit } from '@/lib/recruits/queries'
import { fullName } from '@/lib/recruits/fields'
import { RecruitForm } from '../../recruit-form'
import { RecruitNotFound } from '../../not-found-message'

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const recruit = await getRecruit(id)
  if (!recruit) return <RecruitNotFound />
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Edit {fullName(recruit)}</h1>
      <RecruitForm recruit={recruit} />
    </>
  )
}

export default function EditRecruitPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-700">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-grow p-4 sm:p-8">
        <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
          <EditContent params={params} />
        </Suspense>
      </main>
    </div>
  )
}
