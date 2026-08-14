import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchGrowthRoadmap, updateRecommendationStatus } from '../../lib/api';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  TrendingUp, 
  Sparkles, 
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Eye,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import type { ActionPlanTask } from '../../types';

export function ActionPlan() {
  const [roadmap, setRoadmap] = useState<{ today: ActionPlanTask[], this_week: ActionPlanTask[], this_month: ActionPlanTask[], next_90_days: ActionPlanTask[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<'all' | 'today' | 'this_week' | 'this_month'>('all');
  const [selectedEvidenceTask, setSelectedEvidenceTask] = useState<ActionPlanTask | null>(null);

  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rmap = await fetchGrowthRoadmap();
      setRoadmap(rmap);
    } catch (err) {
      console.error("Failed to load growth roadmap", err);
      setError(err instanceof Error ? err : new Error('Failed to load action plan'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleComplete = async (task: ActionPlanTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    // Optimistic update
    setRoadmap(prev => {
      if (!prev) return prev;
      const updateList = (list: ActionPlanTask[]) => 
        list.map(t => t.id === task.id ? { ...t, status: newStatus as any } : t);

      return {
        today: updateList(prev.today || []),
        this_week: updateList(prev.this_week || []),
        this_month: updateList(prev.this_month || []),
        next_90_days: updateList(prev.next_90_days || [])
      };
    });

    try {
      await updateRecommendationStatus(task.id, newStatus as any).catch(() => {});
    } catch (e) {
      console.warn("Status update note:", e);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading your 30-day AI Growth Execution Roadmap..." />
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

  const todayTasks = roadmap?.today || [];
  const weekTasks = roadmap?.this_week || [];
  const monthTasks = roadmap?.this_month || [];

  const totalTasks = todayTasks.length + weekTasks.length + monthTasks.length;
  const completedCount = [...todayTasks, ...weekTasks, ...monthTasks].filter(t => t.status === 'completed').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const renderTaskCard = (task: ActionPlanTask) => {
    const isDone = task.status === 'completed';

    return (
      <div 
        key={task.id}
        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
          isDone 
            ? 'bg-gray-50/50 border-gray-200 opacity-75' 
            : 'bg-white border-gray-200 hover:border-blue-200 shadow-xs'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                task.priority?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-700' :
                task.priority?.toLowerCase() === 'high' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {task.priority} Priority
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Impact: {task.impact || 'High'}
              </span>
              <span className="text-[11px] font-medium text-secondary">
                Difficulty: {task.difficulty || 'Easy'}
              </span>
            </div>

            <button
              onClick={() => handleToggleComplete(task)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDone 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-gray-100 hover:bg-gray-200 text-secondary'
              }`}
            >
              <CheckCircle2 size={13} className={isDone ? 'text-emerald-600' : 'text-gray-400'} />
              <span>{isDone ? 'Completed' : 'Mark Complete'}</span>
            </button>
          </div>

          <div>
            <h3 className={`text-sm font-bold text-primary ${isDone ? 'line-through text-gray-500' : ''}`}>
              {task.title || task.problem}
            </h3>
            <p className="text-xs text-secondary mt-1 leading-relaxed">
              {task.description}
            </p>
          </div>

          {task.expected_outcome && (
            <div className="p-2.5 bg-blue-50/40 rounded-xl border border-blue-100 text-xs">
              <span className="font-bold text-primary">Expected Outcome: </span>
              <span className="text-secondary">{task.expected_outcome}</span>
            </div>
          )}
        </div>

        {/* Task Actions Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
          <button
            onClick={() => setSelectedEvidenceTask(task)}
            className="text-secondary hover:text-primary font-medium flex items-center gap-1 cursor-pointer"
          >
            <Eye size={12} />
            <span>View Evidence</span>
          </button>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/copilot"
              className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-secondary hover:text-primary font-semibold border border-gray-200 flex items-center gap-1 transition-colors"
            >
              <Sparkles size={11} className="text-primary-accent" />
              <span>Ask AI</span>
            </Link>
            <Link
              to="/dashboard/website"
              className="px-3 py-1 rounded-lg bg-primary-accent hover:bg-blue-700 text-white font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Execute</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <ListTodo className="text-primary-accent" size={26} />
            30-Day AI Growth Execution Roadmap
          </h1>
          <p className="text-xs text-secondary mt-1">
            Data-driven action plan structured into Today, This Week, and This Month milestones.
          </p>
        </div>

        {/* Progress Pill */}
        <div className="px-4 py-2 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs gap-4">
              <span className="font-semibold text-secondary">Roadmap Completion:</span>
              <span className="font-bold text-primary">{completionPercentage}%</span>
            </div>
            <div className="w-36 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-secondary">
            {completedCount}/{totalTasks}
          </span>
        </div>
      </div>

      {/* Timeframe Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `Full Roadmap (${totalTasks})` },
          { id: 'today', label: `Today's Priorities (${todayTasks.length})` },
          { id: 'this_week', label: `This Week (${weekTasks.length})` },
          { id: 'this_month', label: `This Month (${monthTasks.length})` }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTimeframe(t.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTimeframe === t.id
                ? 'bg-primary-accent text-white shadow-xs'
                : 'bg-white text-secondary hover:text-primary border border-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-8 mb-8">
        
        {/* TODAY (3 highest-impact) */}
        {(activeTimeframe === 'all' || activeTimeframe === 'today') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                TODAY — Top 3 Highest-Impact Urgent Actions
              </h2>
              <span className="text-xs text-secondary font-medium">Immediate Ranking Boost</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {todayTasks.map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* THIS WEEK (5 actions) */}
        {(activeTimeframe === 'all' || activeTimeframe === 'this_week') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                THIS WEEK — 5 High-Leverage Strategic Tasks
              </h2>
              <span className="text-xs text-secondary font-medium">Local Footprint Expansion</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weekTasks.map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* THIS MONTH (10+ actions) */}
        {(activeTimeframe === 'all' || activeTimeframe === 'this_month') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-base font-bold text-primary flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                THIS MONTH — Strategic Authority & Content Growth
              </h2>
              <span className="text-xs text-secondary font-medium">Market Dominance</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {monthTasks.map(renderTaskCard)}
            </div>
          </div>
        )}

      </div>

      {/* EVIDENCE DRAWER / MODAL */}
      {selectedEvidenceTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-primary">Diagnostic Evidence Breakdown</h3>
              <button
                onClick={() => setSelectedEvidenceTask(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <span className="font-bold text-primary block">Task:</span>
              <p className="text-secondary">{selectedEvidenceTask.title || selectedEvidenceTask.problem}</p>
              
              <span className="font-bold text-primary block pt-2">Underlying Audit Evidence:</span>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-[11px] text-primary">
                {selectedEvidenceTask.evidence}
              </div>

              <span className="font-bold text-primary block pt-2">Why This Affects Local Rank:</span>
              <p className="text-secondary leading-relaxed">
                Google's ranking algorithms evaluate this vector against top competitors in your city. Fixing this closes the gap with local competitors.
              </p>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedEvidenceTask(null)}
              >
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
