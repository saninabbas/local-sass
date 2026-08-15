import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  Zap, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Crown
} from 'lucide-react';
import { Button } from '../ui/Button';
import { fetchApi } from '../../lib/api';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  reason?: string;
  targetPlan?: 'growth' | 'pro';
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  title = 'Upgrade Your Rankora Plan',
  reason = 'You have reached the limit for your current plan.',
  targetPlan = 'growth'
}) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (plan: 'growth' | 'pro') => {
    setLoadingPlan(plan);
    try {
      const res = await fetchApi('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: plan,
          productId: plan === 'growth' ? '7594755d-5580-4b77-86ae-90baae0e20d8' : 'pro_package_id'
        })
      });

      if (res.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert(res.error || 'Failed to initiate checkout session.');
      }
    } catch (err: any) {
      alert(err.message || 'Checkout failed.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141413]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6dfd8] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#141413] text-[#faf9f5] flex items-center justify-center">
              <Crown size={20} className="text-[#cc785c]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#cc785c] font-bold">Commercial Entitlement</span>
              <h3 className="font-serif font-bold text-xl text-[#141413]">{title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#8e8b82] hover:text-[#141413] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Reason Alert */}
        <div className="p-3.5 rounded-2xl bg-[#efe9de]/70 border border-[#e6dfd8] text-xs font-sans text-[#141413] flex items-center gap-2.5">
          <Zap size={16} className="text-[#cc785c] shrink-0" />
          <span>{reason}</span>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Growth Plan */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            targetPlan === 'growth' ? 'bg-[#efe9de]/40 border-[#cc785c] ring-1 ring-[#cc785c]' : 'bg-white border-[#e6dfd8]'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-[#141413]">Growth Plan</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#cc785c]/10 text-[#cc785c]">POPULAR</span>
              </div>
              <div className="font-serif text-2xl font-bold text-[#141413]">
                $49<span className="text-xs font-sans font-normal text-[#8e8b82]">/month</span>
              </div>
              <ul className="space-y-2 text-xs font-sans text-[#6c6a64]">
                <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 5 Website Projects</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 50 Tracked Keywords</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 10 GeoGrid Scans</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 250 AI Fix Generations</li>
              </ul>
            </div>

            <Button
              size="sm"
              onClick={() => handleCheckout('growth')}
              disabled={loadingPlan === 'growth'}
              className="mt-5 w-full bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold"
            >
              {loadingPlan === 'growth' ? 'Loading Checkout...' : 'Upgrade to Growth'}
            </Button>
          </div>

          {/* Pro / Agency Plan */}
          <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
            targetPlan === 'pro' ? 'bg-[#efe9de]/40 border-[#cc785c] ring-1 ring-[#cc785c]' : 'bg-white border-[#e6dfd8]'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-[#141413]">Agency / Pro</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141413] text-[#faf9f5]">MAX VALUE</span>
              </div>
              <div className="font-serif text-2xl font-bold text-[#141413]">
                $149<span className="text-xs font-sans font-normal text-[#8e8b82]">/month</span>
              </div>
              <ul className="space-y-2 text-xs font-sans text-[#6c6a64]">
                <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 25 Website Projects</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 500 Tracked Keywords</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 50 GeoGrid Scans</li>
                <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 2,500 AI Fix Generations</li>
              </ul>
            </div>

            <Button
              size="sm"
              onClick={() => handleCheckout('pro')}
              disabled={loadingPlan === 'pro'}
              className="mt-5 w-full bg-[#cc785c] hover:bg-[#b8674d] text-white text-xs font-semibold"
            >
              {loadingPlan === 'pro' ? 'Loading Checkout...' : 'Upgrade to Pro'}
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
};
