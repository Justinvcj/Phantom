'use server'

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { generateSummary, SummaryTemplate } from "@/lib/ai"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const GenerateSummarySchema = z.object({
  meetingId: z.string().uuid(),
  template: z.enum(['general', 'sales', 'product', 'interview'])
})

export async function generateMeetingSummary(rawMeetingId: string, rawTemplate: SummaryTemplate) {
  const { meetingId, template } = GenerateSummarySchema.parse({ meetingId: rawMeetingId, template: rawTemplate })
  const supabase = createClient()
  const supabaseAdmin = createAdminClient()

  // 1. Fetch transcript segments
  const { data: transcripts, error } = await supabase
    .from('transcript_segments')
    .select('text, start_time, participants(name)')
    .eq('meeting_id', meetingId)
    .order('start_time', { ascending: true })

  if (error || !transcripts || transcripts.length === 0) {
    throw new Error("No transcript found to summarize")
  }

  // Combine transcript into a formatted string for the AI
  const fullTranscript = transcripts
    .map(t => `${Array.isArray(t.participants) ? t.participants[0]?.name : (t.participants as any)?.name || 'Unknown'}: ${t.text}`)
    .join('\n')

  // 2. Call AI API
  const summary = await generateSummary(fullTranscript, template)

  // 3. Upsert the summary into the database
  const { data: existingSummary } = await supabaseAdmin
    .from('summaries')
    .select('id')
    .eq('meeting_id', meetingId)
    .single()

  if (existingSummary) {
    await supabaseAdmin
      .from('summaries')
      .update({
        template,
        overview: summary.overview,
        key_points: summary.key_points,
        generated_at: new Date().toISOString()
      })
      .eq('id', existingSummary.id)
  } else {
    await supabaseAdmin
      .from('summaries')
      .insert({
        meeting_id: meetingId,
        template,
        overview: summary.overview,
        key_points: summary.key_points,
        generated_at: new Date().toISOString()
      })
  }

  // Replace action items
  await supabaseAdmin.from('action_items').delete().eq('meeting_id', meetingId)
  
  if (summary.action_items && summary.action_items.length > 0) {
    const actionItemsToInsert = summary.action_items.map(ai => ({
      meeting_id: meetingId,
      assignee: ai.assignee,
      text: ai.text,
      // Default due date to +7 days for now
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    }))
    await supabaseAdmin.from('action_items').insert(actionItemsToInsert)
  }

  revalidatePath(`/meetings/${meetingId}`)
}

const CreateHighlightSchema = z.object({
  meetingId: z.string().uuid(),
  startTime: z.number().nonnegative(),
  endTime: z.number().positive(),
  note: z.string().max(1000)
})

export async function createHighlight(rawMeetingId: string, rawStartTime: number, rawEndTime: number, rawNote: string) {
  const { meetingId, startTime, endTime, note } = CreateHighlightSchema.parse({
    meetingId: rawMeetingId,
    startTime: rawStartTime,
    endTime: rawEndTime,
    note: rawNote
  })

  const supabaseAdmin = createAdminClient()
  
  await supabaseAdmin
    .from('highlights')
    .insert({
      meeting_id: meetingId,
      start_time: Math.floor(startTime),
      end_time: Math.floor(endTime),
      note
    })

  revalidatePath(`/meetings/${meetingId}`)
}
