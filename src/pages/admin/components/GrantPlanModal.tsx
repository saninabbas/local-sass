import { useState } from 'react';
import { ShieldCheck, X, Check, CreditCard } from 'lucide-react';
import type { AdminUser } from '../../../types';

interface GrantPlanModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onGrant: (userId: string, plan: string) => Promise<void>;
}

export function GrantPlanModal({ user, isOpen, onClose, onGrant }: GrantPlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      desc: 'Standard trial tier with basic SEO audit and limited features.',
      badge: 'Free Tier',
      color: 'border-slate-700 bg-slate-800/40 text-slate-300'
    },
    {
      id: 'starter',
      name: 'Starter Plan',
      desc: 'Full website scan, AI action plans, and weekly rank tracking.',
      badge: '$29/mo Tier',
      color: 'border-blue-800/60 bg-blue-950/30 text-blue-300'
    },
    {
      id: 'pro',
      name: 'Pro Growth (Recommended)',
      desc: 'Unlimited audits, AI blog writer, Backlink builder & Google Business Sync.',
      badge: '$79/mo Tier',
      color: 'border-purple-800/60 bg-purple-950/30 text-purple-300'
    },
    {
      id: 'enterprise',
      name: 'Enterprise / Agency',
      desc: 'All features + multi-location, white-label PDF reports and highest priority AI compute.',
      badge: '$199/mo Tier',
      color: 'border-amber-800/60 bg-amber-950/30 text-amber-300'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onGrant(user.id, selectedPlan);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to grant plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Grant / Change Plan</h3>
              <p className="text-xs text-slate-400">
                Grant access tier to <span className="text-blue-400 font-semibold">{user.name}</span> ({user.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-2.5">
            {plans.map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{p.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.color}`}>
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{p.desc}</p>
                  </div>
                  <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700'
                  }`}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating Plan...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Grant Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
