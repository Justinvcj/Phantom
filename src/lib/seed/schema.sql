CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE
);

CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  date timestamptz,
  duration_seconds int,
  recording_url text,
  status text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  name text,
  email text
);

CREATE TABLE IF NOT EXISTS transcript_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  speaker_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  start_time int,
  end_time int,
  text text
);

CREATE TABLE IF NOT EXISTS summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  template text,
  overview text,
  key_points jsonb,
  generated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  assignee text,
  text text,
  due_date date,
  completed boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  start_time int,
  end_time int,
  note text,
  created_at timestamptz DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

-- ALLOW PUBLIC READ (SELECT)
CREATE POLICY "Allow public select on users" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public select on meetings" ON meetings FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public select on participants" ON participants FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public select on transcript_segments" ON transcript_segments FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public select on summaries" ON summaries FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public select on action_items" ON action_items FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public select on highlights" ON highlights FOR SELECT TO anon USING (true);

-- BLOCK PUBLIC MUTATIONS
-- (Mutations must go through Server Actions using the service_role key, which bypasses RLS)
