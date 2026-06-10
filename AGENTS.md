import { neon } from '@neondatabase/serverless';

export function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS readings (
      id SERIAL PRIMARY KEY,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      temp_out NUMERIC(5,1),
      temp_in NUMERIC(5,1),
      humidity_out INTEGER,
      humidity_in INTEGER,
      pressure NUMERIC(7,1),
      wind_speed NUMERIC(5,1),
      wind_gust NUMERIC(5,1),
      wind_dir INTEGER,
      rainfall NUMERIC(6,1),
      uv_index INTEGER,
      light_klux NUMERIC(7,1)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS readings_recorded_at_idx ON readings(recorded_at DESC)`;
}
