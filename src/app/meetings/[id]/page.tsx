import { createClient } from "@/lib/supabase/server"
import { WorkspaceClient } from "@/components/workspace-client"
import { notFound } from "next/navigation"

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
      <header className="flex items-center px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-indigo-600 text-white font-bold">
            F
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Fathom Clone</span>
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
      </main>
    </div>
  )
}
