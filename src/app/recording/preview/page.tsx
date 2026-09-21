'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Trash2, FileText, Sparkles, CheckSquare } from 'lucide-react'

interface Summary {
  overview: string
  key_points: string[]
  action_items: { assignee: string; text: string }[]
}

export default function RecordingPreviewPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [title, setTitle] = useState('Live Recording')
  const [deleted, setDeleted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    const storedVideo = sessionStorage.getItem('fathom_temp_recording')
    const storedTranscript = sessionStorage.getItem('fathom_temp_transcript')
    const storedSummary = sessionStorage.getItem('fathom_temp_summary')
    const storedTitle = sessionStorage.getItem('fathom_temp_title')

    if (storedVideo) setVideoUrl(storedVideo)
    if (storedTranscript) setTranscript(storedTranscript)
    if (storedTitle) setTitle(storedTitle)
    if (storedSummary) {
      try { setSummary(JSON.parse(storedSummary)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl
    }
  }, [videoUrl])

  const handleDelete = () => {
    sessionStorage.removeItem('fathom_temp_recording')
    sessionStorage.removeItem('fathom_temp_transcript')
    sessionStorage.removeItem('fathom_temp_summary')
    sessionStorage.removeItem('fathom_temp_title')
    setVideoUrl(null)
    setDeleted(true)
  }

  if (deleted) {
    return (
      <DashboardLayout showBack backHref="/" backLabel="Dashboard">
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-slate-400 text-lg mb-6">Recording deleted. Storage freed.</p>
          <Button onClick={() => router.push('/')}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    )
  }

  if (!videoUrl) {
    return (
      <DashboardLayout showBack backHref="/" backLabel="Dashboard">
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-slate-400 text-lg mb-6">No recording found in this session.</p>
          <Button onClick={() => router.push('/')}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout showBack backHref="/" backLabel="Back to Dashboard">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Stored locally in this browser session · will clear on tab close</p>
          </div>
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Recording
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Video + Transcript */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Video */}
            <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video">
              <video
                ref={videoRef}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-indigo-500" />
                <h2 className="font-semibold text-slate-800">Transcript</h2>
              </div>
              {transcript && transcript.trim().length > 0 ? (
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{transcript}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No speech was detected. Make sure to speak during the recording. Chrome and Edge support live transcription — Safari does not.
                </p>
              )}
            </div>
          </div>

          {/* Right: AI Summary */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Overview */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h2 className="font-semibold text-slate-800">AI Summary</h2>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {summary?.overview || 'Summary will appear once a transcript is available.'}
              </p>
            </div>

            {/* Key Points */}
            {summary && summary.key_points.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h2 className="font-semibold text-slate-800 mb-3">Key Points</h2>
                <ul className="space-y-2">
                  {summary.key_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {summary && summary.action_items.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  <h2 className="font-semibold text-slate-800">Action Items</h2>
                </div>
                <ul className="space-y-2">
                  {summary.action_items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="w-4 h-4 rounded border-2 border-slate-300 mt-0.5 shrink-0" />
                      <span className="text-slate-700">
                        <span className="font-medium text-slate-900">{item.assignee}:</span> {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
