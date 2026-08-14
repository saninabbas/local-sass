import { useState } from 'react';
import { ShieldCheck, X, Check, CreditCard } from 'lucide-react';
import type { AdminUser } from '../../../types';
import { Button } from '../../../components/ui/Button';

interface GrantPlanModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onGrant: (userId: string, plan: string) => Promise<void>;
}

export function GrantPlanModal({ user, isOpen, onClose, onGrant }: GrantPlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('growth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const plans = [
    {
      id: 'free',
      name: 'Free Audit Plan',
      price: '$0',
      desc: 'One-time Growth Score, Basic SEO Overview, Top 3 Recommendations.',
      badge: 'Free Tier',
      badgeClass: 'bg-gray-100 text-gray-700 border border-gray-200'
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      price: '$15/mo',
      desc: 'Weekly Growth Score updates, Full AI Action Plan, Review Monitoring & Competitor Tracking.',
      badge: 'Recommended',
      badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200 font-bold'
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$30/mo',
      desc: 'Up to 3 Locations, Real-time Growth Score, AI Review Replies & Priority Support.',
      badge: 'Pro Tier',
      badgeClass: 'bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold'
    },
    {
      id: 'enterprise',
      name: 'Enterprise / Agency',
      price: 'Custom / VIP',
      desc: 'Multi-location accounts, White-label PDF Reports, Authority Builder & Dedicated Compute.',
      badge: 'VIP Agency',
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200 font-bold'
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
      setError(err?.message || 'Failed to grant plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-primary-accent rounded-xl">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">Grant Platform Plan</h3>
              <p className="text-xs text-secondary">
                Assign plan tier to <span className="font-semibold text-primary">{user.name}</span> ({user.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-danger text-xs rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {plans.map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between ${
                    isSelected
                      ? 'border-primary-accent bg-blue-50/50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{p.name}</span>
                      <span className="text-xs font-bold text-secondary font-mono">({p.price})</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.badgeClass}`}>
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">{p.desc}</p>
                  </div>
                  <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary-accent border-primary-accent text-white' : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Granting Plan...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Confirm & Grant Plan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
