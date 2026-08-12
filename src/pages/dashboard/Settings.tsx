import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { createCheckout } from '../../lib/api';
import { Check, Star, Zap, User, Building, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Fallback to 'free' if the user context doesn't have a subscription status yet
  // In a real app, you would fetch this from the /api/auth/me endpoint or a /api/billing/status endpoint
  const currentPlan = (user as any)?.subscription_status || 'free'; 

  const handleCheckout = async (productId: string, planName: string) => {
    setIsProcessing(planName);
    try {
      const response = await createCheckout(productId);
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        alert("Could not generate checkout link. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong securely redirecting to checkout.");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-primary mb-2">Account Settings</h1>
        <p className="text-secondary">Manage your profile, business, billing, and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-1">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <User size={18} className="text-secondary" />
              Profile
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
              <p className="text-primary font-medium">{user?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
              <p className="text-primary font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Business Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              <Building size={18} className="text-secondary" />
              Business Details
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-secondary mb-4">Your business data is currently managed during onboarding. Updates coming soon.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Business Name</label>
                <div className="h-10 bg-gray-50 border border-gray-100 rounded-md px-3 py-2 text-sm text-gray-400">Locked</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Website URL</label>
                <div className="h-10 bg-gray-50 border border-gray-100 rounded-md px-3 py-2 text-sm text-gray-400">Locked</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  <span className="text-3xl font-extrabold text-primary">$10</span>
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
                onClick={() => handleCheckout('47bdc1ba-789c-4a0c-88de-b7a7b5e43d21', 'growth')}
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
                onClick={() => handleCheckout('71c9c886-3ebb-4790-a87b-438694f22463', 'pro')}
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
              document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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
