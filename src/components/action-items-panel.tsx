'use client'

import { useState, useTransition } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { toggleActionItem } from '@/app/actions-client'
import { Calendar, User } from 'lucide-react'

export function ActionItemsPanel({ 
  actionItems 
}: { 
  actionItems: any[] 
}) {
  const [items, setItems] = useState(actionItems || [])
  const [isPending, startTransition] = useTransition()

  const handleToggle = (id: string, currentStatus: boolean) => {
    // Optimistic update
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !currentStatus } : item
    ))

    startTransition(() => {
      toggleActionItem(id, !currentStatus)
    })
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        No action items generated yet.
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      {items.map((item) => (
        <div 
          key={item.id} 
          className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
            item.completed 
              ? 'bg-slate-50 border-slate-200 opacity-60' 
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <Checkbox 
            checked={item.completed} 
            onCheckedChange={() => handleToggle(item.id, item.completed)}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <p className={`text-sm ${item.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
              {item.text}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" /> {item.assignee}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(item.due_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
