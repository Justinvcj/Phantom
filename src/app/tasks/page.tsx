import { DashboardLayout } from '@/components/dashboard-layout'

export default function TasksPage() {
  return (
    <DashboardLayout activePath="/tasks">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Tasks</h1>
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-16 text-center text-slate-500">
          Global action items coming soon.
        </div>
      </div>
    </DashboardLayout>
  )
}
