'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, CheckCircle, Video, StopCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { saveMeetingRecording } from '@/app/actions'

export function NewMeetingModal({ demoMeetingId }: { demoMeetingId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'preview' | 'recording' | 'processing' | 'ready'>('idle')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // FIX 1: Wire stream to video element whenever stream changes.
  // This runs AFTER the video element is rendered in the DOM,
  // fixing the black screen caused by assigning srcObject before mount.
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Initialize camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(mediaStream)
      // NOTE: We no longer set srcObject here — the useEffect above handles it
      setState('preview')
    } catch (err) {
      console.error('Error accessing media devices:', err)
      alert('Could not access camera/microphone. Please check browser permissions.')
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    // Delay camera start slightly to let the modal render first
    setTimeout(() => startCamera(), 100)
  }

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setStream(null)
    setIsOpen(false)
    setState('idle')
    setTimeLeft(10)
  }

  const startRecording = () => {
    if (!stream) return
    
    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(stream)
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      if (timerRef.current) clearInterval(timerRef.current)
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      processRecording(blob)
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setState('recording')
    setTimeLeft(10)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-stop when countdown hits zero
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
          }
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const processRecording = (blob: Blob) => {
    setState('processing')
    
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = async () => {
      const base64data = reader.result as string
      
      // Always save to sessionStorage first — this is the guaranteed local fallback
      // that works even when Supabase is unreachable
      try {
        sessionStorage.setItem('fathom_temp_recording', base64data)
      } catch (storageErr) {
        console.warn('sessionStorage full, recording too large:', storageErr)
      }

      try {
        // Try to also persist to DB (will fail gracefully if DB is down)
        const newMeetingId = await saveMeetingRecording(base64data)
        setState('ready')
        setTimeout(() => {
          handleClose()
          router.push(`/meetings/${newMeetingId}`)
        }, 1500)
      } catch (err) {
        console.warn('DB save failed, redirecting to local preview:', err)
        setState('ready')
        setTimeout(() => {
          handleClose()
          // Always redirect to the local preview page — no more /meetings/undefined 404
          router.push('/recording/preview')
        }, 1500)
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [stream])

  return (
    <>
      <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleOpen}>
        <Plus className="w-4 h-4 mr-2" />
        New Demo Meeting
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">Record Meeting</h2>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 flex flex-col items-center">
              
              {(state === 'preview' || state === 'recording') && (
                <div className="w-full relative rounded-lg overflow-hidden bg-slate-900 aspect-video mb-6">
                  {/* FIX 1: video element always rendered so ref is available for srcObject assignment */}
                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {state === 'recording' && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-white text-xs font-bold uppercase tracking-widest">
                        REC 0:{timeLeft.toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  {state === 'preview' && (
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center">
                      <span className="text-white/70 text-xs bg-black/40 px-3 py-1 rounded-full">
                        Camera preview — press Start Recording to begin
                      </span>
                    </div>
                  )}
                </div>
              )}

              {state === 'preview' && (
                <Button size="lg" onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white w-56">
                  <Video className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              )}

              {state === 'recording' && (
                <div className="flex flex-col items-center gap-3 w-full">
                  {/* Visual progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-red-500 h-2.5 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(timeLeft / 10) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-500">{timeLeft}s remaining — recording will auto-stop</p>
                  <Button size="lg" onClick={stopRecording} variant="outline" className="w-56 border-red-200 text-red-600 hover:bg-red-50">
                    <StopCircle className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                </div>
              )}

              {state === 'processing' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Saving Recording</h3>
                  <p className="text-slate-500 text-sm">Transcribing and generating AI summary...</p>
                </div>
              )}

              {state === 'ready' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Done!</h3>
                  <p className="text-slate-500 text-sm">Redirecting to your meeting workspace...</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
