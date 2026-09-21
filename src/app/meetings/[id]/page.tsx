import { createClient } from "@/lib/supabase/server"
import { WorkspaceClient } from "@/components/workspace-client"
import { notFound } from "next/navigation"
import { DeleteVideoOnLoad } from "@/components/delete-video-on-load"

export const dynamic = 'force-dynamic'

export default async function MeetingWorkspace({ 
  params,
  searchParams
}: { 
  params: { id: string },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()

  // Fetch meeting details
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', params.id)
    .single()

  if (meetingError || !meeting) {
    notFound()
  }

  // Fetch transcript segments with speaker details
  const { data: transcripts } = await supabase
    .from('transcript_segments')
    .select(`
      *,
      participants(name, email)
    `)
    .eq('meeting_id', params.id)
    .order('start_time', { ascending: true })

  // Fetch summary
  const { data: summary } = await supabase
    .from('summaries')
    .select('*')
    .eq('meeting_id', params.id)
    .single()

  // Fetch action items
  const { data: actionItems } = await supabase
    .from('action_items')
    .select('*')
    .eq('meeting_id', params.id)
    .order('due_date', { ascending: true })

  // Fetch highlights
  const { data: highlights } = await supabase
    .from('highlights')
    .select('*')
    .eq('meeting_id', params.id)
    .order('start_time', { ascending: true })

  const initialSeekTime = searchParams.start ? parseInt(searchParams.start as string) : undefined

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Fathom</span>
        </div>
        
        <div className="hidden md:flex flex-1 justify-center px-4">
           <div className="bg-slate-100 text-slate-600 px-6 py-1.5 rounded-full text-sm font-medium">
             Fathom - {meeting.title} - {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
           </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 cursor-pointer hover:text-slate-700 transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 cursor-pointer hover:text-slate-700 transition-colors"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 cursor-pointer hover:text-slate-700 transition-colors"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <WorkspaceClient 
          meeting={meeting} 
          transcripts={transcripts || []} 
          summary={summary}
          actionItems={actionItems || []}
          highlights={highlights || []}
          initialSeekTime={initialSeekTime}
        />
        {meeting.recording_url && meeting.recording_url.startsWith('data:video') && (
          <DeleteVideoOnLoad meetingId={meeting.id} hasVideo={true} />
        )}
      </main>
    </div>
  )
}
