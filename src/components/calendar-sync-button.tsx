'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Loader2, Check } from 'lucide-react'

export function CalendarSyncButton() {
  const [state, setState] = useState<'idle' | 'syncing' | 'synced'>('idle')

  const handleSync = () => {
    setState('syncing')
    setTimeout(() => {
      setState('synced')
    }, 1500)
  }

  if (state === 'synced') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-sm font-medium">
        <Check className="w-4 h-4" />
        Calendar Synced: 6 upcoming meetings found.
      </div>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSync}
      disabled={state === 'syncing'}
      className="text-slate-600 border-slate-200 hover:bg-slate-50"
    >
      {state === 'syncing' ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-400" />
      ) : (
        <Calendar className="w-4 h-4 mr-2" />
      )}
      Connect Google Calendar
    </Button>
  )
}
