'use client'

import { useState, useTransition } from 'react'
import { generateMeetingSummary } from '@/app/actions'
import { SummaryTemplate } from '@/lib/ai'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Loader2, Sparkles } from 'lucide-react'

export function SummaryPanel({ 
  meetingId, 
  summary 
}: { 
  meetingId: string, 
  summary: any 
}) {
  const [isPending, startTransition] = useTransition()
  const [currentTemplate, setCurrentTemplate] = useState<SummaryTemplate>(
    summary?.template as SummaryTemplate || 'general'
  )

  const handleGenerate = (template: SummaryTemplate) => {
    setCurrentTemplate(template)
    startTransition(() => {
      generateMeetingSummary(meetingId, template)
    })
  }

  const templateLabels: Record<SummaryTemplate, string> = {
    general: 'General Summary',
    sales: 'Sales Call',
    product: 'Product Sync',
    interview: 'Interview'
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI Summary
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {templateLabels[currentTemplate]}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(templateLabels) as SummaryTemplate[]).map(t => (
              <DropdownMenuItem key={t} onClick={() => handleGenerate(t)}>
                {templateLabels[t]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!summary && !isPending ? (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          No summary generated yet. Select a template to generate.
          <Button className="mt-4" onClick={() => handleGenerate('general')}>
            Generate Summary
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overview</h3>
            <div className={`p-4 bg-slate-50 rounded-lg text-sm leading-relaxed border border-slate-100 ${isPending ? 'opacity-50' : ''}`}>
              {summary?.overview}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Key Points</h3>
            <ul className={`list-disc list-inside space-y-2 text-sm text-slate-700 ${isPending ? 'opacity-50' : ''}`}>
              {summary?.key_points?.map((point: string, i: number) => (
                <li key={i} className="pl-2">{point}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
