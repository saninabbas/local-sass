import { useState, useEffect } from 'react';
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
  Star, 
  Zap, 
  User, 
  Building, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Globe, 
  MapPin, 
  Briefcase,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export function Settings() {
  const { user } = useAuth();
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
      setProfileMessage({ type: 'success', text: 'Profile name updated!' });
      setTimeout(() => setProfileMessage(null), 4000);
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessData.name.trim()) {
      setBusinessMessage({ type: 'error', text: 'Business name is required.' });
      return;
    }

    setIsSavingBusiness(true);
    setBusinessMessage(null);
    try {
      await updateBusiness({
        name: businessData.name,
        type: businessData.type,
        city: businessData.city,
        country: businessData.country,
        websiteUrl: businessData.websiteUrl
      });
      setBusinessMessage({ type: 'success', text: 'Business details saved successfully!' });
      setTimeout(() => setBusinessMessage(null), 4000);
    } catch (err: any) {
      setBusinessMessage({ type: 'error', text: err.message || 'Failed to save business details.' });
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleCheckout = async (productId: string, planName: string) => {
    setIsProcessing(planName);
    try {
      const res = await createCheckout(productId);
      if (res && res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert("Checkout error: " + (err.message || 'Payment system unavailable'));
      setIsProcessing(null);
    }
  };

  const isGbpConnected = integrations.some(i => i.provider === 'google_business' && i.status === 'active');
  const isGscConnected = integrations.some(i => i.provider === 'google_search_console' && i.status === 'active');

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            Account & Platform Settings
          </h1>
          <p className="text-xs text-secondary mt-1">
            Manage your personal profile, verified business coordinates, search integrations, and subscription plan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary flex items-center gap-2">
              <User size={16} className="text-primary-accent" />
              Profile Details
            </h2>
          </div>
          <form onSubmit={handleSaveProfile} className="p-5 space-y-3.5">
            {profileMessage && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 ${
                profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {profileMessage.type === 'success' ? <CheckCircle2 size={13} /> : null}
                {profileMessage.text}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-100 text-secondary cursor-not-allowed font-mono"
              />
            </div>
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSavingProfile}
                className="bg-primary-accent hover:bg-blue-700 text-white font-semibold"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </div>

        {/* Business Profile Card (2 cols) */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary flex items-center gap-2">
              <Building size={16} className="text-primary-accent" />
              Business Profile & Local SEO Coordinates
            </h2>
            <span className="text-[10px] font-mono text-secondary">Target Entity Data</span>
          </div>

          {businessLoading ? (
            <div className="p-10 flex flex-col items-center justify-center text-secondary">
              <Loader2 size={20} className="animate-spin mb-2 text-primary-accent" />
              <p className="text-xs">Loading business parameters...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveBusiness} className="p-5 space-y-3.5">
              {businessMessage && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 ${
                  businessMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {businessMessage.type === 'success' ? <CheckCircle2 size={13} /> : null}
                  {businessMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessData.name}
                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                    Industry Category
                  </label>
                  <input
                    type="text"
                    value={businessData.type}
                    onChange={(e) => setBusinessData({ ...businessData, type: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                    City / Target Area
                  </label>
                  <input
                    type="text"
                    value={businessData.city}
                    onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={businessData.country}
                    onChange={(e) => setBusinessData({ ...businessData, country: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                    Website URL (Audit Target)
                  </label>
                  <input
                    type="url"
                    value={businessData.websiteUrl}
                    onChange={(e) => setBusinessData({ ...businessData, websiteUrl: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-primary font-mono focus:outline-none focus:ring-1 focus:ring-primary-accent"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSavingBusiness}
                  className="bg-primary-accent hover:bg-blue-700 text-white font-semibold"
                >
                  {isSavingBusiness ? 'Saving...' : 'Save Business Coordinates'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Search & Google Integrations Section (Full width) */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden lg:col-span-3">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary flex items-center gap-2">
              <Globe size={16} className="text-primary-accent" />
              Connected Google & Search Integrations
            </h2>
          </div>
          
          <div className="p-5 space-y-4">
            {/* Google Business Profile Card */}
            <div className="p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/60">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-xs text-primary-accent">
                  <Building size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-primary">Google Business Profile (GBP)</h3>
                  <p className="text-[11px] text-secondary">Sync live customer reviews, ratings, operating hours, and Google Maps Local 3-Pack presence.</p>
                </div>
              </div>
              
              {isGbpConnected ? (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200">
                  <CheckCircle2 size={14} /> Connected
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={connectGoogleBusiness}
                  className="bg-primary-accent hover:bg-blue-700 text-white font-semibold text-xs shrink-0"
                >
                  Connect Google Business
                </Button>
              )}
            </div>

            {/* Google Search Console Card */}
            <div className="p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50/60">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-xs">
                  <Globe size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-primary">Google Search Console (GSC)</h3>
                  <p className="text-[11px] text-secondary">Pull verified organic impressions, search queries, and click-through rates.</p>
                </div>
              </div>
              
              {isGscConnected ? (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200">
                  <CheckCircle2 size={14} /> Connected
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={connectGoogleSearchConsole}
                  className="border-gray-200 bg-white text-primary text-xs font-semibold shrink-0"
                >
                  Connect Search Console
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Plan Section (Full width) */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden lg:col-span-3">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-primary">Subscription Plan Management</h2>
            <p className="text-xs text-secondary mt-0.5">
              Active plan tier: <span className="font-bold uppercase text-primary-accent">{currentPlan}</span>
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Growth Plan */}
              <div className={`p-5 rounded-2xl border transition-all ${currentPlan === 'growth' ? 'border-primary-accent bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                      <Zap className="text-primary-accent" size={16} />
                      Growth Plan
                    </h3>
                    <p className="text-xs text-secondary mt-0.5">Ideal for single-location local brands</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">$15</span>
                    <span className="text-[10px] text-secondary">/mo</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 mt-4 text-xs text-secondary">
                  {['11-Vector Growth Score Diagnostics', 'Competitor Gap & SERP Radar', '30-Day AI Growth Roadmap', 'Local Rankings Tracker'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="text-emerald-500 shrink-0" size={14} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={currentPlan === 'growth' || isProcessing !== null}
                  onClick={() => handleCheckout('7594755d-5580-4b77-86ae-90baae0e20d8', 'growth')}
                  className={`w-full py-2 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    currentPlan === 'growth'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-accent hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {isProcessing === 'growth' ? 'Processing...' : (currentPlan === 'growth' ? 'Current Plan' : 'Upgrade to Growth')}
                </button>
              </div>

              {/* Pro Plan */}
              <div className={`p-5 rounded-2xl border transition-all ${currentPlan === 'pro' ? 'border-primary-accent bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                      <Star className="text-amber-500 fill-amber-500" size={16} />
                      Pro Agency Plan
                    </h3>
                    <p className="text-xs text-secondary mt-0.5">Multi-location & continuous automated monitoring</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">$30</span>
                    <span className="text-[10px] text-secondary">/mo</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 mt-4 text-xs text-secondary">
                  {['Everything in Growth', 'AI Local Article Generator', 'AI Google Review Auto-Responder', 'Citations & Authority Builder', 'White-Labeled Executive PDF Exports'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="text-emerald-500 shrink-0" size={14} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={currentPlan === 'pro' || isProcessing !== null}
                  onClick={() => handleCheckout('9f7c00db-ff6f-47dc-98df-82db2c9a9bf9', 'pro')}
                  className={`w-full py-2 px-4 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    currentPlan === 'pro'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-accent hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {isProcessing === 'pro' ? 'Processing...' : (currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro')}
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
