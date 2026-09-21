'use server'

import { createClient } from "@/lib/supabase/server"
import { generateSummary, SummaryTemplate } from "@/lib/ai"
import { revalidatePath } from "next/cache"

export async function generateMeetingSummary(meetingId: string, template: SummaryTemplate) {
  const supabase = createClient()

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
  const { data: existingSummary } = await supabase
    .from('summaries')
    .select('id')
    .eq('meeting_id', meetingId)
    .single()

  if (existingSummary) {
    await supabase
      .from('summaries')
      .update({
        template,
        overview: summary.overview,
        key_points: summary.key_points,
        generated_at: new Date().toISOString()
      })
      .eq('id', existingSummary.id)
  } else {
    await supabase
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
  await supabase.from('action_items').delete().eq('meeting_id', meetingId)
  
  if (summary.action_items && summary.action_items.length > 0) {
    const actionItemsToInsert = summary.action_items.map(ai => ({
      meeting_id: meetingId,
      assignee: ai.assignee,
      text: ai.text,
      // Default due date to +7 days for now
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    }))
    await supabase.from('action_items').insert(actionItemsToInsert)
  }

  revalidatePath(`/meetings/${meetingId}`)
}

export async function createHighlight(meetingId: string, startTime: number, endTime: number, note: string) {
  const supabase = createClient()
  
  await supabase
    .from('highlights')
    .insert({
      meeting_id: meetingId,
      start_time: Math.floor(startTime),
      end_time: Math.floor(endTime),
      note
    })

  revalidatePath(`/meetings/${meetingId}`)
}
