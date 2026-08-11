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
    <div className="min-h-screen bg-gray-50 flex flex-col pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-12 relative">
          {[
            { num: 1, label: 'Business' },
            { num: 2, label: 'Details' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center flex-1 z-10 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s.num ? 'bg-primary text-white shadow-md' : 'bg-gray-200 text-gray-400'
              }`}>
                {s.num}
              </div>
              <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-primary' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
          {/* Track line */}
          <div className="absolute top-4 left-[25%] right-[25%] h-0.5 bg-gray-200 z-0">
            <div className={`h-full bg-primary transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>
        </div>

        <div className="bg-white py-10 px-6 shadow-xl shadow-black/5 sm:rounded-2xl sm:px-12 border border-gray-200 relative overflow-hidden">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-danger text-sm rounded-lg">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-extrabold text-primary mb-6">Tell us about your business</h2>
              <FormField
                label="Business Name"
                id="businessName"
                type="text"
                placeholder="ABC Dental"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="mb-8">
                <label htmlFor="businessType" className="block text-sm font-semibold text-primary mb-2">
                  Business Type
                </label>
                <select
                  id="businessType"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-primary text-base focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all appearance-none"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="" disabled>Select an industry...</option>
                  {businessTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full text-lg h-12">
                Continue
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-extrabold text-primary mb-6">Business Details</h2>
              <FormField
                label="City"
                id="city"
                type="text"
                placeholder="New York"
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
                label="Website URL"
                id="website"
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                required
              />
              <div className="flex gap-4 mt-8">
                <Button type="button" variant="outline" size="lg" className="w-1/3 h-12" onClick={() => setStep(1)} disabled={isLoading}>
                  Back
                </Button>
                <Button type="submit" variant="primary" size="lg" className="w-2/3 h-12" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Start Free Audit'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
