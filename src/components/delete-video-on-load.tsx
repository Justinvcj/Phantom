'use client'

import { useEffect, useRef } from 'react'
import { deleteMeetingRecording } from '@/app/actions'

export function DeleteVideoOnLoad({ meetingId, hasVideo }: { meetingId: string, hasVideo: boolean }) {
  const deletedRef = useRef(false)
  
  useEffect(() => {
    if (hasVideo && !deletedRef.current) {
      deletedRef.current = true
      // Wait 2 minutes to ensure the user can demo the video, then delete it from DB to save space (since base64 is huge)
      setTimeout(() => {
        deleteMeetingRecording(meetingId).catch(console.error)
      }, 120000)
    }
  }, [meetingId, hasVideo])

  return null
}
