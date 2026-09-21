'use client'

import { useState, useTransition } from 'react'
import { createHighlight } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Play, Plus, Clock, Share2 } from 'lucide-react'

export function HighlightsPanel({
  meetingId,
  highlights,
  currentTime,
  onSeek
}: {
  meetingId: string,
  highlights: any[],
  currentTime: number,
  onSeek: (time: number) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [isAdding, setIsAdding] = useState(false)
  const [note, setNote] = useState('')

  // Create a 30s highlight ending at current time (or starting at 0 if < 30s)
  const handleSaveHighlight = () => {
    const end = currentTime
    const start = Math.max(0, currentTime - 30)
    
    startTransition(() => {
      createHighlight(meetingId, start, end, note)
      setIsAdding(false)
      setNote('')
    })
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900">Highlights</h2>
        <Button 
          size="sm" 
          onClick={() => setIsAdding(true)} 
          disabled={isAdding || isPending}
        >
          <Plus className="w-4 h-4 mr-2" />
          Capture Clip
        </Button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 p-4 rounded-lg border border-indigo-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
            <Clock className="w-4 h-4" />
            Saving clip: {formatTime(Math.max(0, currentTime - 30))} - {formatTime(currentTime)}
          </div>
          <Textarea 
            placeholder="What makes this a highlight?" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-sm bg-white"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveHighlight} disabled={isPending}>Save</Button>
          </div>
        </div>
      )}

      {highlights.length === 0 && !isAdding ? (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          No highlights yet. Click &quot;Capture Clip&quot; while watching to save a moment.
        </div>
      ) : (
        <div className="space-y-4">
          {highlights.map((h) => (
            <div key={h.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-indigo-300 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <div 
                  className="flex items-center gap-2 text-indigo-600 font-medium text-sm cursor-pointer hover:underline"
                  onClick={() => onSeek(h.start_time)}
                >
                  <Play className="w-4 h-4" />
                  {formatTime(h.start_time)} - {formatTime(h.end_time)}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    const url = new URL(window.location.href)
                    url.searchParams.set('start', h.start_time.toString())
                    navigator.clipboard.writeText(url.toString())
                    alert('Highlight link copied to clipboard!')
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-700">
                {h.note || "Clip captured"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
