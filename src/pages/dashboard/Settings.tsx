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
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-primary mb-2">Account Settings</h1>
        <p className="text-secondary">Manage your profile, business details, billing, and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-1 flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <User size={18} className="text-primary-accent" />
              Personal Profile
            </h2>
          </div>
          
          <form onSubmit={handleSaveProfile} className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {profileMessage && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {profileMessage.type === 'success' ? <CheckCircle2 size={14} /> : null}
                  {profileMessage.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-accent text-primary font-medium"
                  placeholder="Your Full Name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 font-medium cursor-not-allowed"
                />
                <p className="text-[11px] text-gray-400 mt-1">Email cannot be changed directly.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-accent text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Profile
            </button>
          </form>
        </div>

        {/* Business Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Building size={18} className="text-primary-accent" />
              Business Profile & Local SEO Data
            </h2>
            <span className="text-xs text-secondary font-medium hidden sm:inline">Used for AI SEO Audits & Content</span>
          </div>

          {businessLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-secondary">
              <Loader2 size={24} className="animate-spin mb-2 text-primary-accent" />
              <p className="text-sm">Loading business details...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveBusiness} className="p-6 space-y-4">
              {businessMessage && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  businessMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {businessMessage.type === 'success' ? <CheckCircle2 size={14} /> : null}
                  {businessMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Briefcase size={13} className="text-gray-400" />
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessData.name}
                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-accent text-primary font-medium"
                    placeholder="e.g. Apex Dental Clinic"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Building size={13} className="text-gray-400" />
                    Industry / Business Type
                  </label>
                  <input
                    type="text"
                    value={businessData.type}
                    onChange={(e) => setBusinessData({ ...businessData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-accent text-primary font-medium"
                    placeholder="e.g. Dental Care, Restaurant, Roofing"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-gray-400" />
                    City
                  </label>
                  <input
                    type="text"
                    value={businessData.city}
                    onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-accent text-primary font-medium"
                    placeholder="e.g. Chicago"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-gray-400" />
                    Country
                  </label>
                  <input
                    type="text"
                    value={businessData.country}
                    onChange={(e) => setBusinessData({ ...businessData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-accent text-primary font-medium"
                    placeholder="e.g. United States"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Globe size={13} className="text-gray-400" />
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={businessData.websiteUrl}
                    onChange={(e) => setBusinessData({ ...businessData, websiteUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-accent text-primary font-medium"
                    placeholder="https://example.com"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">This URL is used by the AI engine to run live website audits.</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingBusiness}
                  className="flex items-center gap-2 py-2.5 px-6 bg-primary text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSavingBusiness ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Business Details
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Integrations Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-3">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Globe size={18} className="text-indigo-500" />
              Connected Integrations
            </h2>
          </div>
          
          <div className="p-6">
            {integrationsLoading ? (
               <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-500" /></div>
            ) : (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center shadow-sm">
                      <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Google Search Console</h3>
                      <p className="text-sm text-gray-500">Connect to pull legitimate search performance data.</p>
                    </div>
                  </div>
                  
                  {integrations.find(i => i.provider === 'google_search_console') ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg font-semibold text-sm border border-green-200">
                      <CheckCircle2 size={16} /> Connected
                    </div>
                  ) : (
                    <button onClick={connectGoogleSearchConsole} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-primary">Subscription Plan</h2>
          <p className="text-sm text-secondary mt-1">
            You are currently on the <span className="font-bold capitalize text-primary-accent">{currentPlan}</span> plan.
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Growth Package */}
            <div className={`relative rounded-2xl border-2 p-6 transition-all ${currentPlan === 'growth' ? 'border-primary-accent bg-blue-50/20' : 'border-gray-200 hover:border-gray-300'}`}>
              {currentPlan === 'growth' && (
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2">
                  <span className="bg-primary-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Current Plan
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    <Zap className="text-blue-500" size={20} />
                    Growth Package
                  </h3>
                  <p className="text-secondary text-sm mt-1">Perfect for small businesses</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-primary">$15</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 mt-6">
                {['Advanced AI Audits', 'Monthly Progress Reports', 'Priority Action Plans', 'Competitor Insights'].map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-700">
                    <Check className="text-green-500 mr-3 shrink-0" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={currentPlan === 'growth' || isProcessing !== null}
                onClick={() => handleCheckout('7594755d-5580-4b77-86ae-90baae0e20d8', 'growth')}
                className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all shadow-sm ${
                  currentPlan === 'growth'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-2 border-primary-accent text-primary-accent hover:bg-blue-50'
                }`}
              >
                {isProcessing === 'growth' ? 'Processing...' : (currentPlan === 'growth' ? 'Active' : 'Upgrade to Growth')}
              </button>
            </div>

            {/* Pro Package */}
            <div className={`relative rounded-2xl border-2 p-6 transition-all ${currentPlan === 'pro' ? 'border-blue-600 bg-blue-50/20' : 'border-gray-900 shadow-xl'}`}>
              {currentPlan !== 'pro' && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}
              {currentPlan === 'pro' && (
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Current Plan
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    <Star className="text-amber-500 fill-amber-500" size={20} />
                    Pro Package
                  </h3>
                  <p className="text-secondary text-sm mt-1">Maximum growth velocity</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-primary">$30</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 mt-6">
                {['Everything in Growth', 'Unlimited AI Audits', 'White-labeled PDF Reports', 'Dedicated Account Manager', 'Custom Review Requests'].map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-700">
                    <Check className="text-green-500 mr-3 shrink-0" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={currentPlan === 'pro' || isProcessing !== null}
                onClick={() => handleCheckout('97ffea75-9d0c-490f-b652-b2bfd360abe2', 'pro')}
                className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all shadow-md ${
                  currentPlan === 'pro'
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isProcessing === 'pro' ? 'Processing...' : (currentPlan === 'pro' ? 'Active' : 'Upgrade to Pro')}
              </button>
            </div>

          </div>
        </div>
        
        <div className="bg-gray-50 p-6 text-center text-sm text-secondary border-t border-gray-100">
          Payments are securely processed by <strong>Polar</strong>. You can cancel your subscription at any time.
        </div>
      </div>

      {/* Account Actions / Logout */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden mb-8">
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-danger flex items-center gap-2">
              Account Actions
            </h2>
            <p className="text-sm text-secondary mt-1">
              Securely log out of your session.
            </p>
          </div>
          <button 
            onClick={() => {
              document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-red-50 text-danger hover:bg-red-100 transition-colors rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
