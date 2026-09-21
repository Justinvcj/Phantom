import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'

export default function MeetingsPage() {
  return (
    <DashboardLayout activePath="/meetings">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">All Meetings</h1>
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-16 text-center text-slate-500">
          <p className="text-lg font-medium text-slate-700 mb-2">Meetings list coming soon</p>
          <p className="text-sm mb-6">Your recorded meetings will appear here.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:underline text-sm font-medium">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
