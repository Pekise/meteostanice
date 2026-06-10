'use client';
import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

type Reading = {
  temp_out: number | null; temp_in: number | null;
  humidity_out: number | null; pressure: number | null;
  wind_speed: number | null; wind_gust: number | null;
  wind_dir: number | null; rainfall: number | null;
  uv_index: number | null; light_klux: number | null;
};
type HistRow = {
  time: string; temp_out: string; humidity_out: string;
  pressure: string; wind_speed: string; rainfall: string;
  uv_index: string; light_klux: string;
};

function dirName(deg: number) {
  return ['S','SSV','SV','VSV','V','VJV','JV','JJV','J','JJZ','JZ','ZJZ','Z','ZSZ','SZ','SSZ'][Math.round(deg/22.5)%16];
}
function uvLabel(u: number) {
  return u<=2?'nízký':u<=5?'střední':u<=7?'vysoký':u<=10?'velmi vysoký':'extrémní';
}

const CHARTS: Record<string, { label: string; title: string; color: string; field: keyof HistRow }> = {
  temp: { label:'°C',  title:'Teplota',      color:'#ef4444', field:'temp_out' },
  hum:  { label:'%',   title:'Vlhkost',      color:'#3b82f6', field:'humidity_out' },
  pres: { label:'hPa', title:'Tlak',         color:'#8b5cf6', field:'pressure' },
  wind: { label:'km/h',title:'Vítr',         color:'#10b981', field:'wind_speed' },
  rain: { label:'mm',  title:'Srážky',       color:'#06b6d4', field:'rainfall' },
  lux:  { label:'klux',title:'Osvětlenost',  color:'#f59e0b', field:'light_klux' },
};

