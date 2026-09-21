import postgres from 'postgres';
async function check() {
  const sql = postgres(process.env.SUPABASE_DB_URL!);
  const res = await sql`SELECT id, overview, key_points, pg_typeof(key_points) FROM summaries`;
  console.log(res);
  await sql.end();
}
check();
