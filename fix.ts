import postgres from 'postgres';
async function fix() {
  const sql = postgres(process.env.SUPABASE_DB_URL!);
  await sql`UPDATE summaries SET key_points = '["Stress test", "1000 segments", "8 people"]'::jsonb WHERE overview = 'Massive stress test meeting summary.'`;
  console.log("Fixed!");
  await sql.end();
}
fix();
