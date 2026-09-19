import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Globe, Plus, AlertCircle, CheckCircle2, Loader2, X, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AddWebsiteModal: React.FC = () => {
  const { 
    isAddWebsiteOpen, 
    closeAddWebsiteModal, 
    addWebsite, 
    websitesUsed, 
    planLimit, 
    subscriptionStatus,
    businesses 
  } = useBusiness();

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('US');
  const [setAsActive, setSetAsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAddWebsiteOpen) return null;

  const isLimitReached = websitesUsed >= planLimit;

  // Real-time domain duplicate check
  const normalizeDomain = (url: string) => {
    return url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  };

  const currentDomain = normalizeDomain(websiteUrl);
  const isDuplicate = currentDomain.length > 2 && businesses.some(b => normalizeDomain(b.website_url) === currentDomain);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) {
      setErrorMessage('Please enter a website URL');
      return;
    }

    if (isLimitReached) {
      setErrorMessage(`Your ${subscriptionStatus.toUpperCase()} plan limit of ${planLimit} website${planLimit > 1 ? 's' : ''} is reached. Please upgrade to add more.`);
      return;
    }

    if (isDuplicate) {
      setErrorMessage('This website domain is already configured in your workspace.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Auto-prefix https if missing
      let formattedUrl = websiteUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      await addWebsite({
        websiteUrl: formattedUrl,
        name: businessName.trim() || undefined,
        type: businessType.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        setAsActive,
      });

      setSuccessMessage('Website added successfully to your workspace!');
      setTimeout(() => {
        setSuccessMessage(null);
        setWebsiteUrl('');
        setBusinessName('');
        setBusinessType('');
        setCity('');
        closeAddWebsiteModal();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add website');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 bg-[#efe9de] border-b border-[#e6dfd8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#cc785c]/10 border border-[#cc785c]/20 flex items-center justify-center text-[#cc785c]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#141413]">Add Website Project</h3>
              <p className="text-xs text-[#605f5b]">Connect another domain to your multi-client SEO workspace</p>
            </div>
          </div>
          <button 
            onClick={closeAddWebsiteModal}
            className="p-2 text-[#605f5b] hover:text-[#141413] rounded-lg hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Plan Usage Strip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-[#e6dfd8] text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#141413]">Workspace Capacity:</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${isLimitReached ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {websitesUsed} of {planLimit} used
              </span>
            </div>
            <span className="text-[#605f5b] uppercase font-bold tracking-wider text-[10px]">
              {subscriptionStatus} plan
            </span>
          </div>

          {isLimitReached ? (
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Website Limit Reached</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                You have reached the maximum number of websites allowed on your current <strong>{subscriptionStatus.toUpperCase()}</strong> plan ({planLimit} limit). Upgrade to add more client domains.
              </p>
              <div className="pt-2">
                <Link
                  to="/pricing"
                  onClick={closeAddWebsiteModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#cc785c] text-white text-xs font-bold rounded-xl hover:bg-[#b8694f] transition-all shadow-xs"
                >
                  <span>Upgrade Workspace Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Website URL */}
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">
                  Website URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="https://example.com or example.com"
                    value={websiteUrl}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value);
                      setErrorMessage(null);
                    }}
                    className="w-full pl-3 pr-10 py-2.5 bg-white border border-[#e6dfd8] rounded-xl text-sm text-[#141413] placeholder:text-[#605f5b]/50 focus:outline-none focus:ring-2 focus:ring-[#cc785c]/30 focus:border-[#cc785c] transition-all"
                  />
                  <Globe className="absolute right-3 top-2.5 w-4 h-4 text-[#605f5b]/50" />
                </div>
                {isDuplicate && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    This website is already in your workspace.
                  </p>
                )}
              </div>

              {/* Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">
                    Business Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Dental Austin"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#e6dfd8] rounded-xl text-sm text-[#141413] placeholder:text-[#605f5b]/50 focus:outline-none focus:ring-2 focus:ring-[#cc785c]/30 focus:border-[#cc785c] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">
                    Category / Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dentist, Plumber, Lawyer"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#e6dfd8] rounded-xl text-sm text-[#141413] placeholder:text-[#605f5b]/50 focus:outline-none focus:ring-2 focus:ring-[#cc785c]/30 focus:border-[#cc785c] transition-all"
                  />
                </div>
              </div>

              {/* City & Country */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">
                    Target City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Austin"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#e6dfd8] rounded-xl text-sm text-[#141413] placeholder:text-[#605f5b]/50 focus:outline-none focus:ring-2 focus:ring-[#cc785c]/30 focus:border-[#cc785c] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    placeholder="US, CA, UK, AU"
                    value={country}
                    onChange={(e) => setCountry(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white border border-[#e6dfd8] rounded-xl text-sm text-[#141413] placeholder:text-[#605f5b]/50 focus:outline-none focus:ring-2 focus:ring-[#cc785c]/30 focus:border-[#cc785c] transition-all uppercase"
                  />
                </div>
              </div>

              {/* Set as active toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="setAsActive"
                  checked={setAsActive}
                  onChange={(e) => setSetAsActive(e.target.checked)}
                  className="rounded border-gray-300 text-[#cc785c] focus:ring-[#cc785c]"
                />
                <label htmlFor="setAsActive" className="text-xs text-[#141413] font-medium cursor-pointer">
                  Switch to this website immediately after adding
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e6dfd8]">
                <button
                  type="button"
                  onClick={closeAddWebsiteModal}
                  className="px-4 py-2 text-xs font-medium text-[#605f5b] hover:text-[#141413] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isDuplicate || !websiteUrl.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#cc785c] text-white text-xs font-bold rounded-xl hover:bg-[#b8694f] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding & Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Website Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
