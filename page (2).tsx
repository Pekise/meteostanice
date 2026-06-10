import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  try {
    await initDb();
    const sql = getDb();
    // Get all readings from today (Prague timezone)
    const rows = await sql`
      SELECT 
        to_char(recorded_at AT TIME ZONE 'Europe/Prague', 'HH24:MI') AS time,
        temp_out, humidity_out, pressure, wind_speed, rainfall, uv_index, light_klux
      FROM readings
      WHERE recorded_at >= (NOW() AT TIME ZONE 'Europe/Prague')::date AT TIME ZONE 'Europe/Prague'
      ORDER BY recorded_at ASC
    `;
    return NextResponse.json({ success: true, rows });
  } catch (e: any) {
    return NextResponse.json({ success: false, msg: e.message }, { status: 500 });
  }
}
