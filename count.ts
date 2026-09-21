import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { count: meetingCount } = await supabase.from('meetings').select('*', { count: 'exact', head: true });
  console.log(`Meetings: ${meetingCount}`);

  const { data: meeting1 } = await supabase.from('meetings').select('id, title').eq('title', 'Q3 Product Strategy').single();
  if (meeting1) {
    console.log(`Found Meeting 1: ${meeting1.title}`);
    
    const { count: transcriptCount } = await supabase.from('transcript_segments').select('*', { count: 'exact', head: true }).eq('meeting_id', meeting1.id);
    console.log(`Transcript Segments: ${transcriptCount}`);
    
    const { count: actionItemsCount } = await supabase.from('action_items').select('*', { count: 'exact', head: true }).eq('meeting_id', meeting1.id);
    console.log(`Action Items: ${actionItemsCount}`);

    const { count: highlightsCount } = await supabase.from('highlights').select('*', { count: 'exact', head: true }).eq('meeting_id', meeting1.id);
    console.log(`Highlights: ${highlightsCount}`);
  }
}
check();
