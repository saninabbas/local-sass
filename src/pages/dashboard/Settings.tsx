import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { createCheckout, getBusiness, updateBusiness, updateProfile, fetchIntegrationStatus, connectGoogleSearchConsole } from '../../lib/api';
import { Check, Star, Zap, User, Building, LogOut, Save, Loader2, CheckCircle2, Globe, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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

  // Load business details on mount
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
      const response = await createCheckout(productId);
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        alert("Could not generate checkout link. Please try again.");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(`Checkout Error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 mt-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] mb-1">Account & Organization Settings</h1>
        <p className="text-xs text-[#6c6a64] font-sans">Manage your personal profile, business parameters, subscription tier, and connected services.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profile Section */}
        <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] overflow-hidden lg:col-span-1 flex flex-col">
          <div className="p-4 border-b border-[#e6dfd8] bg-[#faf9f5]">
            <h2 className="text-sm font-serif font-medium text-[#141413] flex items-center gap-2">
              <User size={16} className="text-[#cc785c]" />
              Personal Profile
            </h2>
          </div>
          
          <form onSubmit={handleSaveProfile} className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              {profileMessage && (
                <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-1.5 ${
                  profileMessage.type === 'success' ? 'bg-[#5db872]/15 text-[#2b753e] border border-[#5db872]/30' : 'bg-[#c64545]/15 text-[#c64545] border border-[#c64545]/30'
                }`}>
                  {profileMessage.type === 'success' ? <CheckCircle2 size={13} /> : null}
                  {profileMessage.text}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e6dfd8] bg-[#faf9f5] rounded-lg text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c] font-sans"
                  placeholder="Your Full Name"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-[#e8e0d2] border border-[#e6dfd8] rounded-lg text-xs text-[#8e8b82] font-mono cursor-not-allowed"
                />
                <p className="text-[10px] text-[#8e8b82] mt-1 font-mono">Email cannot be changed directly.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 px-4 bg-[#cc785c] text-white rounded-lg text-xs font-sans font-medium hover:bg-[#a9583e] transition-colors shadow-xs disabled:opacity-50"
            >
              {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Profile
            </button>
          </form>
        </div>

        {/* Business Details Section */}
        <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-[#e6dfd8] bg-[#faf9f5] flex items-center justify-between">
            <h2 className="text-sm font-serif font-medium text-[#141413] flex items-center gap-2">
              <Building size={16} className="text-[#cc785c]" />
              Business Profile & Local SEO Data
            </h2>
            <span className="text-[10px] font-mono text-[#8e8b82] hidden sm:inline">Used for AI SEO Audits</span>
          </div>

          {businessLoading ? (
            <div className="p-10 flex flex-col items-center justify-center text-[#8e8b82]">
              <Loader2 size={20} className="animate-spin mb-2 text-[#cc785c]" />
              <p className="text-xs font-mono">Loading business parameters...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveBusiness} className="p-5 space-y-3.5">
              {businessMessage && (
                <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-1.5 ${
                  businessMessage.type === 'success' ? 'bg-[#5db872]/15 text-[#2b753e] border border-[#5db872]/30' : 'bg-[#c64545]/15 text-[#c64545] border border-[#c64545]/30'
                }`}>
                  {businessMessage.type === 'success' ? <CheckCircle2 size={13} /> : null}
                  {businessMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Briefcase size={12} className="text-[#8e8b82]" />
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessData.name}
                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e6dfd8] bg-[#faf9f5] rounded-lg text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c] font-sans"
                    placeholder="e.g. Apex Dental Clinic"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Building size={12} className="text-[#8e8b82]" />
                    Industry / Business Type
                  </label>
                  <input
                    type="text"
                    value={businessData.type}
                    onChange={(e) => setBusinessData({ ...businessData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e6dfd8] bg-[#faf9f5] rounded-lg text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c] font-sans"
                    placeholder="e.g. Dental Care, Restaurant, Roofing"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={12} className="text-[#8e8b82]" />
                    City
                  </label>
                  <input
                    type="text"
                    value={businessData.city}
                    onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e6dfd8] bg-[#faf9f5] rounded-lg text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c] font-sans"
                    placeholder="e.g. Chicago"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={12} className="text-[#8e8b82]" />
                    Country
                  </label>
                  <input
                    type="text"
                    value={businessData.country}
                    onChange={(e) => setBusinessData({ ...businessData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e6dfd8] bg-[#faf9f5] rounded-lg text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c] font-sans"
                    placeholder="e.g. United States"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono font-bold text-[#6c6a64] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Globe size={12} className="text-[#8e8b82]" />
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={businessData.websiteUrl}
                    onChange={(e) => setBusinessData({ ...businessData, websiteUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e6dfd8] bg-[#faf9f5] rounded-lg text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c] font-mono"
                    placeholder="https://example.com"
                  />
                  <p className="text-[10px] font-mono text-[#8e8b82] mt-1">This URL is fetched by the audit crawler.</p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSavingBusiness}
                  className="flex items-center gap-1.5 py-2 px-5 bg-[#cc785c] text-white rounded-lg text-xs font-sans font-medium hover:bg-[#a9583e] transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSavingBusiness ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Business Details
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Integrations Section */}
        <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] overflow-hidden lg:col-span-3">
          <div className="p-4 border-b border-[#e6dfd8] bg-[#faf9f5] flex items-center justify-between">
            <h2 className="text-sm font-serif font-medium text-[#141413] flex items-center gap-2">
              <Globe size={16} className="text-[#cc785c]" />
              Connected Search Integrations
            </h2>
          </div>
          
          <div className="p-5">
            {integrationsLoading ? (
               <div className="flex justify-center p-6"><Loader2 className="animate-spin text-[#cc785c]" size={18} /></div>
            ) : (
              <div className="border border-[#e6dfd8] rounded-lg overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#faf9f5]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#efe9de] rounded-lg border border-[#e6dfd8] flex items-center justify-center shadow-xs">
                      <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-sans font-medium text-xs text-[#141413]">Google Search Console</h3>
                      <p className="text-[11px] text-[#6c6a64] font-sans">Connect to pull verified organic search telemetry directly from Google.</p>
                    </div>
                  </div>
                  
                  {integrations.find(i => i.provider === 'google_search_console') ? (
                    <div className="flex items-center gap-1.5 text-[#2b753e] bg-[#5db872]/15 px-3 py-1.5 rounded-lg font-mono text-xs border border-[#5db872]/30">
                      <CheckCircle2 size={14} /> Connected
                    </div>
                  ) : (
                    <button onClick={connectGoogleSearchConsole} className="px-3.5 py-1.5 bg-[#efe9de] border border-[#e6dfd8] text-[#141413] font-sans font-medium text-xs rounded-lg hover:bg-[#e8e0d2] shadow-xs transition-colors">
                      Connect Account
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Plan Section */}
      <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#e6dfd8] overflow-hidden mb-6">
        <div className="p-4 border-b border-[#e6dfd8] bg-[#faf9f5]">
          <h2 className="text-base font-serif font-medium text-[#141413]">Subscription Management</h2>
          <p className="text-xs text-[#6c6a64] font-sans mt-0.5">
            Active plan tier: <span className="font-mono font-semibold capitalize text-[#cc785c]">{currentPlan}</span>
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Growth Package */}
            <div className={`relative rounded-xl border p-5 transition-all ${currentPlan === 'growth' ? 'border-[#cc785c] bg-[#faf9f5]' : 'border-[#e6dfd8] bg-[#faf9f5]'}`}>
              {currentPlan === 'growth' && (
                <div className="absolute top-0 right-4 transform -translate-y-1/2">
                  <span className="bg-[#cc785c] text-white text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    Current Plan
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-serif font-medium text-[#141413] flex items-center gap-1.5">
                    <Zap className="text-[#cc785c]" size={16} />
                    Growth Tier
                  </h3>
                  <p className="text-xs text-[#6c6a64] font-sans mt-0.5">Ideal for single-location local brands</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif font-normal text-[#141413]">$15</span>
                  <span className="text-[10px] font-mono text-[#8e8b82]">/mo</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 mt-4">
                {['Real-time AI SEO Diagnostics', 'Competitor Analysis Engine', 'Priority Action Plan Roadmap', 'Lead Capture Widget Embed'].map((feature, i) => (
                  <li key={i} className="flex items-center text-xs text-[#3d3d3a] font-sans">
                    <Check className="text-[#5db872] mr-2 shrink-0" size={14} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={currentPlan === 'growth' || isProcessing !== null}
                onClick={() => handleCheckout('7594755d-5580-4b77-86ae-90baae0e20d8', 'growth')}
                className={`w-full py-2 px-4 rounded-lg font-sans font-medium text-xs transition-all shadow-xs ${
                  currentPlan === 'growth'
                    ? 'bg-[#e8e0d2] text-[#8e8b82] cursor-not-allowed'
                    : 'bg-[#efe9de] border border-[#cc785c] text-[#cc785c] hover:bg-[#e8e0d2]'
                }`}
              >
                {isProcessing === 'growth' ? 'Processing...' : (currentPlan === 'growth' ? 'Active' : 'Upgrade to Growth')}
              </button>
            </div>

            {/* Pro Package */}
            <div className={`relative rounded-xl border p-5 transition-all ${currentPlan === 'pro' ? 'border-[#cc785c] bg-[#181715] text-[#faf9f5]' : 'border-[#252320] bg-[#181715] text-[#faf9f5] shadow-sm'}`}>
              {currentPlan !== 'pro' && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#cc785c] text-white text-[9px] font-mono uppercase font-bold px-3 py-0.5 rounded-full shadow-xs tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}
              {currentPlan === 'pro' && (
                <div className="absolute top-0 right-4 transform -translate-y-1/2">
                  <span className="bg-[#5db872] text-white text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    Current Plan
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3 mt-1">
                <div>
                  <h3 className="text-base font-serif font-medium text-[#faf9f5] flex items-center gap-1.5">
                    <Star className="text-[#e8a55a] fill-[#e8a55a]" size={16} />
                    Pro Agency Tier
                  </h3>
                  <p className="text-xs text-[#d8d5ce] font-sans mt-0.5">Maximum power & continuous monitoring</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif font-normal text-[#faf9f5]">$30</span>
                  <span className="text-[10px] font-mono text-[#8e8b82]">/mo</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 mt-4">
                {['Everything in Growth', 'AI Local Blog Writer (Unlimited)', 'AI Google Review Reply Auto-Drafter', 'Authority & Link Opportunity Finder', 'White-labeled PDF Executive Exports'].map((feature, i) => (
                  <li key={i} className="flex items-center text-xs text-[#d8d5ce] font-sans">
                    <Check className="text-[#5db872] mr-2 shrink-0" size={14} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={currentPlan === 'pro' || isProcessing !== null}
                onClick={() => handleCheckout('97ffea75-9d0c-490f-b652-b2bfd360abe2', 'pro')}
                className={`w-full py-2 px-4 rounded-lg font-sans font-medium text-xs transition-all shadow-xs ${
                  currentPlan === 'pro'
                    ? 'bg-[#252320] text-[#8e8b82] cursor-not-allowed'
                    : 'bg-[#cc785c] text-white hover:bg-[#a9583e]'
                }`}
              >
                {isProcessing === 'pro' ? 'Processing...' : (currentPlan === 'pro' ? 'Active' : 'Upgrade to Pro')}
              </button>
            </div>

          </div>
        </div>
        
        <div className="bg-[#faf9f5] p-4 text-center text-xs text-[#6c6a64] font-sans border-t border-[#e6dfd8]">
          Transactions are processed securely via Polar. Cancel anytime from your account settings.
        </div>
      </div>

      {/* Account Actions / Logout */}
      <div className="bg-[#efe9de] rounded-xl shadow-xs border border-[#c64545]/30 overflow-hidden mb-8">
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-serif font-medium text-[#c64545] flex items-center gap-1.5">
              Session & Sign Out
            </h2>
            <p className="text-xs text-[#6c6a64] font-sans mt-0.5">
              Safely end your session and clear local cookies.
            </p>
          </div>
          <button 
            onClick={() => {
              document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              window.location.href = '/login';
            }}
            className="px-3.5 py-1.5 bg-[#faf9f5] text-[#c64545] hover:bg-[#c64545]/10 border border-[#c64545]/30 transition-colors rounded-lg text-xs font-sans font-medium flex items-center gap-1.5 whitespace-nowrap"
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
