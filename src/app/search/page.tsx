import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Video, 
  Search as SearchIcon, 
  ChevronLeft,
  FileText,
  Highlighter,
  MessageSquare
} from 'lucide-react'

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string }
}) {
  const rawQuery = searchParams.q || ''
  // Mitigate ReDoS / DB Timeout by truncating exceptionally long search strings
  const query = rawQuery.substring(0, 100)
  
  const supabase = createClient()
  
  // Search meetings
  const { data: meetingResults } = await supabase
    .from('meetings')
    .select('id, title, date, duration_seconds')
    .ilike('title', `%${query}%`)
    .limit(5)

  // Search transcripts
  const { data: transcriptResults } = await supabase
    .from('transcript_segments')
    .select(`
      id, meeting_id, start_time, text,
      meetings(title)
    `)
    .ilike('text', `%${query}%`)
    .limit(10)

  // Search highlights
  const { data: highlightResults } = await supabase
    .from('highlights')
    .select(`
      id, meeting_id, start_time, note,
      meetings(title)
    `)
    .ilike('note', `%${query}%`)
    .limit(10)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 border-b border-slate-200 bg-white flex items-center px-8 shrink-0 gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <form action="/search" className="max-w-xl w-full flex items-center relative">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3" />
          <Input 
            name="q"
            defaultValue={query}
            className="w-full pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500" 
            placeholder="Search meetings, transcripts, highlights..." 
          />
        </form>
      </header>

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {!query ? (
            <div className="text-center py-20 text-slate-500">
              <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg">Type something to search across all your meetings.</p>
            </div>
          ) : (
            <>
              {/* Meeting Results */}
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-500" />
                  Meetings ({meetingResults?.length || 0})
                </h2>
                {meetingResults && meetingResults.length > 0 ? (
                  <div className="space-y-3">
                    {meetingResults.map(m => (
                      <Link key={m.id} href={`/meetings/${m.id}`}>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm flex justify-between items-center group">
                          <div>
                            <h3 className="font-medium text-indigo-700 group-hover:underline">{m.title}</h3>
                            <p className="text-sm text-slate-500 mt-1">
                              {new Date(m.date).toLocaleDateString()} • {Math.floor(m.duration_seconds / 60)} min
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No meetings found.</p>
                )}
              </section>

              {/* Transcript Results */}
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Transcript Matches ({transcriptResults?.length || 0})
                </h2>
                {transcriptResults && transcriptResults.length > 0 ? (
                  <div className="space-y-3">
                    {transcriptResults.map(t => (
                      <Link key={t.id} href={`/meetings/${t.meeting_id}?start=${t.start_time}&tab=transcript`}>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm group">
                          <p className="text-sm text-slate-800 italic mb-2 line-clamp-2">
                            &quot;{t.text}&quot;
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="font-medium text-indigo-600 group-hover:underline">
                              {(t.meetings as any)?.title || 'Unknown Meeting'}
                            </span>
                            •
                            <span>
                              {Math.floor(t.start_time / 60)}:{(t.start_time % 60).toString().padStart(2, '0')}
                            </span>
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No transcript matches found.</p>
                )}
              </section>

              {/* Highlight Results */}
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Highlighter className="w-5 h-5 text-indigo-500" />
                  Highlights ({highlightResults?.length || 0})
                </h2>
                {highlightResults && highlightResults.length > 0 ? (
                  <div className="space-y-3">
                    {highlightResults.map(h => (
                      <Link key={h.id} href={`/meetings/${h.meeting_id}?start=${h.start_time}&tab=highlights`}>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm group">
                          <p className="text-sm text-slate-800 mb-2 font-medium">
                            {h.note || "Clip captured"}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-2">
                            <span className="font-medium text-indigo-600 group-hover:underline">
                              {(h.meetings as any)?.title || 'Unknown Meeting'}
                            </span>
                            •
                            <span>
                              {Math.floor(h.start_time / 60)}:{(h.start_time % 60).toString().padStart(2, '0')}
                            </span>
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No highlights found.</p>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
