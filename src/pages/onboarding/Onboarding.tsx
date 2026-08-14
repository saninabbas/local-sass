import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { createBusiness, runAudit } from '../../lib/api';
import { Sparkles } from 'lucide-react';

export function Onboarding() {
  const navigate = useNavigate();
  
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [city, setCity] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  const loadingMessages = [
    "Crawling target website and extracting DOM structure...",
    "Detecting business category, services, and local geographic signals...",
    "Scanning Google SERP for localized competitors...",
    "Calculating 11-dimension Growth Score baseline...",
    "Synthesizing 30-day AI execution roadmap..."
  ];

  const businessTypes = [
    'Dentist', 'Plumber', 'HVAC', 'Lawyer', 'Clinic', 'MedSpa', 
    'Roofing', 'Real Estate', 'Restaurant', 'Salon', 'Gym', 
    'Auto Repair', 'Accounting', 'Local Service', 'Other'
  ];

  const handleStartDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) return;

    setError('');
    setIsLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep(prev => Math.min(prev + 1, loadingMessages.length - 1));
    }, 2000);

    try {
      // 1. Create Business
      await createBusiness({ 
        name: name.trim() || 'My Business', 
        type: type || 'Local Service', 
        city: city.trim() || 'Local Market', 
        country: 'United States', 
        websiteUrl: websiteUrl.trim() 
      });

      // 2. Run Auto-Audit Pipeline
      await runAudit().catch((err) => {
        console.warn("Initial audit pipeline notice:", err);
      });

      clearInterval(interval);
      navigate('/dashboard');
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Failed to initialize business discovery.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col pt-10 sm:pt-16 px-4 sm:px-6 lg:px-8 text-[#141413]">
      <div className="mx-auto w-full max-w-lg">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <img src="/brand/logo.svg" alt="Rankora" className="w-[140px] h-auto object-contain" />
          </div>
          <p className="text-xs text-[#6c6a64] font-sans text-center">
            AI Local Growth Operating System — Automated Business & Market Discovery
          </p>
        </div>

        <div className="bg-[#efe9de] py-8 px-6 sm:px-10 rounded-2xl border border-[#e6dfd8] shadow-sm relative overflow-hidden">
          {error && (
            <div className="mb-5 p-3.5 bg-[#c64545]/15 border border-[#c64545]/30 text-[#c64545] text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-8 flex flex-col items-center space-y-5">
              <div className="w-10 h-10 border-3 border-[#cc785c] border-t-transparent rounded-full animate-spin mb-1" />
              <div className="text-center">
                <h3 className="text-base font-serif font-normal text-[#141413]">
                  Analyzing Your Business & Local Market
                </h3>
                <p className="text-xs text-[#6c6a64] font-sans mt-1">
                  Executing real-time DOM extraction & SERP intelligence benchmark
                </p>
              </div>

              {/* 5-Step Visual Pipeline */}
              <div className="w-full bg-[#faf9f5] p-4 rounded-xl border border-[#e6dfd8] space-y-2.5 font-mono text-xs text-left">
                {[
                  { step: 1, label: "STEP 1 — Target Website & DOM Analysis" },
                  { step: 2, label: "STEP 2 — Local Business & Service Detection" },
                  { step: 3, label: "STEP 3 — Google SERP Competitor Discovery" },
                  { step: 4, label: "STEP 4 — 7-Vector Growth Score Baseline" },
                  { step: 5, label: "STEP 5 — 30-Day Action Roadmap Synthesis" }
                ].map((item, idx) => {
                  const isDone = loadingStep > idx;
                  const isCurrent = loadingStep === idx;
                  return (
                    <div key={item.step} className="flex items-center justify-between text-[11px]">
                      <span className={isCurrent ? 'text-[#cc785c] font-bold' : isDone ? 'text-[#5db872]' : 'text-[#8e8b82]'}>
                        {item.label}
                      </span>
                      <span className="font-bold">
                        {isDone ? '✓ DONE' : isCurrent ? 'RUNNING...' : 'PENDING'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="w-full bg-[#faf9f5] h-1.5 rounded-full overflow-hidden border border-[#e6dfd8]">
                <div 
                  className="h-full bg-[#cc785c] rounded-full transition-all duration-500"
                  style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleStartDiscovery} className="space-y-4 font-sans text-xs">
              <div className="text-center pb-2">
                <h2 className="text-lg font-serif font-normal text-[#141413]">Enter Your Website URL</h2>
                <p className="text-xs text-[#6c6a64] mt-0.5">
                  Rankora will automatically crawl your site, detect your market, and benchmark competitors.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider mb-1">
                  Website URL (Audit Target) *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] text-xs focus:outline-none focus:ring-1 focus:ring-[#cc785c] transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider mb-1">
                    Business Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-detected if blank"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider mb-1">
                    City / Market (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-detected if blank"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider mb-1">
                  Industry Category (Optional)
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                >
                  <option value="">Auto-detect from website content...</option>
                  {businessTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-[#cc785c] hover:bg-[#a9583e] text-white font-medium text-xs h-10 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles size={15} />
                <span>Launch Business Discovery & Market Scan</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
