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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{user.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  user.role === 'admin' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {user.role}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  user.subscription_status === 'enterprise' ? 'bg-amber-500/20 text-amber-300' :
                  user.subscription_status === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                  user.subscription_status === 'starter' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {user.subscription_status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email} • ID: {user.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/90 flex gap-4 shrink-0 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'User Overview', icon: User },
            { id: 'businesses', label: `Businesses (${details?.businesses?.length || 0})`, icon: Building2 },
            { id: 'audits', label: `Audits & Scores (${details?.audits?.length || 0})`, icon: Zap },
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
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
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
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400 font-medium">Fetching comprehensive user profile...</span>
            </div>
          ) : (
            <>
              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">Account Status</span>
                      <div className="mt-1 flex items-center gap-2">
                        <CheckCircle2 size={16} className={user.email_verified ? 'text-emerald-400' : 'text-amber-400'} />
                        <span className="text-sm font-bold text-white">
                          {user.email_verified ? 'Email Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">Registered Date</span>
                      <div className="mt-1 flex items-center gap-2">
                        <Calendar size={16} className="text-blue-400" />
                        <span className="text-sm font-bold text-white">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">Active Plan</span>
                      <div className="mt-1 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-purple-400" />
                        <span className="text-sm font-bold text-white uppercase">
                          {user.subscription_status || 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary counts */}
                  <div className="p-5 bg-slate-950/40 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">
                      Platform Footprint
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80">
                        <span className="text-2xl font-black text-white">{details?.businesses?.length || 0}</span>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">Businesses</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80">
                        <span className="text-2xl font-black text-blue-400">{details?.audits?.length || 0}</span>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">Audits Run</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80">
                        <span className="text-2xl font-black text-amber-400">{details?.recommendations?.length || 0}</span>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">AI Action Items</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80">
                        <span className="text-2xl font-black text-emerald-400">{details?.leads?.length || 0}</span>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">Leads Captured</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Businesses */}
              {activeTab === 'businesses' && (
                <div className="space-y-4">
                  {(!details?.businesses || details.businesses.length === 0) ? (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No businesses configured by this user yet.
                    </div>
                  ) : (
                    details.businesses.map((b: any) => (
                      <div key={b.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{b.name}</span>
                            {b.type && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {b.type}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            Location: {b.city || 'N/A'}{b.country ? `, ${b.country}` : ''}
                          </p>
                          {b.website_url && (
                            <a
                              href={b.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                            >
                              <span>{b.website_url}</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          ID: {b.id}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Audits */}
              {activeTab === 'audits' && (
                <div className="space-y-4">
                  {(!details?.audits || details.audits.length === 0) ? (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No audits found for this user.
                    </div>
                  ) : (
                    details.audits.map((a: any) => (
                      <div key={a.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white uppercase">{a.status}</span>
                            <span className="text-xs text-slate-400">• {new Date(a.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono">Audit ID: {a.id}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-extrabold text-blue-400">
                            {a.score !== null ? `${a.score}/100` : 'Pending'}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">Growth Score</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Leads */}
              {activeTab === 'leads' && (
                <div className="space-y-4">
                  {(!details?.leads || details.leads.length === 0) ? (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No leads captured via widget.
                    </div>
                  ) : (
                    details.leads.map((l: any) => (
                      <div key={l.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">{l.name || 'Anonymous'}</p>
                          <p className="text-xs text-blue-400 font-mono">{l.email}</p>
                          {l.website && <p className="text-xs text-slate-400">{l.website}</p>}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(l.captured_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Backlinks */}
              {activeTab === 'backlinks' && (
                <div className="space-y-4">
                  {(!details?.backlinks || details.backlinks.length === 0) ? (
                    <div className="py-12 text-center text-slate-500 text-sm">
                      No backlinks or authority links recorded yet.
                    </div>
                  ) : (
                    details.backlinks.map((bk: any) => (
                      <div key={bk.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">{bk.source_url || bk.name || 'Backlink'}</p>
                          <p className="text-xs text-slate-400">{bk.target_url || bk.url}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300">
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
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end shrink-0 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
