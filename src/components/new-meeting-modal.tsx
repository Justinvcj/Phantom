'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Video, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function NewMeetingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, setState] = useState<'idle' | 'recording' | 'processing' | 'ready'>('idle')
  const router = useRouter()

  const handleStart = () => {
    setIsOpen(true)
    setState('recording')

    // Simulate 3 seconds of recording
    setTimeout(() => {
      setState('processing')
      
      // Simulate 3 seconds of processing
      setTimeout(() => {
        setState('ready')
        
        // Auto-close and refresh after 2 seconds
        setTimeout(() => {
          setIsOpen(false)
          setState('idle')
          router.refresh()
        }, 2000)
      }, 3000)
    }, 3000)
  }

  return (
    <>
      <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleStart}>
        <Plus className="w-4 h-4 mr-2" />
        New Meeting
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-[400px] overflow-hidden flex flex-col p-6 animate-in zoom-in-95">
            
            <h2 className="text-xl font-bold mb-6">Capture Meeting</h2>

            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              
              {state === 'recording' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Recording...</h3>
                  <p className="text-slate-500 text-sm">Listening to your conversation</p>
                </>
              )}

              {state === 'processing' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Processing</h3>
                  <p className="text-slate-500 text-sm">Transcribing and generating AI summary...</p>
                </>
              )}

              {state === 'ready' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Ready!</h3>
                  <p className="text-slate-500 text-sm">Your meeting has been saved.</p>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
