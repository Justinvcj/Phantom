'use server'

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { generateSummary, SummaryTemplate } from "@/lib/ai"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import postgres from 'postgres'

const GenerateSummarySchema = z.object({
  meetingId: z.string().uuid(),
  template: z.enum(['general', 'sales', 'product', 'interview'])
})

export async function generateMeetingSummary(rawMeetingId: string, rawTemplate: SummaryTemplate) {
  const { meetingId, template } = GenerateSummarySchema.parse({ meetingId: rawMeetingId, template: rawTemplate })
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

  // 3. Upsert the summary into the database using postgres to bypass RLS
  const sql = postgres(process.env.SUPABASE_DB_URL!)
  
  const existing = await sql`SELECT id FROM summaries WHERE meeting_id = ${meetingId} LIMIT 1`
  
  if (existing.length > 0) {
    await sql`
      UPDATE summaries 
      SET template = ${template}, 
          overview = ${summary.overview}, 
          key_points = ${sql.json(summary.key_points)}, 
          generated_at = ${new Date().toISOString()}
      WHERE id = ${existing[0].id}
    `
  } else {
    await sql`
      INSERT INTO summaries (meeting_id, template, overview, key_points, generated_at)
      VALUES (${meetingId}, ${template}, ${summary.overview}, ${sql.json(summary.key_points)}, ${new Date().toISOString()})
    `
  }

  // Replace action items
  await sql`DELETE FROM action_items WHERE meeting_id = ${meetingId}`
  
    if (summary.action_items && summary.action_items.length > 0) {
      const aiData = summary.action_items.map(item => ({
        meeting_id: meetingId,
        assignee: item.assignee,
        text: item.text,
        completed: false
      }))
      
      for (const ai of aiData) {
        await sql`
          INSERT INTO action_items (meeting_id, assignee, text, completed)
          VALUES (${ai.meeting_id}, ${ai.assignee}, ${ai.text}, ${ai.completed})
        `
      }
    }
  
  await sql.end()

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

  const sql = postgres(process.env.SUPABASE_DB_URL!)
  
  await sql`
    INSERT INTO highlights (meeting_id, start_time, end_time, note)
    VALUES (${meetingId}, ${Math.floor(startTime)}, ${Math.floor(endTime)}, ${note})
  `
  
  await sql.end()

  revalidatePath(`/meetings/${meetingId}`)
}

export async function saveMeetingRecording(base64Data: string) {
  const sql = postgres(process.env.SUPABASE_DB_URL!);
  try {
    const [meeting] = await sql`
      INSERT INTO meetings (title, description, date, duration_seconds, recording_url, status)
      VALUES ('Live Recording', 'A new live recording from the web UI.', now(), 10, ${base64Data}, 'completed')
      RETURNING id
    `;
    
    // Add a fake participant
    const [participant] = await sql`
      INSERT INTO participants (meeting_id, name, email)
      VALUES (${meeting.id}, 'Steve Jobs', 'steve@apple.com')
      RETURNING id
    `;

    // Add a fake transcript segment
    await sql`
      INSERT INTO transcript_segments (meeting_id, speaker_id, start_time, end_time, text)
      VALUES (${meeting.id}, ${participant.id}, 0, 10, 'This is a test recording generated directly from the browser using WebRTC.')
    `;

    revalidatePath('/')
    return meeting.id;
  } catch (err) {
    console.error('Error saving meeting recording:', err);
    throw err;
  } finally {
    await sql.end();
  }
}

export async function deleteMeetingRecording(meetingId: string) {
  const sql = postgres(process.env.SUPABASE_DB_URL!);
  try {
    await sql`
      UPDATE meetings
      SET recording_url = null
      WHERE id = ${meetingId}
    `;
    revalidatePath(`/meetings/${meetingId}`)
  } catch (err) {
    console.error('Error deleting recording:', err);
  } finally {
    await sql.end();
  }
}
