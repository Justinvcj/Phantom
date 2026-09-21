'use client'

import { useRef, useEffect, useState, useMemo, memo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

const TranscriptGroup = memo(function TranscriptGroup({ 
  group, 
  onSeek 
}: { 
  group: any, 
  onSeek?: (time: number) => void 
}) {
  return (
    <div className="flex gap-4">
      <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0 mt-1">
        <img src={`https://i.pravatar.cc/150?u=${group.speaker_id || group.speaker_name}`} alt="Profile" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="bg-slate-100/70 rounded-[1.25rem] px-5 pt-3.5 pb-4 relative group hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-[0.9rem] text-slate-800">{group.speaker_name}</span>
            <span className="text-[0.75rem] text-slate-400">
              • {Math.floor(group.segments[0].start_time / 60)}:{(group.segments[0].start_time % 60).toString().padStart(2, '0')} AM
            </span>
          </div>
          <div className="space-y-1">
            {group.segments.map((seg: any, j: number) => (
              <p 
                key={j} 
                onClick={() => onSeek && onSeek(seg.start_time)}
                className={`text-[0.9rem] leading-relaxed rounded-md px-1 -mx-1 transition-colors cursor-pointer inline ${
                  seg.isActive 
                    ? 'bg-indigo-100 text-indigo-900 font-medium' 
                    : 'text-slate-700 hover:bg-slate-200/50'
                }`}
                data-active={seg.isActive}
              >
                {seg.text}{' '}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

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
  const groupedTranscripts = useMemo(() => {
    const groups = []
    let currentGroup: any = null

    for (let i = 0; i < transcripts.length; i++) {
      const t = transcripts[i]
      const isActive = i === activeSegmentIndex
      
      if (currentGroup && currentGroup.speaker_id === t.speaker_id) {
        currentGroup.segments.push({ ...t, isActive })
      } else {
        if (currentGroup) groups.push(currentGroup)
        currentGroup = {
          speaker_id: t.speaker_id,
          speaker_name: Array.isArray(t.participants) ? t.participants[0]?.name : (t.participants as any)?.name || 'Unknown',
          segments: [{ ...t, isActive }]
        }
      }
    }
    if (currentGroup) groups.push(currentGroup)
    return groups
  }, [transcripts, activeSegmentIndex])

  return (
    <ScrollArea className="flex-1 p-6" ref={scrollRef}>
      <div 
        className="space-y-6 pb-20"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {groupedTranscripts.map((group: any, i: number) => (
          <TranscriptGroup key={i} group={group} onSeek={onSeek} />
        ))}
      </div>
    </ScrollArea>
  )
}
