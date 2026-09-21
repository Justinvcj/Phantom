'use client'

import { useRef, useEffect } from 'react'

export function Player({ 
  url, 
  onTimeUpdate 
}: { 
  url: string, 
  onTimeUpdate: (time: number) => void 
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [onTimeUpdate])

  return (
    <div className="relative w-full aspect-video bg-black flex items-center justify-center">
      {url ? (
        <video 
          ref={videoRef}
          src={url}
          controls
          className="w-full h-full object-contain"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="text-slate-500">No recording available</div>
      )}
    </div>
  )
}
