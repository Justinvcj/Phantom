import fs from "fs";
import path from "path";
import postgres from "postgres";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

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

  // Mock users
  const users = [
    { name: 'Demo User', email: 'demo@example.com' },
    { name: 'Alice Johnson', email: 'alice@example.com' },
    { name: 'Bob Smith', email: 'bob@example.com' },
    { name: 'Charlie Davis', email: 'charlie@example.com' },
    { name: 'Diana Prince', email: 'diana@example.com' },
    { name: 'Ethan Hunt', email: 'ethan@example.com' },
    { name: 'Fiona Gallagher', email: 'fiona@example.com' },
    { name: 'George Costanza', email: 'george@example.com' },
  ];

  const userIds: Record<string, string> = {};
  for (const u of users) {
    const res = await sql`
      INSERT INTO users (name, email) VALUES (${u.name}, ${u.email}) RETURNING id
    `;
    userIds[u.name] = res[0].id;
  }

  // 1. Stress Test Meeting: Q3 Product Strategy (1h03m, 8 participants, 1000 segments)
  const stressRes = await sql`
    INSERT INTO meetings (title, description, date, duration_seconds, recording_url, status)
    VALUES ('Q3 Product Strategy', 'Stress test meeting', now(), 3780, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'ready')
    RETURNING id
  `;
  const m1 = stressRes[0].id;

  // Insert all 8 participants for m1
  const participantIds: Record<string, string> = {};
  for (const u of users) {
    const res = await sql`INSERT INTO participants (meeting_id, name, email) VALUES (${m1}, ${u.name}, ${u.email}) RETURNING id`;
    participantIds[u.name] = res[0].id;
  }
  
  const allUserNames = users.map(u => u.name);
  
  // Generate 1000 segments
  console.log("Generating 1050 segments for stress test...");
  const segments = [];
  for (let i = 0; i < 1050; i++) {
    const speakerName = allUserNames[i % 8];
    const speakerId = participantIds[speakerName];
    const start = Math.floor(i * 3.6);
    const end = Math.floor(start + 3.5);
    const text = `This is transcript segment number ${i + 1} spoken by ${speakerName} during the Q3 planning session. We need to make sure this scales correctly.`;
    segments.push({ meeting_id: m1, speaker_id: speakerId, start_time: start, end_time: end, text });
  }
  await sql`INSERT INTO transcript_segments ${sql(segments)}`;

  await sql`
    INSERT INTO summaries (meeting_id, template, overview, key_points)
    VALUES (${m1}, 'general', 'Massive stress test meeting summary.', '["Stress test", "1000 segments", "8 people"]'::jsonb)
  `;

  console.log("Generating 10 action items...");
  const actionItems = [];
  for (let i = 0; i < 10; i++) {
    const assignee = allUserNames[i % 8];
    actionItems.push({
      meeting_id: m1,
      assignee,
      text: `Action item task ${i + 1} for ${assignee}`,
      due_date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0]
    });
  }
  await sql`INSERT INTO action_items ${sql(actionItems)}`;

  console.log("Generating 12 highlights...");
  const highlights = [];
  for (let i = 0; i < 12; i++) {
    const start = i * 300;
    const end = start + 30;
    highlights.push({
      meeting_id: m1,
      start_time: start,
      end_time: end,
      note: `Highlight note ${i + 1} regarding Q3 architecture`
    });
  }
  await sql`INSERT INTO highlights ${sql(highlights)}`;

  // 2. Engineering Sync
  await sql`INSERT INTO meetings (title, description, date, duration_seconds, recording_url, status) VALUES ('Engineering Sync', 'Weekly eng', now(), 2040, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'ready')`;
  // 3. Client Discovery
  await sql`INSERT INTO meetings (title, description, date, duration_seconds, recording_url, status) VALUES ('Client Discovery', 'Acme Corp', now(), 2520, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'ready')`;
  // 4. Weekly 1:1
  await sql`INSERT INTO meetings (title, description, date, duration_seconds, recording_url, status) VALUES ('Weekly 1:1', 'Manager sync', now(), 1680, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'ready')`;
  // 5. Sprint Planning
  await sql`INSERT INTO meetings (title, description, date, duration_seconds, recording_url, status) VALUES ('Sprint Planning', 'Sprint 42', now(), 3060, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'ready')`;
  // 6. Design Review
  await sql`INSERT INTO meetings (title, description, date, duration_seconds, recording_url, status) VALUES ('Design Review', 'UI mocks', now(), 2220, 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'ready')`;

  console.log("Seed complete.");
  await sql.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
