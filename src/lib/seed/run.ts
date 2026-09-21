import fs from "fs";
import path from "path";
import postgres from "postgres";

const dbUrl = process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: "require" });

async function seed() {
  console.log("Seeding database...");
  
  // Read and execute schema
  const schemaPath = path.join(process.cwd(), "src/lib/seed/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  
  console.log("Executing schema...");
  // Split by statements and execute
  const statements = schema.split(";").filter((s) => s.trim().length > 0);
  for (const statement of statements) {
    await sql.unsafe(statement);
  }

  // Clear existing
  console.log("Clearing existing data...");
  await sql`DELETE FROM users`;
  await sql`DELETE FROM meetings`;

  console.log("Inserting seed data...");

  // Mock user
  await sql`
    INSERT INTO users (name, email) 
    VALUES ('Demo User', 'demo@example.com')
    RETURNING id
  `;

  // 1. Fake sync meeting (Phase 3 tests Transcript+Player sync)
  const meetingRes = await sql`
    INSERT INTO meetings (title, description, date, duration_seconds, recording_url, status)
    VALUES (
      'Product Sync', 
      'Weekly sync to discuss product roadmap and upcoming launch', 
      now(), 
      3600, 
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', -- Working sample video
      'ready'
    )
    RETURNING id
  `;
  const meetingId = meetingRes[0].id;

  // Participants
  const participantsRes = await sql`
    INSERT INTO participants (meeting_id, name, email)
    VALUES 
      (${meetingId}, 'Alice Johnson', 'alice@example.com'),
      (${meetingId}, 'Bob Smith', 'bob@example.com')
    RETURNING id, name
  `;
  const aliceId = participantsRes.find(p => p.name === 'Alice Johnson')?.id;
  const bobId = participantsRes.find(p => p.name === 'Bob Smith')?.id;

  // Transcript Segments
  const transcripts = [
    { start: 0, end: 5, speaker_id: aliceId, text: "Hey Bob, how are you doing today?" },
    { start: 6, end: 10, speaker_id: bobId, text: "Doing well, Alice. Just wrapping up the design docs." },
    { start: 11, end: 20, speaker_id: aliceId, text: "Great. Let's talk about the new feature rollout for Q3. I think we should prioritize the dashboard redesign." },
    { start: 21, end: 35, speaker_id: bobId, text: "Agreed. The feedback from the beta users was that it's a bit cluttered. We need to streamline the meeting view." },
    { start: 36, end: 45, speaker_id: aliceId, text: "Exactly. I'll take an action item to review the new Figma mocks by Thursday." },
  ];

  for (const t of transcripts) {
    await sql`
      INSERT INTO transcript_segments (meeting_id, speaker_id, start_time, end_time, text)
      VALUES (${meetingId}, ${t.speaker_id}, ${t.start}, ${t.end}, ${t.text})
    `;
  }

  // Summary
  await sql`
    INSERT INTO summaries (meeting_id, template, overview, key_points)
    VALUES (
      ${meetingId}, 
      'general', 
      'The team discussed the Q3 product roadmap with a focus on the dashboard redesign based on beta user feedback.',
      '["Dashboard redesign is priority for Q3", "Beta users found current view cluttered", "New Figma mocks to be reviewed by Thursday"]'::jsonb
    )
  `;

  // Action Items
  await sql`
    INSERT INTO action_items (meeting_id, assignee, text, due_date)
    VALUES (
      ${meetingId}, 
      'Alice Johnson', 
      'Review the new Figma mocks for the dashboard redesign', 
      CURRENT_DATE + 3
    )
  `;

  console.log("Seed complete.");
  await sql.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
