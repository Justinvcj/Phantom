'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export default function RecordingPreviewPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [deleted, setDeleted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Read the base64 recording saved by the modal
    const stored = sessionStorage.getItem('fathom_temp_recording')
    if (stored) {
      setVideoUrl(stored)
    }
  }, [])

  // Wire video src after URL is set
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.src = videoUrl
    }
  }, [videoUrl])

  const handleDelete = () => {
    sessionStorage.removeItem('fathom_temp_recording')
    setVideoUrl(null)
    setDeleted(true)
  }

  return (
    <DashboardLayout showBack backHref="/" backLabel="Back to Dashboard">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Recording Preview</h1>
          <p className="text-slate-500 mt-1">
            Your 10-second recording is saved locally in this browser session.
            It will be cleared when you close the tab.
          </p>
        </div>

        {deleted ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
            <p className="text-slate-400 text-lg">Recording deleted. Space is free again.</p>
            <Button className="mt-6" onClick={() => router.push('/')}>Back to Dashboard</Button>
          </div>
        ) : videoUrl ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Video Player */}
            <div className="bg-black aspect-video w-full">
              <video
                ref={videoRef}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Controls */}
            <div className="p-6 flex items-center justify-between border-t border-slate-100">
              <div>
                <p className="font-semibold text-slate-800">Live Recording</p>
                <p className="text-sm text-slate-500">Recorded just now · stored in browser session only</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/')}>
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete & Free Space
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
            <p className="text-slate-400 text-lg">No recording found.</p>
            <Button className="mt-6" onClick={() => router.push('/')}>Back to Dashboard</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
