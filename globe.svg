export default function Radar() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight">Srážkový radar</h1>
        <p className="text-xs text-gray-400 font-mono mt-1">Ostrava a okolí · zdroj: Windy.com</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{height:'75vh'}}>
        <iframe
          src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=8&overlay=rain&product=ecmwf&level=surface&lat=49.82&lon=18.26&detailLat=49.82&detailLon=18.26&detail=true&pressure=true&message=true"
          className="w-full h-full border-0"
          allowFullScreen
          title="Srážkový radar Ostrava"
        />
      </div>
      <p className="text-xs text-gray-300 font-mono text-center mt-3">Data: Windy.com · ECMWF model</p>
    </main>
  );
}
