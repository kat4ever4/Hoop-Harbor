import Link from 'next/link'
import type { Access } from '@/lib/recruits/access'

/** Explains why no recruits are visible. Renders nothing for approved staff. */
export function AccessNotice({ access }: { access: Access }) {
  if (access.state === 'staff') return null

  const message = {
    'not-configured': (
      <>The app is not connected to a database. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
        <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to <code>.env.local</code> (or Vercel).</>
    ),
    'signed-out': (
      <>You are not signed in, so the database will not show any recruits.{' '}
        <Link href="/auth/login" className="font-semibold underline">Sign in</Link></>
    ),
    'not-staff': (
      <>You are signed in as <strong>{'email' in access ? access.email : ''}</strong>, but this account is not on the
        staff list, so the database hides all recruits. Ask an admin to add you to <code>staff_members</code>.</>
    ),
  }[access.state]

  return (
    <div role="alert" className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      {message}
    </div>
  )
}
