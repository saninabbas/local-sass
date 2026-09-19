import React, { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
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
  Activity,
  Layers
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { runAudit } from '../../lib/api';

export const Businesses: React.FC = () => {
  const navigate = useNavigate();
  const { 
    businesses, 
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
    <DashboardLayout>
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
            <p className="text-xs text-[#6c6a64] font-sans mt-1">
              Manage all your client websites, track independent audits, and switch workspaces seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-mono font-bold text-[#6c6a64]">
                {websitesUsed} of {planLimit} Websites
              </div>
              <div className="text-[10px] font-mono text-[#8e8b82] uppercase">
                {subscriptionStatus} PLAN
              </div>
            </div>
            <button
              onClick={openAddWebsiteModal}
              disabled={isLimitReached}
              className="px-4 py-2.5 bg-[#cc785c] hover:bg-[#a9583e] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Website Project</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-red-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Active Domains Counter / Warning */}
        <div className="p-4 rounded-xl bg-[#efe9de]/60 border border-[#e6dfd8] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white border border-[#e6dfd8] text-[#cc785c]">
              <Layers size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#141413]">
                Workspace Allocation: {websitesUsed} / {planLimit} Active Domains
              </div>
              <div className="text-[11px] text-[#6c6a64] font-sans">
                Each domain maintains dedicated SEO scores, audits, keywords, competitor gap analysis, and GeoGrid matrices.
              </div>
            </div>
          </div>
          {isLimitReached && (
            <Link
              to="/pricing"
              className="px-3 py-1.5 bg-[#141413] hover:bg-[#252320] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Sparkles size={13} className="text-[#cc785c]" />
              <span>Upgrade Plan for More Domains</span>
            </Link>
          )}
        </div>

        {/* Website Cards Grid */}
        {businesses.length === 0 ? (
          <div className="text-center py-16 bg-[#efe9de]/30 rounded-2xl border border-[#e6dfd8] p-8">
            <div className="w-12 h-12 rounded-full bg-[#efe9de] text-[#cc785c] flex items-center justify-center mx-auto mb-4">
              <Globe size={24} />
            </div>
            <h3 className="text-base font-serif font-bold text-[#141413] mb-1">
              No Websites Added Yet
            </h3>
            <p className="text-xs text-[#6c6a64] max-w-sm mx-auto mb-6">
              Get started by adding your primary business website or client domain to run deep technical audits and track rankings.
            </p>
            <button
              onClick={openAddWebsiteModal}
              className="px-5 py-2.5 bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-bold rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Your First Website</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businesses.map((biz) => {
              const isActive = biz.id === activeBusinessId;
              const isAuditing = isAuditingId === biz.id;

              return (
                <div
                  key={biz.id}
                  className={`bg-[#faf9f5] border rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between gap-6 relative shadow-xs hover:shadow-md ${
                    isActive 
                      ? 'border-[#cc785c] ring-1 ring-[#cc785c]/30 bg-white' 
                      : 'border-[#e6dfd8] hover:border-[#cc785c]/50'
                  }`}
                >
                  {/* Top Badge Strip */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl border ${
                        isActive ? 'bg-[#cc785c]/10 border-[#cc785c]/30 text-[#cc785c]' : 'bg-[#efe9de] border-[#e6dfd8] text-[#6c6a64]'
                      }`}>
                        <Globe size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-serif font-bold text-[#141413] line-clamp-1">
                            {biz.name || biz.website_url || 'Untitled Project'}
                          </h3>
                          {isActive && (
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200 shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <a
                          href={biz.website_url.startsWith('http') ? biz.website_url : `https://${biz.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-[#6c6a64] hover:text-[#cc785c] flex items-center gap-1 mt-0.5 line-clamp-1"
                        >
                          <span>{biz.website_url}</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingBiz(biz)}
                        title="Edit Website Details"
                        className="p-2 text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de] rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmBiz(biz)}
                        title="Delete Website"
                        className="p-2 text-[#6c6a64] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#efe9de]/40 rounded-xl border border-[#e6dfd8]/80 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#8e8b82] block mb-0.5">Industry / Type</span>
                      <span className="font-semibold text-[#141413] capitalize">{biz.type || 'Local Business'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#8e8b82] block mb-0.5">Location</span>
                      <span className="font-semibold text-[#141413]">{biz.city || 'Not specified'}{biz.country ? `, ${biz.country}` : ''}</span>
                    </div>
                  </div>

                  {/* Telemetry Preview */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#e6dfd8]/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-[#cc785c]" />
                      <span className="text-[11px] font-mono text-[#6c6a64]">
                        {biz.score !== undefined && biz.score !== null ? (
                          <>Score: <strong className="text-[#141413] font-bold">{biz.score}/100</strong></>
                        ) : (
                          'No audit score yet'
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#8e8b82]">
                      {biz.last_crawled_at ? `Audited ${new Date(biz.last_crawled_at).toLocaleDateString()}` : 'Never Audited'}
                    </span>
                  </div>

                  {/* Card Bottom CTA Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handleSwitchAndNavigate(biz.id)}
                      disabled={isActive}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-[#141413] hover:bg-[#252320] text-white shadow-xs'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Active Workspace</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight size={14} />
                          <span>Switch to Workspace</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleRunAudit(biz)}
                      disabled={isAuditing}
                      className="py-2 px-3 bg-white hover:bg-gray-50 text-[#141413] border border-[#e6dfd8] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <RefreshCw size={13} className={isAuditing ? 'animate-spin text-[#cc785c]' : 'text-[#6c6a64]'} />
                      <span>{isAuditing ? 'Auditing...' : 'Run New Audit'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Modal */}
        {editingBiz && (
          <div className="fixed inset-0 bg-[#181715]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#e6dfd8] rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#e6dfd8]">
                <h3 className="text-lg font-serif font-bold text-[#141413]">
                  Edit Project Details
                </h3>
                <button
                  onClick={() => setEditingBiz(null)}
                  className="text-[#6c6a64] hover:text-[#141413] p-1 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6c6a64] uppercase mb-1">
                    Business / Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBiz.name || ''}
                    onChange={(e) => setEditingBiz({ ...editingBiz, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:bg-white text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#6c6a64] uppercase mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBiz.website_url || ''}
                    onChange={(e) => setEditingBiz({ ...editingBiz, website_url: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:bg-white text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#6c6a64] uppercase mb-1">
                      Business Type / Industry
                    </label>
                    <input
                      type="text"
                      value={editingBiz.type || ''}
                      onChange={(e) => setEditingBiz({ ...editingBiz, type: e.target.value })}
                      placeholder="e.g. Dental Clinic"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:bg-white text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#6c6a64] uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editingBiz.city || ''}
                      onChange={(e) => setEditingBiz({ ...editingBiz, city: e.target.value })}
                      placeholder="e.g. Austin"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:bg-white text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6dfd8]">
                  <button
                    type="button"
                    onClick={() => setEditingBiz(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#141413] text-xs font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#cc785c] hover:bg-[#a9583e] text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
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
          <div className="fixed inset-0 bg-[#181715]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#e6dfd8] rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4 animate-in zoom-in-95 duration-150 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-serif font-bold text-[#141413]">
                Remove Website Project?
              </h3>
              <p className="text-xs text-[#6c6a64]">
                Are you sure you want to remove <strong>{deleteConfirmBiz.name || deleteConfirmBiz.website_url}</strong>? All associated audit scores, keyword tracking, and gap data will be deleted.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmBiz(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#141413] text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
