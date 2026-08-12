import { CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createCheckout } from '../../lib/api';
import { useState } from 'react';
export function PricingSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCheckout = async (productId: string) => {
    if (!user) {
      navigate('/signup');
      return;
    }

    try {
      setLoadingId(productId);
      const res = await createCheckout(productId);
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert("Checkout failed: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="py-24 sm:py-32 bg-white" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-secondary">
            No contracts. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Audit Plan */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 border border-gray-200 flex flex-col">
            <h3 className="text-2xl font-bold text-primary mb-3">Free Audit</h3>
            <p className="text-secondary text-base mb-10 h-12">See where you stand right now.</p>
            <div className="mb-10">
              <span className="text-6xl font-black text-primary tracking-tight">$0</span>
            </div>
            
            <ul className="space-y-5 mb-12 flex-1">
              {[
                'One-time Growth Score',
                'Basic SEO Overview',
                'Top 3 Recommendations'
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-base text-secondary font-medium">
                  <CheckCircle2 size={24} className="text-gray-300 shrink-0" />
                  <span className="pt-0.5">{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full h-14 text-lg" size="lg" onClick={() => navigate(user ? '/dashboard' : '/signup')}>Run Free Audit</Button>
          </div>

          {/* Growth Plan (Recommended) */}
          <div className="bg-primary rounded-3xl p-8 lg:p-12 border border-primary shadow-xl flex flex-col relative md:-mt-6 md:-mb-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary-accent text-white text-xs font-bold px-4 py-2 rounded-b-lg tracking-wider">
              RECOMMENDED
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 mt-4 md:mt-0">Growth</h3>
            <p className="text-gray-400 text-base mb-10 h-12">Perfect for single-location businesses.</p>
            <div className="mb-10 flex items-baseline gap-1.5">
              <span className="text-6xl font-black text-white tracking-tight">$15</span>
              <span className="text-gray-400 text-lg font-medium">/mo</span>
            </div>
            
            <ul className="space-y-5 mb-12 flex-1">
              {[
                'Weekly Growth Score updates',
                'Full AI Action Plan',
                'Review Monitoring',
                'Competitor Tracking'
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-base text-gray-200 font-medium">
                  <CheckCircle2 size={24} className="text-primary-accent shrink-0" />
                  <span className="pt-0.5">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              variant="primary" 
              className="w-full h-14 text-lg" 
              size="lg"
              onClick={() => handleCheckout('47bdc1ba-789c-4a0c-88de-b7a7b5e43d21')}
              disabled={loadingId === '47bdc1ba-789c-4a0c-88de-b7a7b5e43d21'}
            >
              {loadingId === '47bdc1ba-789c-4a0c-88de-b7a7b5e43d21' ? 'Redirecting...' : 'Start Free Trial'}
            </Button>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 border border-gray-200 flex flex-col">
            <h3 className="text-2xl font-bold text-primary mb-3">Pro</h3>
            <p className="text-secondary text-base mb-10 h-12">For growing businesses and agencies.</p>
            <div className="mb-10 flex items-baseline gap-1.5">
              <span className="text-6xl font-black text-primary tracking-tight">$30</span>
              <span className="text-secondary text-lg font-medium">/mo</span>
            </div>
            
            <ul className="space-y-5 mb-12 flex-1">
              {[
                'Up to 3 Locations',
                'Real-time Growth Score',
                'AI Review Replies',
                'Priority Support'
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-base text-secondary font-medium">
                  <CheckCircle2 size={24} className="text-primary-accent shrink-0" />
                  <span className="pt-0.5">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              variant="outline" 
              className="w-full h-14 text-lg" 
              size="lg"
              onClick={() => handleCheckout('71c9c886-3ebb-4790-a87b-438694f22463')}
              disabled={loadingId === '71c9c886-3ebb-4790-a87b-438694f22463'}
            >
              {loadingId === '71c9c886-3ebb-4790-a87b-438694f22463' ? 'Redirecting...' : 'Start Free Trial'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
