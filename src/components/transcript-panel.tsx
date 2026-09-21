'use client'

import { useRef, useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function TranscriptPanel({ 
  transcripts, 
  currentTime,
  onSeek
}: { 
  transcripts: any[], 
  currentTime: number,
  onSeek?: (time: number) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  
  // Find active segment
  const activeSegmentIndex = transcripts.findIndex(
    (t) => currentTime >= t.start_time && currentTime <= t.end_time
  )

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentIndex === -1 || isHovering) return
    const el = scrollRef.current?.querySelector(`[data-active="true"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeSegmentIndex, isHovering])

  // Group transcripts by speaker consecutively
  const groupedTranscripts = []
  let currentGroup: any = null

  for (let i = 0; i < transcripts.length; i++) {
    const t = transcripts[i]
    const isActive = i === activeSegmentIndex
    
    if (currentGroup && currentGroup.speaker_id === t.speaker_id) {
      currentGroup.segments.push({ ...t, isActive })
    } else {
      if (currentGroup) groupedTranscripts.push(currentGroup)
      currentGroup = {
        speaker_id: t.speaker_id,
        speaker_name: Array.isArray(t.participants) ? t.participants[0]?.name : (t.participants as any)?.name || 'Unknown',
        segments: [{ ...t, isActive }]
      }
    }
  }
  if (currentGroup) groupedTranscripts.push(currentGroup)

  return (
    <ScrollArea className="flex-1 p-6" ref={scrollRef}>
      <div 
        className="space-y-6 pb-20"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {groupedTranscripts.map((group: any, i: number) => (
          <div key={i} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 mt-1">
              {group.speaker_name.charAt(0)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-slate-900">{group.speaker_name}</span>
                <span className="text-xs text-slate-400">
                  {Math.floor(group.segments[0].start_time / 60)}:{(group.segments[0].start_time % 60).toString().padStart(2, '0')}
                </span>
              </div>
              {group.segments.map((seg: any, j: number) => (
                <p 
                  key={j} 
                  onClick={() => onSeek && onSeek(seg.start_time)}
                  className={`text-sm leading-relaxed rounded-md px-2 py-1 -mx-2 transition-colors cursor-pointer ${
                    seg.isActive 
                      ? 'bg-indigo-50 text-indigo-900' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  data-active={seg.isActive}
                >
                  {seg.text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
