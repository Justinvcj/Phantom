import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NewMeetingModal } from '@/components/new-meeting-modal'
import { Input } from '@/components/ui/input'
import { 
  Video, 
  Search, 
  Plus,
  LayoutDashboard,
  Users,
  Highlighter,
  CheckSquare,
  Calendar,
  Settings,
  Bell,
  PlaySquare,
  FileText,
  Share2
} from 'lucide-react'

import { DashboardLayout } from '@/components/dashboard-layout'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const supabase = createClient()
  
  // Need to get the ID of the stress test meeting to pass to the modal for the demo
  const { data: stMeeting } = await supabase.from('meetings').select('id').eq('title', 'Q3 Product Strategy').single()
  const stressTestMeetingId = stMeeting?.id

  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching meetings:', error)
  }

  return (
    <DashboardLayout activePath="/">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Recent Meetings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings?.map((meeting) => (
              <div key={meeting.id} className="bg-white rounded-[1rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="p-3 pb-0">
                  <Link href={`/meetings/${meeting.id}`}>
                    <div className="aspect-video bg-slate-900 relative group cursor-pointer rounded-lg overflow-hidden">
                      {meeting.recording_url && (
                        <video src={meeting.recording_url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                      )}
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <PlaySquare className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                      
                      <div className="absolute bottom-2 left-2 opacity-90">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play w-5 h-5 fill-white"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                      </div>

                      <div className="absolute bottom-2 right-2 text-white text-xs px-1.5 py-0.5 font-medium tracking-wide shadow-sm" style={{ textShadow: "0px 1px 3px rgba(0,0,0,0.8)" }}>
                        02:45/{Math.floor(meeting.duration_seconds / 60)}:{(meeting.duration_seconds % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="px-4 pt-3 pb-4">
                  <Link href={`/meetings/${meeting.id}`} className="hover:text-indigo-600 transition-colors">
                    <h3 className="font-semibold text-[1.05rem] text-slate-900 line-clamp-1 leading-tight">{meeting.title}</h3>
                  </Link>
                  <p className="text-[0.85rem] text-slate-600 mt-1">
                    {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(meeting.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {Math.floor(meeting.duration_seconds / 60)} min
                  </p>
                  
                  <div className="flex items-center gap-1 mt-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-semibold border-2 border-white z-20">SJ</div>
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-semibold border-2 border-white -ml-2 z-10">RJ</div>
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[9px] font-semibold border-2 border-white -ml-2 z-0">RL</div>
                  </div>
                </div>

                <div className="mt-auto border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100 rounded-b-[1rem] overflow-hidden">
                  <Link href={`/meetings/${meeting.id}`} className="flex flex-col items-center justify-center py-2.5 text-[0.7rem] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                    <Video className="w-4 h-4 mb-1 text-slate-600" /> View Video
                  </Link>
                  <Link href={`/meetings/${meeting.id}?tab=transcript`} className="flex flex-col items-center justify-center py-2.5 text-[0.7rem] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                    <FileText className="w-4 h-4 mb-1 text-slate-600" /> View Transcript
                  </Link>
                  <button className="flex flex-col items-center justify-center py-2.5 text-[0.7rem] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                    <Share2 className="w-4 h-4 mb-1 text-slate-600" /> Share
                  </button>
                </div>
              </div>
            ))}
            
            {(!meetings || meetings.length === 0) && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                <Video className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-900">No meetings found</p>
                <p className="mb-6">Click &quot;New Demo Meeting&quot; to create one.</p>
                <NewMeetingModal demoMeetingId={stressTestMeetingId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
