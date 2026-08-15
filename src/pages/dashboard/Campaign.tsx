import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useBusiness } from '../../context/BusinessContext';
import { fetchApi } from '../../lib/api';
import { 
  Flag, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  Layers, 
  ShieldCheck, 
  Check, 
  X, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FixWithAIModal } from '../../components/modals/FixWithAIModal';
import { ExecutionStatusBadge } from '../../components/dashboard/ExecutionStatusBadge';

export const Campaign: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [reAuditing, setReAuditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [fixTaskModal, setFixTaskModal] = useState<any | null>(null);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const bizId = activeBusiness?.id;
      const res = await fetchApi(`/api/campaigns${bizId ? `?business_id=${bizId}` : ''}`);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error("Failed to load campaign:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
  }, [activeBusiness?.id]);

  useEffect(() => {
    const handleBizSwitch = () => loadCampaign();
    window.addEventListener('rankora:business_switched', handleBizSwitch);
    return () => window.removeEventListener('rankora:business_switched', handleBizSwitch);
  }, []);

  const handleExecuteTask = async (task: any) => {
    try {
      setExecutingTaskId(task.id);
      const res = await fetchApi('/api/campaigns/tasks/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, appliedContent: task.expected_value })
      });

      if (res.success) {
        setFeedback({ type: 'success', message: `Task "${task.title}" approved and prepared for verification!` });
        setTimeout(() => setFeedback(null), 4000);
        await loadCampaign();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to execute task' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Execution failed' });
    } finally {
      setExecutingTaskId(null);
    }
  };

  const handleVerifyTask = async (task: any) => {
    try {
      setVerifyingTaskId(task.id);
      const res = await fetchApi('/api/campaigns/tasks/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id })
      });

      if (res.success && res.verification) {
        const isVer = res.verification.verified;
        setFeedback({ 
          type: isVer ? 'success' : 'error', 
          message: res.verification.message 
        });
        setTimeout(() => setFeedback(null), 5000);
        await loadCampaign();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Verification failed' });
    } finally {
      setVerifyingTaskId(null);
    }
  };

  const handleReAudit = async () => {
    try {
      setReAuditing(true);
      const bizId = activeBusiness?.id;
      const res = await fetchApi(`/api/seo/re-audit${bizId ? `?business_id=${bizId}` : ''}`, { method: 'POST' });
      if (res.success) {
        setFeedback({ type: 'success', message: 'Full website re-crawl completed! Roadmap updated.' });
        setTimeout(() => setFeedback(null), 4000);
        await loadCampaign();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Re-audit failed' });
    } finally {
      setReAuditing(false);
    }
  };

  const campaign = data?.campaign;
  const tasks = data?.tasks || [];
  const business = data?.business || activeBusiness;

  const todayTasks = tasks.filter((t: any) => t.priority === 'HIGH' || t.status === 'PENDING').slice(0, 3);
  const weekTasks = tasks.filter((t: any) => t.priority === 'HIGH' || t.priority === 'MEDIUM').slice(0, 6);
  const monthTasks = tasks;

  const displayedTasks = activeTab === 'TODAY' ? todayTasks : activeTab === 'WEEK' ? weekTasks : monthTasks;

  const completedCount = tasks.filter((t: any) => t.status === 'VERIFIED' || t.status === 'EXECUTED').length;
  const totalTasksCount = tasks.length || 1;
  const progressPercentage = Math.round((completedCount / totalTasksCount) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6dfd8]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#cc785c]/10 text-[#cc785c] text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Flag size={12} />
                Central Execution Layer
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
              SEO Campaign Engine
            </h1>
            <p className="text-xs text-[#6c6a64] font-sans mt-1">
              Project: <strong className="text-[#141413]">{business?.name || 'My Website'}</strong> &bull; {business?.website_url}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleReAudit}
              disabled={reAuditing}
              className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw size={13} className={reAuditing ? "animate-spin text-[#cc785c]" : "text-[#8e8b82]"} />
              <span>{reAuditing ? 'Re-Auditing Project...' : 'Run Full Re-Audit'}</span>
            </Button>
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

        {/* Campaign Executive Banner */}
        <div className="bg-[#181715] text-[#faf9f5] rounded-2xl p-6 sm:p-8 border border-[#252320] shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#252320]">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#a09d96] tracking-wider block mb-1">
                Active Goal & Roadmap
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#faf9f5]">
                {campaign?.name || 'Local 3-Pack Rank Elevation'}
              </h2>
              <p className="text-xs text-[#8e8b82] font-mono mt-1">
                Goal: {campaign?.goal || 'Local 3-Pack Rank Elevation'} &bull; Started: {campaign?.started_at ? new Date(campaign.started_at).toLocaleDateString() : 'Active'}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#252320] p-4 rounded-xl border border-[#3a3732]">
              <div>
                <div className="text-[10px] font-mono uppercase text-[#a09d96]">Campaign Progress</div>
                <div className="text-2xl font-serif font-bold text-[#faf9f5] mt-0.5">{progressPercentage}%</div>
              </div>
              <div className="w-24 bg-[#181715] h-2 rounded-full overflow-hidden border border-[#3a3732]">
                <div className="bg-[#cc785c] h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-[#252320]/60 p-3.5 rounded-xl border border-[#3a3732]">
              <span className="text-[10px] text-[#a09d96] uppercase block mb-1">Total Priority Tasks</span>
              <span className="text-lg font-bold text-[#faf9f5]">{tasks.length}</span>
            </div>
            <div className="bg-[#252320]/60 p-3.5 rounded-xl border border-[#3a3732]">
              <span className="text-[10px] text-[#a09d96] uppercase block mb-1">Verified Fixes</span>
              <span className="text-lg font-bold text-emerald-400">{tasks.filter((t: any) => t.status === 'VERIFIED').length}</span>
            </div>
            <div className="bg-[#252320]/60 p-3.5 rounded-xl border border-[#3a3732]">
              <span className="text-[10px] text-[#a09d96] uppercase block mb-1">Awaiting Approval</span>
              <span className="text-lg font-bold text-[#e8a55a]">{tasks.filter((t: any) => t.status === 'WAITING_APPROVAL' || t.status === 'EXECUTED').length}</span>
            </div>
            <div className="bg-[#252320]/60 p-3.5 rounded-xl border border-[#3a3732]">
              <span className="text-[10px] text-[#a09d96] uppercase block mb-1">Telemetry Status</span>
              <span className="text-xs font-bold text-emerald-400">100% VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Priority Tabs (Today, This Week, This Month) */}
        <div className="flex items-center justify-between border-b border-[#e6dfd8] pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('TODAY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'TODAY' ? 'bg-[#141413] text-white shadow-xs' : 'text-[#6c6a64] hover:bg-[#efe9de]'
              }`}
            >
              Today's Priorities ({todayTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('WEEK')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'WEEK' ? 'bg-[#141413] text-white shadow-xs' : 'text-[#6c6a64] hover:bg-[#efe9de]'
              }`}
            >
              This Week ({weekTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('MONTH')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'MONTH' ? 'bg-[#141413] text-white shadow-xs' : 'text-[#6c6a64] hover:bg-[#efe9de]'
              }`}
            >
              This Month ({monthTasks.length})
            </button>
          </div>

          <div className="text-xs font-mono text-[#8e8b82]">
            Priority Formula: <span className="text-[#141413] font-bold">Impact &times; Confidence &times; Inverse Effort</span>
          </div>
        </div>

        {/* Priority Tasks List */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#6c6a64]">
            <RefreshCw size={24} className="animate-spin text-[#cc785c] mx-auto mb-2" />
            <span>Loading campaign execution queue...</span>
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="text-center py-16 bg-[#efe9de]/30 rounded-2xl border border-[#e6dfd8] p-8">
            <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-[#141413]">All Campaign Tasks Complete!</h3>
            <p className="text-xs text-[#6c6a64] mt-1 max-w-sm mx-auto">
              You have resolved all priority actions for this timeframe. Run a full re-audit to detect new optimization opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedTasks.map((task: any) => {
              const isExec = executingTaskId === task.id;
              const isVer = verifyingTaskId === task.id;
              const isVerified = task.status === 'VERIFIED';
              const isWaiting = task.status === 'WAITING_APPROVAL' || task.status === 'EXECUTED';
              const isFailed = task.status === 'FAILED';

              return (
                <div
                  key={task.id}
                  className={`bg-[#faf9f5] border rounded-2xl p-6 transition-all shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6 ${
                    isVerified ? 'border-emerald-300 bg-emerald-50/20' :
                    isWaiting ? 'border-amber-300 bg-amber-50/20' :
                    isFailed ? 'border-red-300 bg-red-50/20' :
                    'border-[#e6dfd8] hover:border-[#cc785c]/40'
                  }`}
                >
                  <div className="space-y-3 max-w-3xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        task.priority === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' :
                        task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {task.priority || 'MEDIUM'} PRIORITY
                      </span>

                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md ${
                        isVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        isWaiting ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        isFailed ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        STATUS: {task.status || 'PENDING'}
                      </span>

                      <span className="text-[10px] font-mono text-[#8e8b82] uppercase">
                        Source: {task.source || 'Audit Telemetry'}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-[#141413]">
                      {task.title}
                    </h3>

                    <p className="text-xs text-[#6c6a64] font-sans">
                      {task.description}
                    </p>

                    {/* Evidence Drawer */}
                    <div className="p-3 bg-[#efe9de]/50 rounded-xl border border-[#e6dfd8] text-xs font-mono space-y-1">
                      <div className="text-[10px] text-[#8e8b82] uppercase font-bold">Telemetry Evidence:</div>
                      <div className="text-[#141413]">{task.evidence}</div>
                      {task.expected_value && (
                        <div className="text-emerald-700 text-[11px] mt-1">
                          Target Output: <strong>{task.expected_value}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Execution Buttons */}
                  <div className="flex flex-col gap-2 shrink-0 md:items-end">
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="px-3.5 py-1.5 text-xs font-bold text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de] rounded-lg transition-colors cursor-pointer text-left md:text-right"
                    >
                      [View Evidence Details]
                    </button>

                    {!isVerified && (
                      <Button
                        size="sm"
                        onClick={() => setFixTaskModal(task)}
                        className="bg-[#141413] hover:bg-[#252320] text-[#faf9f5] flex items-center gap-2 text-xs font-bold cursor-pointer"
                      >
                        <Sparkles size={13} className="text-[#cc785c]" />
                        <span>Fix with AI</span>
                      </Button>
                    )}

                    {isWaiting && (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyTask(task)}
                        disabled={isVer}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 text-xs font-bold cursor-pointer"
                      >
                        <ShieldCheck size={14} />
                        <span>{isVer ? 'Verifying Re-Crawl...' : 'Verify Change'}</span>
                      </Button>
                    )}

                    {isVerified && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-100/60 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 size={15} />
                        <span>Verified in Live DOM</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fix with AI Modal */}
        {fixTaskModal && (
          <FixWithAIModal
            isOpen={!!fixTaskModal}
            onClose={() => setFixTaskModal(null)}
            fixType={fixTaskModal.type || 'SEO_TITLE'}
            title={fixTaskModal.title}
            taskId={fixTaskModal.id}
            context={{
              businessName: business?.name,
              websiteUrl: fixTaskModal.target_url || business?.website_url,
              city: business?.city,
              category: business?.type,
              targetKeyword: fixTaskModal.target_keyword,
              issueEvidence: fixTaskModal.evidence,
              currentValue: fixTaskModal.before_value,
              expectedValue: fixTaskModal.expected_value
            }}
            onSuccess={() => {
              loadCampaign();
              setFixTaskModal(null);
            }}
          />
        )}

        {/* Evidence Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#faf9f5] border border-[#e6dfd8] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#e6dfd8] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8e8b82]">Task Evidence Inspector</span>
                  <h3 className="font-serif font-bold text-lg text-[#141413]">{selectedTask.title}</h3>
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-[#8e8b82] hover:text-[#141413] cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <span className="font-bold text-[#141413] block mb-1">Target Page:</span>
                  <a href={selectedTask.target_url} target="_blank" rel="noreferrer" className="text-[#cc785c] font-mono hover:underline flex items-center gap-1">
                    {selectedTask.target_url} <ExternalLink size={11} />
                  </a>
                </div>

                <div className="p-3 bg-[#efe9de] rounded-xl border border-[#e6dfd8] font-mono space-y-1">
                  <span className="font-bold text-[#141413] block">Observed Evidence:</span>
                  <p className="text-[#6c6a64]">{selectedTask.evidence}</p>
                </div>

                {selectedTask.before_value && (
                  <div>
                    <span className="font-bold text-red-700 block mb-1">Before Data:</span>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl font-mono text-red-900">{selectedTask.before_value}</div>
                  </div>
                )}

                {selectedTask.expected_value && (
                  <div>
                    <span className="font-bold text-emerald-700 block mb-1">Expected After Fix:</span>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl font-mono text-emerald-900">{selectedTask.expected_value}</div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#e6dfd8] flex justify-end">
                <Button size="sm" onClick={() => setSelectedTask(null)} className="bg-[#141413] text-white text-xs">
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
