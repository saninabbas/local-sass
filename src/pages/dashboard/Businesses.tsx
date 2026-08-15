import React, { useState } from 'react';
import { useBusiness, type WorkspaceBusiness } from '../../context/BusinessContext';
import { 
  Globe, 
  Plus, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Sparkles, 
  AlertCircle,
  ArrowRight,
  Shield,
  Activity,
  Layers
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { runAudit } from '../../lib/api';

export const Businesses: React.FC = () => {
  const navigate = useNavigate();
  const { 
    businesses, 
    activeBusiness, 
    activeBusinessId, 
    planLimit, 
    websitesUsed, 
    subscriptionStatus,
    switchBusiness, 
    updateWebsite, 
    removeWebsite, 
    openAddWebsiteModal,
    refreshBusinesses
  } = useBusiness();

  const [editingBiz, setEditingBiz] = useState<WorkspaceBusiness | null>(null);
  const [deleteConfirmBiz, setDeleteConfirmBiz] = useState<WorkspaceBusiness | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuditingId, setIsAuditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isLimitReached = websitesUsed >= planLimit;

  const handleSwitchAndNavigate = async (id: string) => {
    await switchBusiness(id);
    navigate('/dashboard');
  };

  const handleRunAudit = async (biz: WorkspaceBusiness) => {
    try {
      setIsAuditingId(biz.id);
      await runAudit(biz.id);
      await refreshBusinesses();
      setFeedback({ type: 'success', message: `Audit completed successfully for ${biz.name || biz.website_url}` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Audit failed' });
    } finally {
      setIsAuditingId(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBiz) return;

    try {
      setIsSaving(true);
      await updateWebsite(editingBiz.id, {
        name: editingBiz.name,
        type: editingBiz.type,
        city: editingBiz.city,
        country: editingBiz.country,
        website_url: editingBiz.website_url,
      });
      setEditingBiz(null);
      setFeedback({ type: 'success', message: 'Website details updated successfully' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update website' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmBiz) return;
    try {
      await removeWebsite(deleteConfirmBiz.id);
      setDeleteConfirmBiz(null);
      setFeedback({ type: 'success', message: 'Website removed from your workspace' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove website' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6dfd8]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#cc785c]/10 text-[#cc785c] text-[11px] font-bold tracking-wider uppercase">
              Multi-Client Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
            Websites & Client Projects
          </h1>
          <p className="text-sm text-[#605f5b] mt-1">
            Manage all your client websites, track independent audits, and switch workspaces seamlessly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-semibold text-[#141413]">
              {websitesUsed} of {planLimit} Websites
            </span>
            <span className="text-[11px] text-[#605f5b] uppercase font-bold tracking-wider">
              {subscriptionStatus} plan
            </span>
          </div>

          <button
            onClick={openAddWebsiteModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#cc785c] text-white text-xs font-bold rounded-xl hover:bg-[#b8694f] transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Website Project</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Plan Capacity Banner */}
      <div className="p-5 rounded-2xl bg-[#efe9de] border border-[#e6dfd8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#cc785c] shadow-xs shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#141413]">
              Workspace Allocation: {websitesUsed} / {planLimit} Active Domains
            </h3>
            <p className="text-xs text-[#605f5b] mt-0.5">
              Each domain maintains dedicated SEO scores, audits, keywords, competitor gap analysis, and GeoGrid matrices.
            </p>
          </div>
        </div>

        {isLimitReached && (
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e6dfd8] text-[#141413] text-xs font-bold rounded-xl hover:bg-[#faf9f5] transition-all shadow-xs shrink-0"
          >
            <span>Upgrade Limit</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#cc785c]" />
          </Link>
        )}
      </div>

      {/* Websites Grid */}
      {businesses.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#faf9f5] rounded-2xl border border-[#e6dfd8]">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#efe9de] flex items-center justify-center text-[#cc785c]">
            <Globe className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#141413] mb-2">No Websites Added Yet</h3>
          <p className="text-xs text-[#605f5b] max-w-md mx-auto mb-6">
            Get started by adding your primary business website or client domain to run deep technical audits and track rankings.
          </p>
          <button
            onClick={openAddWebsiteModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#cc785c] text-white text-xs font-bold rounded-xl hover:bg-[#b8694f] transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Website</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {businesses.map((biz) => {
            const isActive = biz.id === activeBusinessId;
            const score = biz.latest_score;

            return (
              <div 
                key={biz.id}
                className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#faf9f5] border-[#cc785c] ring-2 ring-[#cc785c]/10 shadow-md' 
                    : 'bg-[#faf9f5] border-[#e6dfd8] hover:border-[#cc785c]/50 hover:shadow-xs'
                }`}
              >
                {/* Active Pill */}
                {isActive && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Project
                  </div>
                )}

                <div>
                  {/* Top Meta */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#efe9de] border border-[#e6dfd8] flex items-center justify-center text-[#cc785c] shrink-0 font-serif font-bold text-base">
                      {biz.name ? biz.name.charAt(0).toUpperCase() : 'W'}
                    </div>
                    <div className="pr-20">
                      <h3 className="font-serif font-bold text-base text-[#141413] line-clamp-1">
                        {biz.name || 'Untitled Business'}
                      </h3>
                      <a 
                        href={biz.website_url.startsWith('http') ? biz.website_url : `https://${biz.website_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#cc785c] hover:underline flex items-center gap-1 mt-0.5 line-clamp-1"
                      >
                        <span>{biz.website_url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                      </a>
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="space-y-1.5 mb-6 text-xs text-[#605f5b]">
                    {biz.type && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#605f5b]/70">Industry:</span>
                        <span className="font-medium text-[#141413]">{biz.type}</span>
                      </div>
                    )}
                    {biz.city && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#605f5b]/70">Target Market:</span>
                        <span className="font-medium text-[#141413]">{biz.city}{biz.country ? `, ${biz.country}` : ''}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[#605f5b]/70">Last Audit:</span>
                      <span className="font-medium text-[#141413]">
                        {biz.last_audit_time ? new Date(biz.last_audit_time).toLocaleDateString() : 'Not audited yet'}
                      </span>
                    </div>
                  </div>

                  {/* Score strip */}
                  <div className="p-3.5 rounded-xl bg-[#efe9de]/70 border border-[#e6dfd8] flex items-center justify-between mb-6">
                    <span className="text-xs font-semibold text-[#141413]">Growth Score</span>
                    {score !== null && score !== undefined ? (
                      <span className={`text-sm font-bold px-2.5 py-0.5 rounded-lg ${
                        score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                        score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {score} / 100
                      </span>
                    ) : (
                      <span className="text-xs text-[#605f5b] italic">Audit required</span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-4 border-t border-[#e6dfd8] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingBiz(biz)}
                      title="Edit website details"
                      className="p-2 text-[#605f5b] hover:text-[#141413] hover:bg-black/5 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRunAudit(biz)}
                      disabled={isAuditingId === biz.id}
                      title="Run fresh SEO audit"
                      className="p-2 text-[#605f5b] hover:text-[#cc785c] hover:bg-black/5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isAuditingId === biz.id ? 'animate-spin text-[#cc785c]' : ''}`} />
                    </button>
                    {businesses.length > 1 && (
                      <button
                        onClick={() => setDeleteConfirmBiz(biz)}
                        title="Remove website"
                        className="p-2 text-[#605f5b] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isActive ? (
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#cc785c] text-white text-xs font-bold rounded-xl hover:bg-[#b8694f] transition-all shadow-xs"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleSwitchAndNavigate(biz.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#e6dfd8] text-[#141413] text-xs font-bold rounded-xl hover:bg-[#efe9de] transition-all shadow-xs"
                    >
                      <span>Switch to Project</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Details Modal */}
      {editingBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#141413]">Edit Website Project</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={editingBiz.name || ''}
                  onChange={(e) => setEditingBiz({ ...editingBiz, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#e6dfd8] rounded-xl text-sm text-[#141413]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#141413] mb-1">Website URL</label>
                <input
                  type="text"
                  required
                  value={editingBiz.website_url || ''}
                  onChange={(e) => setEditingBiz({ ...editingBiz, website_url: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#e6dfd8] rounded-xl text-sm text-[#141413]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">Industry</label>
                  <input
                    type="text"
                    value={editingBiz.type || ''}
                    onChange={(e) => setEditingBiz({ ...editingBiz, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#e6dfd8] rounded-xl text-sm text-[#141413]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#141413] mb-1">City</label>
                  <input
                    type="text"
                    value={editingBiz.city || ''}
                    onChange={(e) => setEditingBiz({ ...editingBiz, city: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#e6dfd8] rounded-xl text-sm text-[#141413]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingBiz(null)}
                  className="px-4 py-2 text-xs font-medium text-[#605f5b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#cc785c] text-white text-xs font-bold rounded-xl hover:bg-[#b8694f]"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#faf9f5] border border-[#e6dfd8] rounded-2xl shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#141413]">Remove Project?</h3>
              <p className="text-xs text-[#605f5b] mt-1">
                Are you sure you want to remove <strong>{deleteConfirmBiz.name || deleteConfirmBiz.website_url}</strong> from your workspace?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBiz(null)}
                className="px-4 py-2 text-xs font-medium text-[#605f5b] hover:bg-black/5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors shadow-xs"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
