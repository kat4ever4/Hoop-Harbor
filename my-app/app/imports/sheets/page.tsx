import { SiteNav } from '@/components/layout/site-nav'
import { ImportWizard } from './import-wizard'

export default function ImportSheetsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-700">
      <SiteNav />
      <main className="mx-auto w-full max-w-4xl flex-grow p-4 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Import from Google Sheets</h1>
        <ImportWizard />
      </main>
    </div>
  )
}