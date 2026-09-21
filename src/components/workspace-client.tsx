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
      {/* Left Column: Player & Metadata */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col bg-black">
        <Player 
          url={meeting.recording_url} 
          onTimeUpdate={setCurrentTime}
          seekTime={seekTime}
        />
        <div className="bg-white p-6 flex-1 overflow-auto border-r border-slate-200">
          <h1 className="text-2xl font-bold mb-2">{meeting.title}</h1>
          <p className="text-slate-600 mb-6">{meeting.description}</p>
          
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="action-items">Action Items</TabsTrigger>
              <TabsTrigger value="highlights">Highlights</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <SummaryPanel meetingId={meeting.id} summary={summary} />
            </TabsContent>
            <TabsContent value="action-items" className="mt-6">
              <ActionItemsPanel actionItems={actionItems} />
            </TabsContent>
            <TabsContent value="highlights" className="mt-6">
              <HighlightsPanel 
                meetingId={meeting.id} 
                highlights={highlights} 
                currentTime={currentTime} 
                onSeek={handleSeek} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column: Transcript */}
      <div className="w-full lg:w-1/2 xl:w-5/12 bg-white flex flex-col border-l border-slate-200">
        <div className="p-4 border-b border-slate-200 font-semibold flex justify-between items-center bg-slate-50">
          <span>Transcript</span>
          <span className="text-xs text-slate-500 font-normal">Synced with video</span>
        </div>
        <TranscriptPanel 
          transcripts={transcripts} 
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      </div>
    </div>
  )
}
