import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { fetchGeoGridScans, runGeoGridScan, getDashboard } from '../../lib/api';
import { 
  MapPin, 
  Search, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  Star, 
  Building, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  Info,
  Navigation
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface GridPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  rank: number | null;
  localPackRank: number | null;
  bestCompetitor?: string;
  status: 'TOP_3' | 'PAGE_1' | 'RANKED' | 'NOT_FOUND' | 'UNAVAILABLE';
  competitorsAtPoint?: Array<{ name: string; position: number; rating?: number; reviews?: number }>;
}

interface GeoGridData {
  id?: string;
  keyword: string;
  location: string;
  zipCode?: string;
  gridSize: number;
  radiusMiles: number;
  centerLat: number;
  centerLng: number;
  averageGridRank: number | null;
  localVisibilityIndex: number;
  top3Percentage: number;
  points: GridPoint[];
  scannedAt?: string;
}

export function GeoGrid() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [geoData, setGeoData] = useState<GeoGridData | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<GridPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  // Scan controls
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [radiusMiles, setRadiusMiles] = useState<number>(3);
  const [gridSize, setGridSize] = useState<3 | 5>(3);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, scanRes] = await Promise.all([
        getDashboard().catch(() => null),
        fetchGeoGridScans().catch(() => null)
      ]);

      setDashboardData(dash);
      if (dash?.business) {
        const defaultKw = `${dash.business.type || 'Dentist'} in ${dash.business.city || 'Area'}`;
        if (!keyword) setKeyword(defaultKw);
        if (!city) setCity(dash.business.city || 'Austin');
      }

      if (scanRes) {
        setGeoData(scanRes);
        if (scanRes.points && scanRes.points.length > 0) {
          // Default to center point
          const centerPt = scanRes.points.find((p: GridPoint) => p.label === 'Center') || scanRes.points[Math.floor(scanRes.points.length / 2)];
          setSelectedPoint(centerPt);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) return;

    setScanning(true);
    try {
      const result = await runGeoGridScan({
        keyword: keyword.trim(),
        city: city.trim() || dashboardData?.business?.city || 'Austin',
        gridSize,
        radiusMiles
      });

      if (result) {
        setGeoData(result);
        if (result.points && result.points.length > 0) {
          const centerPt = result.points.find((p: GridPoint) => p.label === 'Center') || result.points[Math.floor(result.points.length / 2)];
          setSelectedPoint(centerPt);
        }
      }
    } catch (err: any) {
      alert("Geo-Grid scan failed: " + (err.message || 'Server error'));
    } finally {
      setScanning(false);
    }
  };

  const getRankBadgeClass = (point: GridPoint) => {
    if (point.status === 'UNAVAILABLE' || point.rank === null) {
      return 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200';
    }
    if (point.rank <= 3) {
      return 'bg-emerald-500 text-white border-emerald-600 shadow-sm hover:bg-emerald-600 scale-105';
    }
    if (point.rank <= 10) {
      return 'bg-blue-500 text-white border-blue-600 shadow-sm hover:bg-blue-600';
    }
    if (point.rank <= 20) {
      return 'bg-amber-500 text-white border-amber-600 shadow-sm hover:bg-amber-600';
    }
    return 'bg-red-500 text-white border-red-600 shadow-sm hover:bg-red-600';
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
              <Navigation className="text-primary-accent" size={26} />
              Local Geo-Grid Visibility
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              LOCAL 3-PACK SPATIAL RADAR
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            Reverse-engineer Google Maps & Local 3-Pack rankings at precise neighborhood coordinate points across your service area.
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-secondary">Average Grid Rank (AGR)</span>
          <div className="mt-2 text-2xl font-black text-primary">
            {geoData?.averageGridRank ? `#${geoData.averageGridRank}` : '—'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-secondary">Local Visibility Index (LVI)</span>
          <div className="mt-2 text-2xl font-black text-primary-accent">
            {geoData?.localVisibilityIndex !== undefined ? `${geoData.localVisibilityIndex}%` : '—'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-secondary">Top 3 Local Pack Share</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {geoData?.top3Percentage !== undefined ? `${geoData.top3Percentage}%` : '—'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-secondary">Grid Dimension & Radius</span>
          <div className="mt-2 text-2xl font-black text-primary">
            {geoData?.gridSize ? `${geoData.gridSize}x${geoData.gridSize}` : `${gridSize}x${gridSize}`} <span className="text-xs font-normal text-secondary font-sans">({geoData?.radiusMiles || radiusMiles} mi)</span>
          </div>
        </div>
      </div>

      {/* Scan Parameter Form */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs mb-8">
        <form onSubmit={handleRunScan} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
              Target Search Query *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. emergency dentist, hvac repair"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
              City / Center Location
            </label>
            <input
              type="text"
              placeholder="e.g. Austin"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
              Radius (Miles)
            </label>
            <select
              value={radiusMiles}
              onChange={(e) => setRadiusMiles(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary font-medium focus:outline-none"
            >
              <option value={1}>1 Mile</option>
              <option value={3}>3 Miles</option>
              <option value={5}>5 Miles</option>
              <option value={10}>10 Miles</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
              Grid Size
            </label>
            <select
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value) as 3 | 5)}
              className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary font-medium focus:outline-none"
            >
              <option value={3}>3x3</option>
              <option value={5}>5x5</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              variant="primary"
              disabled={scanning}
              className="w-full bg-primary-accent hover:bg-blue-700 text-white font-semibold text-xs h-9 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <RefreshCw size={13} className={scanning ? "animate-spin" : ""} />
              <span>{scanning ? 'Scanning...' : 'Execute Grid Scan'}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Main Grid Visualizer & Node Inspector Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Left (7 cols): Visual Geo-Grid Map */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <MapPin size={16} className="text-primary-accent" />
                  Spatial Rank Matrix ({geoData?.location || city})
                </h3>
                <p className="text-xs text-secondary mt-0.5">Click any coordinate pin to inspect ranking competitors at that location.</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-secondary">
                {geoData?.scannedAt ? new Date(geoData.scannedAt).toLocaleDateString() : 'Ready'}
              </span>
            </div>

            {/* Interactive Grid Canvas */}
            <div className="p-6 bg-slate-900/5 rounded-2xl border border-slate-200 flex items-center justify-center min-h-[360px] relative overflow-hidden">
              {/* Radar Rings Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-80 h-80 rounded-full border-2 border-dashed border-primary-accent" />
                <div className="w-48 h-48 rounded-full border-2 border-dashed border-primary-accent absolute" />
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary-accent absolute" />
              </div>

              {scanning ? (
                <div className="flex flex-col items-center justify-center gap-3 z-10">
                  <div className="w-10 h-10 border-3 border-primary-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-primary">Executing coordinate SERP scans across {gridSize * gridSize} points...</span>
                </div>
              ) : geoData?.points ? (
                <div 
                  className={`grid gap-4 sm:gap-6 z-10 ${
                    geoData.gridSize === 5 ? 'grid-cols-5' : 'grid-cols-3'
                  }`}
                >
                  {geoData.points.map((point) => {
                    const isSelected = selectedPoint?.id === point.id;
                    return (
                      <button
                        key={point.id}
                        onClick={() => setSelectedPoint(point)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-bold text-xs border-2 transition-all cursor-pointer ${
                          getRankBadgeClass(point)
                        } ${isSelected ? 'ring-4 ring-primary-accent ring-offset-2 scale-110' : ''}`}
                        title={`Point ${point.label}: Rank ${point.rank ? '#' + point.rank : 'Unranked'}`}
                      >
                        <span className="text-sm font-black">
                          {point.rank ? `#${point.rank}` : '—'}
                        </span>
                        <span className="text-[9px] opacity-80 uppercase tracking-tighter">
                          {point.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3 z-10">
                  <MapPin className="mx-auto h-10 w-10 text-gray-400" />
                  <h4 className="text-sm font-bold text-primary">No Geo-Grid Scans Yet</h4>
                  <p className="text-xs text-secondary max-w-xs mx-auto">
                    Click "Execute Grid Scan" above to calculate your spatial Google Local 3-Pack visibility.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-[11px] font-medium text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>#1–3 (Local Pack)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span>#4–10 (Page 1)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>#11–20</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span>20+ / Not Found</span>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Coordinate Node Inspector */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Sliders size={16} className="text-primary-accent" />
                <span>Node Inspector</span>
              </h3>
              {selectedPoint && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-primary-accent">
                  Point: {selectedPoint.label}
                </span>
              )}
            </div>

            {selectedPoint ? (
              <div className="pt-3 space-y-4 text-xs">
                {/* Node KPI Card */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-semibold">Your Local Rank:</span>
                    <span className={`text-base font-black px-2.5 py-0.5 rounded-lg ${
                      selectedPoint.rank && selectedPoint.rank <= 3 ? 'bg-emerald-100 text-emerald-800' :
                      selectedPoint.rank && selectedPoint.rank <= 10 ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {selectedPoint.rank ? `#${selectedPoint.rank} in Local Pack` : 'Data not available / Unranked'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-secondary font-mono pt-1">
                    <span>Coordinates:</span>
                    <span>{selectedPoint.lat}, {selectedPoint.lng}</span>
                  </div>
                </div>

                {/* Local Competitors at This Specific Coordinate */}
                <div>
                  <span className="text-xs font-bold text-primary block uppercase tracking-wider mb-2">
                    Top Competitors at this Coordinate:
                  </span>
                  <div className="space-y-2">
                    {(selectedPoint.competitorsAtPoint || []).map((comp, idx) => (
                      <div 
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary font-mono text-[11px]">#{comp.position}</span>
                            <span className="font-bold text-primary truncate max-w-[150px]">{comp.name}</span>
                          </div>
                          {comp.rating && (
                            <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                              <Star size={10} className="fill-amber-500 text-amber-500" />
                              {comp.rating} ★ ({comp.reviews || 0} reviews)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          Local 3-Pack
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spatial Action Recommendation */}
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-secondary leading-relaxed space-y-1">
                  <span className="font-bold text-primary block text-[11px]">Spatial Growth Strategy:</span>
                  <p className="text-[11px]">
                    To expand ranking radius into coordinate point <strong>{selectedPoint.label}</strong>, create dedicated neighborhood service pages and request customer reviews mentioning this specific district.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-secondary text-xs">
                Select any coordinate pin on the grid to inspect local pack competitors.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRunScan()}
              disabled={scanning}
              className="w-full text-xs font-semibold"
            >
              Refresh Entire Grid Matrix
            </Button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