export default function Stanice() {
  const [data, setData] = useState<Reading | null>(null);
  const [hist, setHist] = useState<HistRow[]>([]);
  const [status, setStatus] = useState<'connecting'|'online'|'error'>('connecting');
  const [errMsg, setErrMsg] = useState('');
  const [time, setTime] = useState('');
  const [ac, setAc] = useState('temp');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<Chart|null>(null);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date().toLocaleTimeString('cs-CZ')), 1000);
    return () => clearInterval(iv);
  }, []);

  async function fetchHistory() {
    try { const r = await fetch('/api/history'); const d = await r.json(); if(d.success) setHist(d.rows); } catch {}
  }
  async function fetchLive() {
    try {
      const r = await fetch('/api/tuya'); const d = await r.json();
      if(!d.success) throw new Error(d.msg||'API chyba');
      setData(d.result); setStatus('online'); fetchHistory();
    } catch(e:any) { setStatus('error'); setErrMsg(e.message); }
  }

  useEffect(() => { fetchHistory(); fetchLive(); const iv=setInterval(fetchLive,60000); return ()=>clearInterval(iv); }, []);

  useEffect(() => {
    if(!chartRef.current) return;
    const cfg = CHARTS[ac];
    const labels = hist.map(r=>r.time);
    const values = hist.map(r=>parseFloat(r[cfg.field] as string)||0);
    if(chartInst.current) chartInst.current.destroy();
    chartInst.current = new Chart(chartRef.current, {
      type: ac==='rain'?'bar':'line',
      data: { labels, datasets:[{ label:cfg.label, data:values, borderColor:cfg.color, backgroundColor:cfg.color+'22', borderWidth:1.5, pointRadius:0, fill:true, tension:0.4, borderRadius: ac==='rain'?3:0 }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}}, scales:{ x:{grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:9},maxRotation:0,autoSkip:true,maxTicksLimit:10,color:'#aaa'}}, y:{grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:9},color:'#aaa'}} } }
    });
  }, [hist, ac]);

  const d = data;
  const dp = d?.temp_out!=null&&d?.humidity_out!=null ? (d.temp_out-(100-d.humidity_out)/5).toFixed(1) : '--';

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 pb-12">
      <div className="flex items-start justify-between flex-wrap gap-2 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Meteorologická stanice</h1>
          <p className="text-xs text-gray-400 font-mono mt-1">Ostrava · Vevor YT60307 · {time}</p>
        </div>
        <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg border ${status==='online'?'text-green-700 bg-green-50 border-green-200':status==='error'?'text-red-600 bg-red-50 border-red-200':'text-gray-500 bg-gray-50 border-gray-200'}`}>
          <span className={`w-2 h-2 rounded-full ${status==='online'?'bg-green-500 animate-pulse':status==='error'?'bg-red-500':'bg-gray-400'}`}/>
          {status==='online'?'Online':status==='error'?'Chyba: '+errMsg:'Připojuji…'}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {[
          {label:'🌡 Teplota',    val:d?.temp_out,     unit:'°C',   sub:d?.temp_in!=null?`uvnitř ${d.temp_in} °C`:'', color:'bg-red-400'},
          {label:'💧 Vlhkost',   val:d?.humidity_out, unit:'%',    sub:`rosa při ${dp} °C`,                          color:'bg-blue-400'},
          {label:'⏱ Tlak',      val:d?.pressure,     unit:'hPa',  sub:'',                                           color:'bg-violet-400'},
          {label:'🌧 Srážky',    val:d?.rainfall,     unit:'mm',   sub:'dnes',                                       color:'bg-sky-400'},
          {label:'☀️ UV index',  val:d?.uv_index,     unit:'',     sub:d?.uv_index!=null?uvLabel(d.uv_index):'',     color:'bg-amber-400'},
          {label:'💡 Osvětlenost',val:d?.light_klux,  unit:'klux', sub:'',                                           color:'bg-yellow-300'},
        ].map(c=>(
          <div key={c.label} className="bg-white rounded-2xl shadow-sm p-4 relative overflow-hidden">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">{c.label}</p>
            <span className="font-mono text-3xl font-bold leading-none">{c.val??'--'}</span>
            {c.unit&&<span className="font-mono text-sm text-gray-400 ml-1">{c.unit}</span>}
            <p className="text-xs text-gray-400 font-mono mt-1.5">{c.sub||'\u00a0'}</p>
            <div className={`absolute bottom-0 left-0 h-1 w-3/5 ${c.color} opacity-40 rounded-tr`}/>
          </div>
        ))}
      </div>

      {/* Wind */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex items-center gap-5">
        <svg viewBox="0 0 80 80" className="w-20 h-20 flex-shrink-0">
          <circle cx="40" cy="40" r="37" fill="none" stroke="#e5e7eb" strokeWidth="1.5"/>
          {[['S',40,11],['V',69,43],['J',40,74],['Z',11,43]].map(([l,x,y])=>(
            <text key={l as string} x={x as number} y={y as number} textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#999">{l}</text>
          ))}
          <g transform={`rotate(${d?.wind_dir??0},40,40)`}>
            <polygon points="40,9 43,40 40,47 37,40" fill="#ef4444" opacity=".9"/>
            <polygon points="40,47 43,40 40,68 37,40" fill="#ccc" opacity=".6"/>
          </g>
          <circle cx="40" cy="40" r="4" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
        </svg>
        <div className="flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">💨 Vítr</p>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs text-gray-400">rychlost</span>
            <span className="font-mono text-xl font-bold">{d?.wind_speed??'--'}</span>
            <span className="text-xs text-gray-400">km/h</span>
          </div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs text-gray-400">nárazy</span>
            <span className="font-mono text-base">{d?.wind_gust??'--'}</span>
            <span className="text-xs text-gray-400">km/h</span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1">{d?.wind_dir!=null?`${dirName(d.wind_dir)} · ${d.wind_dir}°`:'-- · --°'}</p>
        </div>
      </div>

      {/* Chart */}
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Průběh dnes</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(CHARTS).map(([key,cfg])=>(
          <button key={key} onClick={()=>setAc(key)}
            className={`text-xs px-3 py-1 rounded-lg border transition-all ${ac===key?'bg-gray-200 text-gray-900 border-gray-300':'bg-white text-gray-400 border-gray-200'}`}>
            {cfg.title}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <p className="text-sm font-semibold mb-3">{CHARTS[ac].title} — dnes</p>
        {hist.length===0
          ? <div className="h-48 flex items-center justify-center text-sm text-gray-300">Zatím žádná data z dnešního dne</div>
          : <div className="relative h-48"><canvas ref={chartRef}/></div>
        }
      </div>

      <p className="text-center text-xs font-mono text-gray-300 mt-6 pt-4 border-t border-gray-200">Vevor YT60307 · aktualizace každých 60 s</p>
    </main>
  );
}
