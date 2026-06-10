import { NextResponse } from 'next/server';
import { fetchStationData } from '@/lib/tuya';
import { getDb, initDb } from '@/lib/db';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  try {
    const reading = await fetchStationData();
    // Save to DB
    try {
      await initDb();
      const sql = getDb();
      await sql`
        INSERT INTO readings (temp_out, temp_in, humidity_out, humidity_in, pressure, wind_speed, wind_gust, wind_dir, rainfall, uv_index, light_klux)
        VALUES (${reading.temp_out}, ${reading.temp_in}, ${reading.humidity_out}, ${reading.humidity_in}, ${reading.pressure}, ${reading.wind_speed}, ${reading.wind_gust}, ${reading.wind_dir}, ${reading.rainfall}, ${reading.uv_index}, ${reading.light_klux})
      `;
    } catch (dbErr) {
      console.error('DB write error:', dbErr);
    }
    return NextResponse.json({ success: true, result: reading });
  } catch (e: any) {
    return NextResponse.json({ success: false, msg: e.message }, { status: 500 });
  }
}
