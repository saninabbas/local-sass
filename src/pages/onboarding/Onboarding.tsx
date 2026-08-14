import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { createBusiness } from '../../lib/api';

export function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const businessTypes = [
    'Restaurant', 'Dentist', 'Salon', 'Clinic', 'Gym', 
    'Lawyer', 'Real Estate', 'Local Service', 'Other'
  ];

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      setError('');
      setIsLoading(true);
      try {
        await createBusiness({ name, type, city, country, websiteUrl });
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to create business');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col pt-10 sm:pt-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <img src="/brand/logo.png" alt="Rankora" className="h-8 w-auto" />
            <span className="font-serif font-bold text-xl text-[#141413]">Rankora</span>
          </div>
          <p className="text-xs text-[#6c6a64] font-sans">Set up your local entity to begin telemetry crawling</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 relative px-8">
          {[
            { num: 1, label: 'Organization' },
            { num: 2, label: 'Location & URL' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center flex-1 z-10 relative">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                step >= s.num ? 'bg-[#cc785c] text-white shadow-xs' : 'bg-[#e8e0d2] text-[#8e8b82]'
              }`}>
                {s.num}
              </div>
              <span className={`text-[11px] mt-1.5 font-sans font-medium ${step >= s.num ? 'text-[#141413]' : 'text-[#8e8b82]'}`}>
                {s.label}
              </span>
            </div>
          ))}
          {/* Track line */}
          <div className="absolute top-3.5 left-[30%] right-[30%] h-0.5 bg-[#e6dfd8] z-0">
            <div className={`h-full bg-[#cc785c] transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>
        </div>

        <div className="bg-[#efe9de] py-8 px-6 sm:px-10 rounded-2xl border border-[#e6dfd8] shadow-xs relative overflow-hidden">
          {error && (
            <div className="mb-5 p-3 bg-[#faf9f5] border border-[#c64545]/30 text-[#c64545] text-xs font-mono rounded-lg">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="animate-in fade-in duration-300">
              <h2 className="text-xl font-serif font-normal text-[#141413] mb-4">Organization Profile</h2>
              <FormField
                label="Business Name"
                id="businessName"
                type="text"
                placeholder="Apex Dental Clinic"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="mb-6">
                <label htmlFor="businessType" className="block text-xs font-mono uppercase tracking-wider text-[#6c6a64] mb-1">
                  Business Industry
                </label>
                <select
                  id="businessType"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] text-[#141413] text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#cc785c] transition-all"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="" disabled>Select an industry category...</option>
                  {businessTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full text-xs font-medium h-10 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-lg">
                Continue to Step 2
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="animate-in fade-in duration-300">
              <h2 className="text-xl font-serif font-normal text-[#141413] mb-4">Location & Website URL</h2>
              <FormField
                label="City"
                id="city"
                type="text"
                placeholder="Chicago"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <FormField
                label="Country"
                id="country"
                type="text"
                placeholder="United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
              <FormField
                label="Website URL (Audit Target)"
                id="website"
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                required
              />
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" size="lg" className="w-1/3 h-10 text-xs border-[#e6dfd8] bg-[#faf9f5] text-[#141413]" onClick={() => setStep(1)} disabled={isLoading}>
                  Back
                </Button>
                <Button type="submit" variant="primary" size="lg" className="w-2/3 h-10 text-xs font-medium bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-lg" disabled={isLoading}>
                  {isLoading ? 'Initializing...' : 'Complete & Launch'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
