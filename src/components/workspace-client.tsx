'use client'

import { useState } from 'react'
import { Player } from './player'
import { TranscriptPanel } from './transcript-panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function WorkspaceClient({ 
  meeting, 
  transcripts 
}: { 
  meeting: any, 
  transcripts: any[] 
}) {
  const [currentTime, setCurrentTime] = useState(0)

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)]">
      {/* Left Column: Player & Metadata */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col bg-black">
        <Player 
          url={meeting.recording_url} 
          onTimeUpdate={setCurrentTime}
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
            <TabsContent value="overview" className="mt-4">
              <div className="text-sm text-slate-500 italic">Summary will go here in Phase 4.</div>
            </TabsContent>
            <TabsContent value="action-items" className="mt-4">
              <div className="text-sm text-slate-500 italic">Action items will go here.</div>
            </TabsContent>
            <TabsContent value="highlights" className="mt-4">
              <div className="text-sm text-slate-500 italic">Highlights will go here.</div>
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
        />
      </div>
    </div>
  )
}
