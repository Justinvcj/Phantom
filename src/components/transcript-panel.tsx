'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function TranscriptPanel({ 
  transcripts, 
  currentTime 
}: { 
  transcripts: any[], 
  currentTime: number 
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Create a ref map to scroll to active segments
  const segmentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Find the currently active segment
  const activeSegmentId = transcripts.find(
    (t) => currentTime >= t.start_time && currentTime < t.end_time
  )?.id

  // Scroll to active segment when it changes
  useEffect(() => {
    if (activeSegmentId && segmentRefs.current[activeSegmentId]) {
      segmentRefs.current[activeSegmentId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [activeSegmentId])

  // Group transcripts by speaker if they are sequential
  const groupedTranscripts = transcripts.reduce((acc, current) => {
    const last = acc[acc.length - 1]
    if (last && last.speaker_id === current.speaker_id) {
      last.segments.push(current)
    } else {
      acc.push({
        speaker_id: current.speaker_id,
        speaker_name: current.participants?.name || 'Unknown',
        segments: [current]
      })
    }
    return acc
  }, [] as any[])

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <ScrollArea className="flex-1 p-6" ref={scrollRef}>
      <div className="space-y-6">
        {groupedTranscripts.map((group, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
              {group.speaker_name.charAt(0)}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{group.speaker_name}</span>
                <span className="text-xs text-slate-400">
                  {formatTime(group.segments[0].start_time)}
                </span>
              </div>
              
              <div className="space-y-1">
                {group.segments.map((segment: any) => {
                  const isActive = activeSegmentId === segment.id
                  return (
                    <div 
                      key={segment.id}
                      ref={(el) => {
                        segmentRefs.current[segment.id] = el
                      }}
                      className={cn(
                        "p-1.5 rounded transition-colors duration-200",
                        isActive ? "bg-indigo-50 text-indigo-900" : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {segment.text}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
