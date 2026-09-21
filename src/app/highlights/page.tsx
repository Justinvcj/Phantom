import { DashboardLayout } from '@/components/dashboard-layout'

export default function HighlightsPage() {
  return (
    <DashboardLayout activePath="/highlights">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Highlights</h1>
        <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm p-16 text-center text-slate-500">
          Global highlights view coming soon.
        </div>
      </div>
    </DashboardLayout>
  )
}
