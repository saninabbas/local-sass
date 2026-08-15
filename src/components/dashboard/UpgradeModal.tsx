import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, ShieldAlert, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { fetchApi } from '../../lib/api';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  currentUsed?: number;
  maxAllowed?: number;
  featureName?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  title = "WEBSITE LIMIT REACHED",
  description = "You have reached your project limit on the 14-Day Free Trial.",
  currentUsed = 1,
  maxAllowed = 1,
  featureName = "websites"
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleStartGrowthCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'growth' })
      });

      const targetUrl = res.data?.url || res.checkoutUrl;
      if (res.success && targetUrl) {
        window.location.href = targetUrl;
      } else {
        alert(res.error || 'Failed to initiate checkout. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'Checkout initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8e8b82] hover:text-[#141413] cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#cc785c]/10 text-[#cc785c] flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#cc785c] tracking-wider">
              Entitlement Limit Alert
            </span>
            <h3 className="text-xl font-serif font-bold text-[#141413]">{title}</h3>
          </div>
        </div>

        <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">
          {description}
        </p>

        {/* Usage Stats Box */}
        <div className="p-4 bg-[#efe9de]/60 rounded-2xl border border-[#e6dfd8] font-mono text-xs space-y-1">
          <div className="flex justify-between text-[#8e8b82] text-[10px] uppercase font-bold">
            <span>{featureName} Used</span>
            <span>{currentUsed} / {maxAllowed}</span>
          </div>
          <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#e6dfd8] mt-1">
            <div className="bg-[#cc785c] h-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Plan Upgrade Comparison */}
        <div className="p-5 bg-white border border-[#cc785c]/40 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-serif font-bold text-[#141413]">Growth Plan</span>
              <span className="text-[10px] font-mono text-[#8e8b82] block">Upgrade & Unlock Capacity</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-serif font-bold text-[#141413]">$49</span>
              <span className="text-[10px] font-mono text-[#8e8b82]">/month</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs font-sans border-t border-[#e6dfd8] pt-3">
            <li className="flex items-center gap-2 text-[#141413]">
              <Check size={14} className="text-[#cc785c]" />
              <span>Up to <strong>5 Website Projects</strong></span>
            </li>
            <li className="flex items-center gap-2 text-[#141413]">
              <Check size={14} className="text-[#cc785c]" />
              <span><strong>50 Tracked Keywords</strong> & 10 GeoGrid Scans</span>
            </li>
            <li className="flex items-center gap-2 text-[#141413]">
              <Check size={14} className="text-[#cc785c]" />
              <span><strong>250 AI Code Fixes</strong> & Live Verification</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={handleStartGrowthCheckout}
            disabled={loading}
            className="w-full sm:flex-1 py-3 bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <CreditCard size={15} className="text-[#cc785c]" />
            <span>{loading ? 'Initiating Checkout...' : 'UPGRADE TO GROWTH ($49/mo)'}</span>
          </Button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 text-xs font-semibold text-[#6c6a64] hover:text-[#141413] cursor-pointer"
          >
            NOT NOW
          </button>
        </div>

      </div>
    </div>
  );
};
