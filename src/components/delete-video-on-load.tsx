'use client'

import { useEffect, useRef } from 'react'
import { deleteMeetingRecording } from '@/app/actions'

export function DeleteVideoOnLoad({ meetingId, hasVideo }: { meetingId: string, hasVideo: boolean }) {
  const deletedRef = useRef(false)
  
  useEffect(() => {
    if (hasVideo && !deletedRef.current) {
      deletedRef.current = true
      // Wait a few seconds to ensure the user sees the video is loaded, then delete it from DB to save space
      setTimeout(() => {
        deleteMeetingRecording(meetingId).catch(console.error)
      }, 5000)
    }
  }, [meetingId, hasVideo])

  return null
}
