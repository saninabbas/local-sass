import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { 
  createCheckout, 
  getBusiness, 
  updateBusiness, 
  updateProfile, 
  fetchIntegrationStatus, 
  connectGoogleSearchConsole,
  connectGoogleBusiness 
} from '../../lib/api';
import { 
  Check, 
  Zap, 
  User, 
  Building, 
  Loader2, 
  CheckCircle2, 
  Globe, 
  MapPin, 
  Database,
  ExternalLink,
  ShieldCheck,
  Bot,
  Radio,
  Key,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Business Form State
  const [businessLoading, setBusinessLoading] = useState(true);
  const [businessData, setBusinessData] = useState({
    name: '',
    type: '',
    city: '',
    country: '',
    websiteUrl: ''
  });
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [businessMessage, setBusinessMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Integrations State
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);

  const currentPlan = (user as any)?.subscription_status || 'free';

  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name);
    }
    
    const loadBusiness = async () => {
      try {
        const data = await getBusiness();
        if (data) {
          setBusinessData({
            name: data.name || '',
            type: data.type || '',
            city: data.city || '',
            country: data.country || '',
            websiteUrl: data.website_url || ''
          });
        }
      } catch (err) {
        console.error('Failed to load business details:', err);
      } finally {
        setBusinessLoading(false);
      }
    };

    const loadIntegrations = async () => {
      try {
        const data = await fetchIntegrationStatus();
        setIntegrations(data || []);
      } catch (err) {
        console.error('Failed to load integrations:', err);
      } finally {
        setIntegrationsLoading(false);
      }
    };

    loadBusiness();
    loadIntegrations();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileMessage({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }

    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      await updateProfile({ name: profileName });
      setProfileMessage({ type: 'success', text: 'Account profile updated successfully.' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessData.name.trim() || !businessData.city.trim() || !businessData.websiteUrl.trim()) {
      setBusinessMessage({ type: 'error', text: 'Name, City, and Website URL are required.' });
      return;
    }

    setIsSavingBusiness(true);
    setBusinessMessage(null);
    try {
      await updateBusiness(businessData);
      setBusinessMessage({ type: 'success', text: 'Business coordinates updated successfully.' });
    } catch (err: any) {
      setBusinessMessage({ type: 'error', text: err.message || 'Failed to update business.' });
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleCheckout = async (productId: string, planName: string) => {
    try {
      setIsProcessing(planName);
      const res = await createCheckout(productId);
      if (res && res.url) {
        window.location.href = res.url;
      } else {
        alert("Failed to initialize checkout. Please check server logs.");
      }
    } catch (err: any) {
      alert("Checkout error: " + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (e) {
      navigate('/login', { replace: true });
    }
  };

  const isGscConnected = integrations.some(i => i.provider === 'google_search_console' && i.status === 'active');
  const isGbpConnected = integrations.some(i => i.provider === 'google_business_profile' && i.status === 'active');

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413]">
              Settings & Data Sources
            </h1>
            <p className="text-xs text-[#6c6a64] mt-1 font-sans">
              Manage your business profile, external API connections, telemetry providers, and subscription.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            className="text-xs font-semibold text-rose-700 border-rose-200 hover:bg-rose-50 flex items-center gap-1.5"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </Button>
        </div>

        {/* 1. DATA SOURCES & TELEMETRY CONNECTIONS (Phase 18) */}
        <section className="bg-[#faf9f5] rounded-3xl border border-[#e6dfd8] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8e8b82]">
                Verified Providers
              </span>
              <h2 className="text-lg font-serif font-medium text-[#141413]">
                Telemetry & Integration Status
              </h2>
            </div>
            <span className="text-xs font-mono text-[#8e8b82]">
              Zero Fabricated Data Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Google Business Profile */}
            <div className="bg-[#efe9de]/30 rounded-2xl p-4 border border-[#e6dfd8] flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-medium text-[#141413]">Google Business</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isGbpConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#efe9de] text-[#8e8b82] border-[#e6dfd8]'
                  }`}>
                    {isGbpConnected ? '● Connected' : '○ Not Connected'}
                  </span>
                </div>
                <p className="text-[11px] font-sans text-[#6c6a64]">
                  Google Maps 3-Pack, ratings, and live customer reviews.
                </p>
              </div>

              {isGbpConnected ? (
                <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Active OAuth
                </span>
              ) : (
                <Button
                  size="sm"
                  onClick={connectGoogleBusiness}
                  className="w-full text-xs font-semibold bg-[#141413] hover:bg-[#252320] text-[#faf9f5]"
                >
                  Connect Google
                </Button>
              )}
            </div>

            {/* SERP Provider */}
            <div className="bg-[#efe9de]/30 rounded-2xl p-4 border border-[#e6dfd8] flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-medium text-[#141413]">SERP Radar</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ● Connected
                  </span>
                </div>
                <p className="text-[11px] font-sans text-[#6c6a64]">
                  Real-time Google search competitor & keyword rank tracking via Serper.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#8e8b82]">
                Provider: Serper API
              </span>
            </div>

            {/* AI Engine */}
            <div className="bg-[#efe9de]/30 rounded-2xl p-4 border border-[#e6dfd8] flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-medium text-[#141413]">AI Growth Engine</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ● Connected
                  </span>
                </div>
                <p className="text-[11px] font-sans text-[#6c6a64]">
                  NVIDIA AI inference for code fixes and content optimization.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#8e8b82]">
                Model: Llama 3 70B (NVIDIA)
              </span>
            </div>

            {/* Backlink Provider */}
            <div className="bg-[#efe9de]/30 rounded-2xl p-4 border border-[#e6dfd8] flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-medium text-[#141413]">Backlink Provider</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#efe9de] text-[#8e8b82] border-[#e6dfd8]">
                    ○ Not Connected
                  </span>
                </div>
                <p className="text-[11px] font-sans text-[#6c6a64]">
                  Direct backlink monitor provider (DataForSEO / Ahrefs API).
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#8e8b82]">
                Citation Discovery Active
              </span>
            </div>
          </div>
        </section>

        {/* 2. PROFILE & BUSINESS INFORMATION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Profile Form */}
          <div className="bg-[#faf9f5] rounded-3xl border border-[#e6dfd8] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <User size={18} className="text-[#cc785c]" />
              <h3 className="text-base font-serif font-medium text-[#141413]">
                Account Profile
              </h3>
            </div>

            {profileMessage && (
              <div className={`p-3 rounded-xl text-xs font-sans ${
                profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#8e8b82] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dfd8] bg-white text-[#141413] focus:outline-none focus:border-[#cc785c]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#8e8b82] mb-1">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dfd8] bg-[#efe9de]/40 text-[#8e8b82] cursor-not-allowed font-mono"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingProfile}
                  className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] font-semibold text-xs"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </div>

          {/* Business Coordinates Form */}
          <div className="bg-[#faf9f5] rounded-3xl border border-[#e6dfd8] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Building size={18} className="text-[#cc785c]" />
              <h3 className="text-base font-serif font-medium text-[#141413]">
                Business Coordinates & Target URL
              </h3>
            </div>

            {businessMessage && (
              <div className={`p-3 rounded-xl text-xs font-sans ${
                businessMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {businessMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveBusiness} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#8e8b82] mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessData.name}
                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dfd8] bg-white text-[#141413] focus:outline-none focus:border-[#cc785c]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#8e8b82] mb-1">
                    Category / Industry
                  </label>
                  <input
                    type="text"
                    value={businessData.type}
                    onChange={(e) => setBusinessData({ ...businessData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dfd8] bg-white text-[#141413] focus:outline-none focus:border-[#cc785c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#8e8b82] mb-1">
                    Target City
                  </label>
                  <input
                    type="text"
                    value={businessData.city}
                    onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dfd8] bg-white text-[#141413] focus:outline-none focus:border-[#cc785c]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#8e8b82] mb-1">
                    Target Website URL
                  </label>
                  <input
                    type="url"
                    value={businessData.websiteUrl}
                    onChange={(e) => setBusinessData({ ...businessData, websiteUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dfd8] bg-white text-[#141413] font-mono focus:outline-none focus:border-[#cc785c]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingBusiness}
                  className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] font-semibold text-xs"
                >
                  {isSavingBusiness ? 'Saving...' : 'Update Coordinates'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* 3. SUBSCRIPTION TIERS */}
        <section className="bg-[#faf9f5] rounded-3xl border border-[#e6dfd8] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8e8b82]">
                Plan Status
              </span>
              <h3 className="text-lg font-serif font-medium text-[#141413]">
                Current Tier: <span className="uppercase text-[#cc785c]">{currentPlan}</span>
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Growth Tier */}
            <div className={`p-6 rounded-2xl border transition-all ${
              currentPlan === 'growth' ? 'border-[#cc785c] bg-[#efe9de]/40' : 'border-[#e6dfd8] bg-white'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-base font-serif font-medium text-[#141413] flex items-center gap-1.5">
                    <Zap className="text-[#cc785c]" size={16} />
                    Growth Plan
                  </h4>
                  <p className="text-xs text-[#6c6a64] font-sans">Single local business location</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif font-medium text-[#141413]">$15</span>
                  <span className="text-[10px] text-[#8e8b82] font-mono">/mo</span>
                </div>
              </div>

              <button
                disabled={currentPlan === 'growth' || isProcessing !== null}
                onClick={() => handleCheckout('7594755d-5580-4b77-86ae-90baae0e20d8', 'growth')}
                className={`w-full py-2 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer mt-4 ${
                  currentPlan === 'growth'
                    ? 'bg-[#efe9de] text-[#8e8b82] cursor-not-allowed'
                    : 'bg-[#141413] hover:bg-[#252320] text-[#faf9f5]'
                }`}
              >
                {isProcessing === 'growth' ? 'Processing...' : (currentPlan === 'growth' ? 'Current Plan' : 'Select Growth Tier')}
              </button>
            </div>

            {/* Pro Tier */}
            <div className={`p-6 rounded-2xl border transition-all ${
              currentPlan === 'pro' ? 'border-[#cc785c] bg-[#efe9de]/40' : 'border-[#e6dfd8] bg-white'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-base font-serif font-medium text-[#141413] flex items-center gap-1.5">
                    <ShieldCheck className="text-[#cc785c]" size={16} />
                    Pro Multi-Location
                  </h4>
                  <p className="text-xs text-[#6c6a64] font-sans">Agencies & multi-market brands</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif font-medium text-[#141413]">$29</span>
                  <span className="text-[10px] text-[#8e8b82] font-mono">/mo</span>
                </div>
              </div>

              <button
                disabled={currentPlan === 'pro' || isProcessing !== null}
                onClick={() => handleCheckout('b39f379a-bf3b-4861-a083-d5951ff81561', 'pro')}
                className={`w-full py-2 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer mt-4 ${
                  currentPlan === 'pro'
                    ? 'bg-[#efe9de] text-[#8e8b82] cursor-not-allowed'
                    : 'bg-[#141413] hover:bg-[#252320] text-[#faf9f5]'
                }`}
              >
                {isProcessing === 'pro' ? 'Processing...' : (currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
