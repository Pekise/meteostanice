'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Reading = {
  temp_out: number | null; humidity_out: number | null;
  pressure: number | null; wind_speed: number | null;
  rainfall: number | null; uv_index: number | null;
};

function uvLabel(u: number) {
  return u <= 2 ? 'Nízký' : u <= 5 ? 'Střední' : u <= 7 ? 'Vysoký' : u <= 10 ? 'Velmi vysoký' : 'Extrémní';
}
function uvColor(u: number) {
  return u <= 2 ? '#22c55e' : u <= 5 ? '#eab308' : u <= 7 ? '#f97316' : u <= 10 ? '#ef4444' : '#7c3aed';
}
function windDesc(s: number) {
  return s < 1 ? 'Bezvětří' : s < 6 ? 'Vánek' : s < 12 ? 'Slabý vítr' : s < 20 ? 'Mírný vítr' : s < 29 ? 'Čerstvý vítr' : s < 39 ? 'Silný vítr' : 'Bouřlivý vítr';
}

export default function Home() {
  const [data, setData] = useState<Reading | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'err'>('loading');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('cs-CZ'));
      setDate(now.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    fetch('/api/tuya')
      .then(r => r.json())
      .then(d => { if (d.success) { setData(d.result); setStatus('ok'); } else setStatus('err'); })
      .catch(() => setStatus('err'));
  }, []);

  const temp = data?.temp_out;
  const hum = data?.humidity_out;
  const pres = data?.pressure;
  const wind = data?.wind_speed;
  const rain = data?.rainfall;
  const uv = data?.uv_index;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white mb-5 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-200 text-sm font-medium capitalize">{date}</p>
            <p className="text-blue-200 text-xs font-mono mt-0.5">Ostrava · {time}</p>
          </div>
          <div className={`text-xs font-mono px-2 py-1 rounded-full ${status === 'ok' ? 'bg-blue-400/40' : 'bg-red-400/40'}`}>
            {status === 'ok' ? '● Online' : status === 'loading' ? '○ Načítám…' : '● Offline'}
          </div>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-8xl font-bold font-mono leading-none">
            {temp != null ? temp : '--'}
          </span>
          <span className="text-4xl text-blue-200 mb-2">°C</span>
        </div>
        <p className="text-blue-200 text-sm mt-2">
          {hum != null ? `Vlhkost ${hum} %` : ''}
          {hum != null && pres != null ? ' · ' : ''}
          {pres != null ? `Tlak ${pres} hPa` : ''}
        </p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">💨 Vítr</p>
          <p className="font-mono font-bold text-lg leading-none">{wind != null ? wind : '--'}</p>
          <p className="text-xs text-gray-400">km/h</p>
          <p className="text-xs text-gray-500 mt-1">{wind != null ? windDesc(wind) : ''}</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">🌧 Srážky</p>
          <p className="font-mono font-bold text-lg leading-none">{rain != null ? rain : '--'}</p>
          <p className="text-xs text-gray-400">mm dnes</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
          <p className="text-xs text-gray-400 mb-1">☀️ UV</p>
          <p className="font-mono font-bold text-lg leading-none" style={{ color: uv != null ? uvColor(uv) : '#aaa' }}>{uv != null ? uv : '--'}</p>
          <p className="text-xs text-gray-400">{uv != null ? uvLabel(uv) : ''}</p>
        </div>
      </div>

      {/* Nav cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/stanice" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
          <span className="text-3xl">📡</span>
          <p className="font-semibold text-gray-800">Stanice</p>
          <p className="text-xs text-gray-400">Živá data, grafy, historie měření</p>
          <span className="text-xs text-blue-500 font-medium mt-1">Otevřít →</span>
        </Link>
        <Link href="/radar" className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
          <span className="text-3xl">🌧</span>
          <p className="font-semibold text-gray-800">Radar</p>
          <p className="text-xs text-gray-400">Srážkový radar pro Ostravu a okolí</p>
          <span className="text-xs text-blue-500 font-medium mt-1">Otevřít →</span>
        </Link>
      </div>

      <p className="text-center text-xs font-mono text-gray-300 mt-8">Vevor YT60307 · data se aktualizují každých 60 s</p>
    </main>
  );
}
