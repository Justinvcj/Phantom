'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, CheckCircle, Video, StopCircle, X, Mic } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Extend window types for browser Speech Recognition API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any
  }
}

export function NewMeetingModal({ demoMeetingId }: { demoMeetingId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'preview' | 'recording' | 'processing' | 'ready'>('idle')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [liveTranscript, setLiveTranscript] = useState('')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef('')
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Wire stream to video element after render
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return // Safari fallback — silently skip

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += text + ' '
        } else {
          interim = text
        }
      }
      if (final) {
        finalTranscriptRef.current += final
      }
      setLiveTranscript(finalTranscriptRef.current + interim)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => console.warn('Speech recognition error:', e.error)
    recognition.start()
    recognitionRef.current = recognition
  }

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }

  // Initialize camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(mediaStream)
      setState('preview')
    } catch (err) {
      console.error('Error accessing media devices:', err)
      alert('Could not access camera/microphone. Please check browser permissions.')
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    finalTranscriptRef.current = ''
    setLiveTranscript('')
    setTimeout(() => startCamera(), 100)
  }

  const handleClose = () => {
    if (stream) stream.getTracks().forEach(track => track.stop())
    stopSpeechRecognition()
    if (timerRef.current) clearInterval(timerRef.current)
    setStream(null)
    setIsOpen(false)
    setState('idle')
    setTimeLeft(10)
    setLiveTranscript('')
    finalTranscriptRef.current = ''
  }

  const startRecording = () => {
    if (!stream) return
    
    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(stream)
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    mediaRecorder.onstop = () => {
      if (timerRef.current) clearInterval(timerRef.current)
      stopSpeechRecognition()
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      processRecording(blob)
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    startSpeechRecognition()
    setState('recording')
    setTimeLeft(10)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
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

  const generateSmartSummary = (transcript: string) => {
    const words = transcript.trim().split(/\s+/).filter(Boolean)
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 4)

    // Extract key points: pick up to 4 non-trivial sentences
    const keyPoints = sentences
      .filter(s => s.trim().split(' ').length > 4)
      .slice(0, 4)
      .map(s => s.trim().charAt(0).toUpperCase() + s.trim().slice(1))

    // Extract action items: look for intent phrases
    const actionKeywords = ['will', 'need to', 'should', 'going to', 'have to', 'must', 'plan to', 'want to']
    const actionItems = sentences
      .filter(s => actionKeywords.some(kw => s.toLowerCase().includes(kw)))
      .slice(0, 3)
      .map(s => ({ assignee: 'You', text: s.trim().charAt(0).toUpperCase() + s.trim().slice(1) }))

    if (actionItems.length === 0) {
      actionItems.push({ assignee: 'You', text: 'Follow up on topics discussed in this recording' })
    }

    const overview = transcript.trim().length > 30
      ? `This meeting recording captured ${words.length} words of conversation. ${keyPoints[0] ? keyPoints[0] + '.' : ''} The session covered key discussion points as transcribed live using browser speech recognition.`
      : 'Short recording captured. Speak for longer to generate a more detailed summary.'

    return { overview, key_points: keyPoints.length > 0 ? keyPoints : ['Recording captured successfully.'], action_items: actionItems }
  }

  const processRecording = (blob: Blob) => {
    setState('processing')
    
    const transcript = finalTranscriptRef.current.trim()
    const summary = generateSmartSummary(transcript)

    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
      const base64data = reader.result as string

      // Save everything to sessionStorage — works with no network
      try {
        sessionStorage.setItem('fathom_temp_recording', base64data)
        sessionStorage.setItem('fathom_temp_transcript', transcript)
        sessionStorage.setItem('fathom_temp_summary', JSON.stringify(summary))
        sessionStorage.setItem('fathom_temp_title', `Live Recording — ${new Date().toLocaleTimeString()}`)
      } catch (e) {
        console.warn('Storage quota issue:', e)
      }

      setState('ready')
      setTimeout(() => {
        handleClose()
        router.push('/recording/preview')
      }, 1200)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop())
      stopSpeechRecognition()
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

            <div className="p-6 flex flex-col items-center gap-4">
              
              {(state === 'preview' || state === 'recording') && (
                <div className="w-full relative rounded-lg overflow-hidden bg-slate-900 aspect-video">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {state === 'recording' && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-white text-xs font-bold tracking-widest">
                        REC 0:{timeLeft.toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  {state === 'preview' && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                      <span className="text-white/70 text-xs bg-black/40 px-3 py-1 rounded-full">
                        Camera ready — press Start Recording
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Live transcript box */}
              {state === 'recording' && (
                <div className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 min-h-[64px] max-h-[96px] overflow-y-auto">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Mic className="w-3 h-3 text-red-500 animate-pulse" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Live Transcript</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {liveTranscript || <span className="text-slate-400 italic">Listening for speech...</span>}
                  </p>
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
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(timeLeft / 10) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{timeLeft}s remaining · auto-stops at 0</p>
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
                  <h3 className="text-lg font-semibold text-slate-800">Processing Recording</h3>
                  <p className="text-slate-500 text-sm">Analysing transcript and generating summary...</p>
                </div>
              )}

              {state === 'ready' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Done!</h3>
                  <p className="text-slate-500 text-sm">Opening your meeting workspace...</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
