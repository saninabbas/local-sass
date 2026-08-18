import { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Zap, 
  CheckCircle2, 
  Calendar, 
  ExternalLink, 
  Award, 
  Users, 
  ShieldCheck 
} from 'lucide-react';
import { getAdminUserDetails } from '../../../lib/api';
import type { AdminUser, AdminUserDetail } from '../../../types';
import { Button } from '../../../components/ui/Button';

interface UserDetailModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ user, isOpen, onClose }: UserDetailModalProps) {
  const [details, setDetails] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'audits' | 'leads' | 'backlinks'>('overview');

  useEffect(() => {
    if (isOpen && user) {
      setIsLoading(true);
      getAdminUserDetails(user.id)
        .then((res) => setDetails(res))
        .catch((err) => console.error("Failed to fetch user details:", err))
        .finally(() => setIsLoading(false));
    } else {
      setDetails(null);
      setActiveTab('overview');
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const getPlanDisplay = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise':
        return 'Enterprise VIP';
      case 'agency_pro':
      case 'pro':
        return 'Agency Pro ($80/mo)';
      case 'growth':
        return 'Growth ($30/mo)';
      case 'starter':
        return 'Starter ($15/mo)';
      default:
        return 'Starter ($15/mo)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary-accent font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-primary">{user.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.role}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-blue-100 text-primary-accent border border-blue-200">
                  {getPlanDisplay(user.subscription_status)}
                </span>
              </div>
              <p className="text-xs text-secondary font-mono mt-0.5">{user.email} • ID: {user.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-gray-200 bg-white flex gap-4 shrink-0 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'businesses', label: `Businesses (${details?.businesses?.length || 0})`, icon: Building2 },
            { id: 'audits', label: `Audits (${details?.audits?.length || 0})`, icon: Zap },
            { id: 'leads', label: `Leads (${details?.leads?.length || 0})`, icon: Users },
            { id: 'backlinks', label: `Authority (${details?.backlinks?.length || 0})`, icon: Award },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  isActive 
                    ? 'border-primary-accent text-primary-accent' 
                    : 'border-transparent text-secondary hover:text-primary'
                }`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-primary-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-secondary font-medium">Fetching comprehensive user telemetry...</span>
            </div>
          ) : (
            <>
              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200">
                      <span className="text-xs text-secondary font-medium">Account Status</span>
                      <div className="mt-1 flex items-center gap-2">
                        <CheckCircle2 size={16} className={user.email_verified ? 'text-success' : 'text-warning'} />
                        <span className="text-sm font-bold text-primary">
                          {user.email_verified ? 'Email Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200">
                      <span className="text-xs text-secondary font-medium">Member Since</span>
                      <div className="mt-1 flex items-center gap-2">
                        <Calendar size={16} className="text-primary-accent" />
                        <span className="text-sm font-bold text-primary">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200">
                      <span className="text-xs text-secondary font-medium">Subscription Tier</span>
                      <div className="mt-1 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-purple-600" />
                        <span className="text-sm font-bold text-primary">
                          {getPlanDisplay(user.subscription_status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary counts */}
                  <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-4">
                      Platform Footprint Summary
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-2xl font-black text-primary">{details?.businesses?.length || 0}</span>
                        <p className="text-[11px] text-secondary font-semibold mt-1">Businesses</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-2xl font-black text-primary-accent">{details?.audits?.length || 0}</span>
                        <p className="text-[11px] text-secondary font-semibold mt-1">Audits Run</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-2xl font-black text-amber-600">{details?.recommendations?.length || 0}</span>
                        <p className="text-[11px] text-secondary font-semibold mt-1">AI Action Items</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-2xl font-black text-success">{details?.leads?.length || 0}</span>
                        <p className="text-[11px] text-secondary font-semibold mt-1">Leads Captured</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Businesses */}
              {activeTab === 'businesses' && (
                <div className="space-y-3">
                  {(!details?.businesses || details.businesses.length === 0) ? (
                    <div className="py-12 text-center text-secondary text-sm">
                      No businesses configured by this user yet.
                    </div>
                  ) : (
                    details.businesses.map((b: any) => (
                      <div key={b.id} className="p-4 bg-gray-50/60 border border-gray-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary">{b.name}</span>
                            {b.type && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-medium">
                                {b.type}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-secondary">
                            Location: {b.city || 'N/A'}{b.country ? `, ${b.country}` : ''}
                          </p>
                          {b.website_url && (
                            <a
                              href={b.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary-accent hover:underline"
                            >
                              <span>{b.website_url}</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-secondary font-mono">
                          ID: {b.id}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Audits */}
              {activeTab === 'audits' && (
                <div className="space-y-3">
                  {(!details?.audits || details.audits.length === 0) ? (
                    <div className="py-12 text-center text-secondary text-sm">
                      No audits found for this user.
                    </div>
                  ) : (
                    details.audits.map((a: any) => (
                      <div key={a.id} className="p-4 bg-gray-50/60 border border-gray-200 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary uppercase">{a.status}</span>
                            <span className="text-xs text-secondary">• {new Date(a.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-secondary font-mono">Audit ID: {a.id}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-extrabold text-primary-accent">
                            {a.score !== null ? `${a.score}/100` : 'Pending'}
                          </div>
                          <span className="text-[10px] text-secondary font-medium">Growth Score</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Leads */}
              {activeTab === 'leads' && (
                <div className="space-y-3">
                  {(!details?.leads || details.leads.length === 0) ? (
                    <div className="py-12 text-center text-secondary text-sm">
                      No leads captured via widget.
                    </div>
                  ) : (
                    details.leads.map((l: any) => (
                      <div key={l.id} className="p-4 bg-gray-50/60 border border-gray-200 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-primary">{l.name || 'Anonymous'}</p>
                          <p className="text-xs text-primary-accent font-mono">{l.email}</p>
                          {l.website && <p className="text-xs text-secondary">{l.website}</p>}
                        </div>
                        <div className="text-xs text-secondary">
                          {new Date(l.captured_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Backlinks */}
              {activeTab === 'backlinks' && (
                <div className="space-y-3">
                  {(!details?.backlinks || details.backlinks.length === 0) ? (
                    <div className="py-12 text-center text-secondary text-sm">
                      No backlinks or authority links recorded yet.
                    </div>
                  ) : (
                    details.backlinks.map((bk: any) => (
                      <div key={bk.id} className="p-4 bg-gray-50/60 border border-gray-200 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-primary">{bk.source_url || bk.name || 'Backlink'}</p>
                          <p className="text-xs text-secondary">{bk.target_url || bk.url}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-primary-accent">
                          {bk.status || 'Active'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0 bg-gray-50/50">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
