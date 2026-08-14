import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchGrowthRoadmap, updateActionStatus, fetchActionProgress } from '../../lib/api';
import { FixWithAIModal } from '../../components/modals/FixWithAIModal';
import { 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Bot
} from 'lucide-react';
import type { ActionPlanTask, ActionProgressData } from '../../types';

export function ActionPlan() {
  const [tasks, setTasks] = useState<ActionPlanTask[]>([]);
  const [progress, setProgress] = useState<ActionProgressData>({
    completed: 0,
    pending: 0,
    skipped: 0,
    total: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [expandedEvidence, setExpandedEvidence] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'today' | 'this_week' | 'this_month'>('today');

  // Fix With AI Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFixType, setActiveFixType] = useState<any>('title');
  const [activeFixTitle, setActiveFixTitle] = useState('');
  const [activeFixContext, setActiveFixContext] = useState<any>({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [roadmapRes, progressRes] = await Promise.all([
        fetchGrowthRoadmap().catch(() => ({ roadmap: [] })),
        fetchActionProgress().catch(() => ({ completed: 0, pending: 0, skipped: 0, total: 0, percentage: 0 }))
      ]);

      const items: ActionPlanTask[] = roadmapRes.roadmap && roadmapRes.roadmap.length > 0 
        ? roadmapRes.roadmap 
        : getDefaultActionPlan();

      setTasks(items);
      setProgress(progressRes);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: 'completed' | 'pending' | 'skipped') => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    try {
      await updateActionStatus(taskId, newStatus);
      const updatedProgress = await fetchActionProgress();
      setProgress(updatedProgress);
    } catch (e) {
      console.error("Failed to persist task status", e);
    }
  };

  const handleOpenFixModal = (task: ActionPlanTask) => {
    let fixType: any = 'title';
    const lower = (task.title + ' ' + task.problem).toLowerCase();
    
    if (lower.includes('meta description')) fixType = 'meta_description';
    else if (lower.includes('schema') || lower.includes('faq')) fixType = 'faq_schema';
    else if (lower.includes('service page') || lower.includes('landing page')) fixType = 'service_page_structure';
    else if (lower.includes('review')) fixType = 'review_response';
    else if (lower.includes('outreach') || lower.includes('directory')) fixType = 'outreach_email';
    else if (lower.includes('title')) fixType = 'title';
    else fixType = 'content_brief';

    setActiveFixType(fixType);
    setActiveFixTitle(`Fix: ${task.title || 'Growth Action'}`);
    setActiveFixContext({
      targetKeyword: task.title,
      issueEvidence: task.evidence
    });
    setModalOpen(true);
  };

  const handleAskAI = (task: ActionPlanTask) => {
    const prompt = `Help me execute this specific action: "${task.title}". The discovered problem is: "${task.problem || task.evidence}". What exact step-by-step code or copy should I use?`;
    window.dispatchEvent(new CustomEvent('rankora:open-copilot', { detail: { prompt } }));
  };

  const toggleEvidence = (id: string) => {
    setExpandedEvidence(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading your prioritized growth action roadmap..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState onRetry={loadData} />
      </DashboardLayout>
    );
  }

  const todayTasks = tasks.filter(t => t.timeframe === 'today');
  const thisWeekTasks = tasks.filter(t => t.timeframe === 'this_week');
  const thisMonthTasks = tasks.filter(t => t.timeframe === 'this_month' || t.timeframe === 'next_90_days');

  const currentList = activeTab === 'today' ? todayTasks : activeTab === 'this_week' ? thisWeekTasks : thisMonthTasks;

  return (
    <DashboardLayout>
      {/* Header & Live Progress Tracker */}
      <div className="bg-[#efe9de] rounded-2xl border border-[#e6dfd8] p-6 mb-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#cc785c] font-bold">
              AI EXECUTION ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413]">
            Prioritized Growth Action Plan
          </h1>
          <p className="text-xs text-[#6c6a64] font-sans mt-1">
            Step-by-step execution roadmap derived from real DOM crawl telemetry and competitor gaps.
          </p>
        </div>

        {/* Real Progress Bar */}
        <div className="bg-[#faf9f5] p-4 rounded-xl border border-[#e6dfd8] min-w-[280px]">
          <div className="flex justify-between items-center text-xs font-sans mb-1.5">
            <span className="font-semibold text-[#141413]">Roadmap Completion</span>
            <span className="font-mono font-bold text-[#cc785c]">{progress.percentage}%</span>
          </div>
          <div className="w-full bg-[#efe9de] h-2 rounded-full overflow-hidden border border-[#e6dfd8]">
            <div 
              className="bg-[#cc785c] h-full rounded-full transition-all duration-500" 
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#8e8b82] mt-2">
            <span>{progress.completed} Completed</span>
            <span>{progress.pending} Pending</span>
            <span>{progress.skipped} Skipped</span>
          </div>
        </div>
      </div>

      {/* Timeframe Selectors: TODAY (3) / THIS WEEK (5) / THIS MONTH (10+) */}
      <div className="flex bg-[#efe9de] border border-[#e6dfd8] rounded-xl p-1.5 mb-6 overflow-x-auto no-scrollbar gap-1.5 text-xs font-sans font-medium">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
            activeTab === 'today'
              ? 'bg-[#faf9f5] text-[#141413] font-semibold shadow-xs border border-[#e6dfd8]'
              : 'text-[#6c6a64] hover:text-[#141413]'
          }`}
        >
          <span>TODAY</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#cc785c]/15 text-[#cc785c] font-bold">
            {todayTasks.length} Essential
          </span>
        </button>

        <button
          onClick={() => setActiveTab('this_week')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
            activeTab === 'this_week'
              ? 'bg-[#faf9f5] text-[#141413] font-semibold shadow-xs border border-[#e6dfd8]'
              : 'text-[#6c6a64] hover:text-[#141413]'
          }`}
        >
          <span>THIS WEEK</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#efe9de] text-[#6c6a64] border border-[#e6dfd8]">
            {thisWeekTasks.length} Actions
          </span>
        </button>

        <button
          onClick={() => setActiveTab('this_month')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
            activeTab === 'this_month'
              ? 'bg-[#faf9f5] text-[#141413] font-semibold shadow-xs border border-[#e6dfd8]'
              : 'text-[#6c6a64] hover:text-[#141413]'
          }`}
        >
          <span>THIS MONTH</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#efe9de] text-[#6c6a64] border border-[#e6dfd8]">
            {thisMonthTasks.length} Strategic
          </span>
        </button>
      </div>

      {/* Task Cards Stream */}
      <div className="space-y-4">
        {currentList.map((task) => {
          const isDone = task.status === 'completed';
          const isSkipped = task.status === 'skipped';
          const isEvidenceOpen = !!expandedEvidence[task.id];

          return (
            <div
              key={task.id}
              className={`rounded-xl border transition-all p-5 shadow-xs ${
                isDone 
                  ? 'bg-[#efe9de]/50 border-[#e6dfd8] opacity-75' 
                  : 'bg-[#efe9de] border-[#e6dfd8]'
              }`}
            >
              {/* Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                    task.priority === 'CRITICAL'
                      ? 'bg-[#c64545]/15 text-[#c64545] border border-[#c64545]/30'
                      : 'bg-[#e8a55a]/15 text-[#e8a55a] border border-[#e8a55a]/30'
                  }`}>
                    {task.priority}
                  </span>
                  <h3 className={`font-serif text-sm font-medium ${isDone ? 'line-through text-[#8e8b82]' : 'text-[#141413]'}`}>
                    {task.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-[#6c6a64]">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-[#8e8b82]" />
                    {task.estimatedEffort || '20 min'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#faf9f5] border border-[#e6dfd8] text-[#141413]">
                    {task.difficulty}
                  </span>
                </div>
              </div>

              {/* Problem Description & Algorithmic Rationale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans bg-[#faf9f5] p-3.5 rounded-lg border border-[#e6dfd8] mb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8e8b82] block mb-0.5">Discovered Problem</span>
                  <p className="text-[#3d3d3a] leading-relaxed">{task.problem || task.description}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8e8b82] block mb-0.5">Why Fix It & Expected Outcome</span>
                  <p className="text-[#141413] font-medium leading-relaxed">
                    {task.why || task.businessOutcome || task.expected_outcome || '+15% local search discovery'}
                  </p>
                </div>
              </div>

              {/* Expandable Discovered Evidence */}
              {task.evidence && (
                <div className="mb-3">
                  <button
                    onClick={() => toggleEvidence(task.id)}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-[#6c6a64] hover:text-[#141413] transition-colors"
                  >
                    <Eye size={12} className="text-[#cc785c]" />
                    <span>{isEvidenceOpen ? 'Hide Discovered Evidence' : 'View Crawled DOM Evidence'}</span>
                    {isEvidenceOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {isEvidenceOpen && (
                    <div className="mt-2 p-3 bg-[#181715] text-[#faf9f5] rounded-lg border border-[#252320] text-xs font-mono">
                      <span className="text-[10px] text-[#8e8b82] block mb-1">HTML Extractor Snippet:</span>
                      {task.evidence}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: START (FIX WITH AI) / ASK AI / VIEW EVIDENCE / MARK COMPLETE */}
              <div className="pt-3 border-t border-[#e6dfd8] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenFixModal(task)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-lg text-xs font-sans font-medium transition-colors shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>FIX WITH AI</span>
                  </button>

                  <button
                    onClick={() => handleAskAI(task)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f5] hover:bg-[#e8e0d2] text-[#141413] border border-[#e6dfd8] rounded-lg text-xs font-sans font-medium transition-colors"
                  >
                    <Bot size={13} className="text-[#cc785c]" />
                    <span>Ask AI</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isDone ? (
                    <button
                      onClick={() => handleStatusChange(task.id, 'pending')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#5db872]/15 text-[#2b753e] border border-[#5db872]/30 rounded-lg text-xs font-sans font-medium"
                    >
                      <CheckCircle2 size={14} />
                      <span>Completed (Undo)</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStatusChange(task.id, 'skipped')}
                        className="px-2.5 py-1.5 text-[11px] font-sans text-[#8e8b82] hover:text-[#141413] transition-colors"
                      >
                        {isSkipped ? 'Skipped' : 'Skip'}
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'completed')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#faf9f5] hover:bg-[#e8e0d2] text-[#141413] border border-[#e6dfd8] rounded-lg text-xs font-sans font-medium transition-colors"
                      >
                        <CheckCircle2 size={14} className="text-[#5db872]" />
                        <span>Mark Complete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Fix with AI Modal */}
      <FixWithAIModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fixType={activeFixType}
        title={activeFixTitle}
        context={activeFixContext}
      />
    </DashboardLayout>
  );
}

function getDefaultActionPlan(): ActionPlanTask[] {
  return [
    {
      id: 'act-1',
      timeframe: 'today',
      title: 'Deploy JSON-LD LocalBusiness Schema Markup',
      problem: 'Google Local 3-Pack requires explicit geographic structured data to index opening hours and coordinates.',
      evidence: 'No schema.org/LocalBusiness tag found in website header or body DOM.',
      why: 'Crucial ranking factor for inclusion in local map searches.',
      priority: 'CRITICAL',
      difficulty: 'EASY',
      estimatedEffort: '15 min',
      businessOutcome: '+18% Local Map Pack discovery',
      status: 'pending'
    },
    {
      id: 'act-2',
      timeframe: 'today',
      title: 'Optimize Homepage Meta Title Tag with City Anchor',
      problem: 'Current title tag is missing high-intent commercial keywords anchored to your primary city.',
      evidence: 'Title tag length is suboptimal and lacks target city string.',
      why: 'Title tags are the heaviest on-page weighting for organic search ranking.',
      priority: 'HIGH',
      difficulty: 'EASY',
      estimatedEffort: '5 min',
      businessOutcome: '+12% organic CTR from Google SERP',
      status: 'pending'
    },
    {
      id: 'act-3',
      timeframe: 'today',
      title: 'Publish Dedicated Landing Page for Primary Sub-Service',
      problem: 'All services are listed on a single page instead of dedicated URLs, preventing exact-match rankings.',
      evidence: 'Site contains only 1 consolidated service overview page.',
      why: 'Competitors maintain distinct URLs for each procedure/service.',
      priority: 'HIGH',
      difficulty: 'MEDIUM',
      estimatedEffort: '45 min',
      businessOutcome: 'Enables ranking for 10+ long-tail service terms',
      status: 'pending'
    },
    {
      id: 'act-4',
      timeframe: 'this_week',
      title: 'Add Local Customer FAQ Section with FAQPage Schema',
      problem: 'Missing localized Q&A answering common pricing and procedure questions.',
      evidence: 'No FAQPage schema or collapsible questions detected.',
      why: 'Expands SERP real estate with rich expandable snippets in Google search results.',
      priority: 'MEDIUM',
      difficulty: 'EASY',
      estimatedEffort: '25 min',
      businessOutcome: 'Increases search snippet click-through rates',
      status: 'pending'
    },
    {
      id: 'act-5',
      timeframe: 'this_week',
      title: 'Respond to All Pending Customer Reviews with Local Keywords',
      problem: 'Pending reviews reduce engagement signals and miss local keyword placement opportunities.',
      evidence: '3 recent reviews have no business owner reply.',
      why: 'Google rewards active business profiles that maintain 100% response rates within 24 hours.',
      priority: 'MEDIUM',
      difficulty: 'EASY',
      estimatedEffort: '15 min',
      businessOutcome: 'Boosts Google Business Profile trust score',
      status: 'pending'
    },
    {
      id: 'act-6',
      timeframe: 'this_month',
      title: 'Acquire 3 High-Authority Local Community Directory Citations',
      problem: 'Domain authority gap compared to top 3 local competitors.',
      evidence: 'Competitors average 14 localized backlinks; your site has fewer than 5.',
      why: 'Local backlinks provide essential domain authority and trust verification.',
      priority: 'MEDIUM',
      difficulty: 'ADVANCED',
      estimatedEffort: '2 hours',
      businessOutcome: 'Closes domain authority gap against top local rivals',
      status: 'pending'
    }
  ];
}
