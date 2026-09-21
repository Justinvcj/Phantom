import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const sql = postgres(process.env.SUPABASE_DB_URL!);
  try {
    await sql`INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT DO NOTHING`;
    console.log('Bucket created!');
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}
run();
