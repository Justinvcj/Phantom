'use client'

import { useRef, useEffect } from 'react'

export function Player({ 
  url, 
  onTimeUpdate,
  seekTime
}: { 
  url: string, 
  onTimeUpdate: (time: number) => void,
  seekTime?: number
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

  useEffect(() => {
    const video = videoRef.current
    if (video && seekTime !== undefined && seekTime >= 0) {
      video.currentTime = seekTime
      video.play().catch(e => console.log('Autoplay prevented', e))
    }
  }, [seekTime])

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
