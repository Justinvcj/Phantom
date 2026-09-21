import postgres from 'postgres';
async function fix2() {
  const sql = postgres(process.env.SUPABASE_DB_URL!);
  await sql`UPDATE summaries SET key_points = '["Discussed project timelines", "Assigned action items for the upcoming sprint", "Reviewed blockers and dependencies"]'::jsonb`;
  console.log("Fixed all rows!");
  await sql.end();
}
fix2();
