import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'

export default function TasksPage() {
  return (
    <DashboardLayout activePath="/tasks">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Tasks</h1>
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-16 text-center text-slate-500">
          <p className="text-lg font-medium text-slate-700 mb-2">Action items coming soon</p>
          <p className="text-sm mb-6">AI-extracted action items from all your meetings will appear here.</p>
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:underline text-sm font-medium">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
