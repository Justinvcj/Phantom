'use client'

import { useState } from 'react'
import { Player } from './player'
import { TranscriptPanel } from './transcript-panel'
import { SummaryPanel } from './summary-panel'
import { ActionItemsPanel } from './action-items-panel'
import { HighlightsPanel } from './highlights-panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function WorkspaceClient({ 
  meeting, 
  transcripts,
  summary,
  actionItems,
  highlights,
  initialSeekTime
}: { 
  meeting: any, 
  transcripts: any[],
  summary: any,
  actionItems: any[],
  highlights: any[],
  initialSeekTime?: number
}) {
  const [currentTime, setCurrentTime] = useState(0)
  const [seekTime, setSeekTime] = useState<number | undefined>(initialSeekTime)

  const handleSeek = (time: number) => {
    setSeekTime(time)
    // small hack to allow seeking to the same time twice if needed
    setTimeout(() => setSeekTime(undefined), 100)
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)]">
      {/* Left Column: Player ONLY (Dark Mode) */}
      <div className="w-full lg:w-7/12 xl:w-8/12 flex flex-col bg-[#1c1f2e] p-4 lg:p-8 relative">
        <div className="flex-1 flex items-center justify-center relative">
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black relative">
            <Player 
              url={meeting.recording_url} 
              onTimeUpdate={setCurrentTime}
              seekTime={seekTime}
            />
          </div>
        </div>
        {/* Mock Toolbar */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
           <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 border border-slate-700/50">
             <button className="w-10 h-10 rounded-lg bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center text-white transition-colors">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
             </button>
             <button className="w-10 h-10 rounded-lg bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center text-white transition-colors">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
             </button>
             <button className="w-10 h-10 rounded-lg bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center text-white transition-colors">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
             </button>
             <button className="w-10 h-10 rounded-lg bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center text-white transition-colors">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
             </button>
             <button className="w-10 h-10 rounded-lg bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors ml-2 shadow-lg shadow-red-500/20">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
             </button>
           </div>
        </div>
      </div>

      {/* Right Column: Collaboration Tabs (White Mode) */}
      <div className="w-full lg:w-5/12 xl:w-4/12 bg-white flex flex-col border-l border-slate-200">
        <Tabs defaultValue="transcript" className="flex flex-col h-full w-full">
          <div className="p-5 border-b border-slate-100 flex-shrink-0 pb-0">
            <h2 className="text-[1.1rem] font-bold text-slate-900 mb-4 tracking-tight">Collaboration</h2>
            
            <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 rounded-none p-0 h-auto space-x-6">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger 
                value="transcript"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Transcript
              </TabsTrigger>
              <TabsTrigger 
                value="action-items"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Action Items
              </TabsTrigger>
              <TabsTrigger 
                value="highlights"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent px-2 py-3 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Highlights
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden min-h-0 relative">
            <TabsContent value="overview" className="h-full overflow-auto p-5 mt-0">
              <SummaryPanel meetingId={meeting.id} summary={summary} />
            </TabsContent>
            <TabsContent value="transcript" className="h-full overflow-hidden mt-0 flex flex-col">
              <TranscriptPanel 
                transcripts={transcripts} 
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            </TabsContent>
            <TabsContent value="action-items" className="h-full overflow-auto p-5 mt-0">
              <ActionItemsPanel actionItems={actionItems} />
            </TabsContent>
            <TabsContent value="highlights" className="h-full overflow-auto p-5 mt-0">
              <HighlightsPanel 
                meetingId={meeting.id} 
                highlights={highlights} 
                currentTime={currentTime} 
                onSeek={handleSeek} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
