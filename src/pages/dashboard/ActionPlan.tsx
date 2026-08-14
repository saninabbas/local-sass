import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ActionPlanCard } from '../../components/dashboard/ActionPlanCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { getRecommendations, updateRecommendationStatus } from '../../lib/api';
import type { Recommendation } from '../../types';

export function ActionPlan() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<'todo' | 'completed'>('todo');
  const [selectedGoal, setSelectedGoal] = useState<string>('All');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecommendations();
      setRecommendations(data || []);
    } catch (err) {
      console.error("Failed to load recommendations", err);
      setError(err instanceof Error ? err : new Error('Failed to load action plan'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await updateRecommendationStatus(id, 'completed');
      setRecommendations(prev => 
        prev.map(rec => rec.id === id ? { ...rec, status: 'completed' } : rec)
      );
    } catch (err) {
      alert("Failed to update status. Please try again.");
      throw err;
    }
  };

  const todoItems = recommendations.filter(r => r.status !== 'completed');
  const completedItems = recommendations.filter(r => r.status === 'completed');

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading your action plan..." />
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

  return (
    <DashboardLayout>
      <div className="mb-6 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413]">AI Action Plan</h1>
          <p className="text-xs text-[#6c6a64] font-sans mt-1">Manage and track your personalized growth recommendations.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="goal-selector" className="text-xs font-medium text-[#6c6a64]">Goal:</label>
          <select 
            id="goal-selector"
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="border border-[#e6dfd8] bg-[#faf9f5] rounded-lg px-3 py-1.5 text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#cc785c]"
          >
            <option value="All">All Goals</option>
            <option value="More Calls">More Calls</option>
            <option value="More Leads">More Leads</option>
            <option value="More Reviews">More Reviews</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e6dfd8] mb-6">
        <button
          onClick={() => setActiveTab('todo')}
          className={`px-5 py-2.5 font-sans font-medium text-xs transition-colors border-b-2 ${
            activeTab === 'todo' 
              ? 'border-[#cc785c] text-[#cc785c] font-semibold' 
              : 'border-transparent text-[#6c6a64] hover:text-[#141413]'
          }`}
        >
          To Do ({todoItems.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-5 py-2.5 font-sans font-medium text-xs transition-colors border-b-2 ${
            activeTab === 'completed' 
              ? 'border-[#5db872] text-[#2b753e] font-semibold' 
              : 'border-transparent text-[#6c6a64] hover:text-[#141413]'
          }`}
        >
          Completed ({completedItems.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'todo' && (
            todoItems.length > 0 ? (
              todoItems.map(rec => (
                <ActionPlanCard
                  key={rec.id}
                  id={rec.id}
                  title={rec.title}
                  description={rec.description}
                  priority={rec.priority}
                  priorityColor={rec.priorityColor}
                  impact={rec.impact}
                  estimatedTime={rec.estimatedTime}
                  difficulty={(rec as any).difficulty}
                  seoImpact={(rec as any).seo_impact || (rec as any).seoImpact}
                  localImpact={(rec as any).local_impact || (rec as any).localImpact}
                  conversionImpact={(rec as any).conversion_impact || (rec as any).conversionImpact}
                  businessOutcome={(rec as any).business_outcome || (rec as any).businessOutcome}
                  status={rec.status}
                  onComplete={handleComplete}
                />
              ))
            ) : (
              <div className="bg-[#efe9de] rounded-xl p-10 text-center border border-[#e6dfd8]">
                <div className="w-12 h-12 bg-[#faf9f5] border border-[#e6dfd8] rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <span className="text-xl">🎉</span>
                </div>
                <h3 className="text-lg font-serif font-normal text-[#141413] mb-1.5">You're all caught up!</h3>
                <p className="text-xs text-[#6c6a64] max-w-sm mx-auto font-sans">
                  You have completed all pending actions. Run a new audit from your dashboard to find new growth opportunities.
                </p>
              </div>
            )
          )}

          {activeTab === 'completed' && (
            completedItems.length > 0 ? (
              completedItems.map(rec => (
                <ActionPlanCard
                  key={rec.id}
                  id={rec.id}
                  title={rec.title}
                  description={rec.description}
                  priority={rec.priority}
                  priorityColor={rec.priorityColor}
                  impact={rec.impact}
                  estimatedTime={rec.estimatedTime}
                  difficulty={(rec as any).difficulty}
                  seoImpact={(rec as any).seo_impact || (rec as any).seoImpact}
                  localImpact={(rec as any).local_impact || (rec as any).localImpact}
                  conversionImpact={(rec as any).conversion_impact || (rec as any).conversionImpact}
                  businessOutcome={(rec as any).business_outcome || (rec as any).businessOutcome}
                  status={rec.status}
                />
              ))
            ) : (
              <div className="bg-[#efe9de] rounded-xl p-10 text-center border border-[#e6dfd8]">
                <h3 className="text-base font-serif font-normal text-[#141413] mb-1.5">No completed actions yet</h3>
                <p className="text-xs text-[#6c6a64] max-w-sm mx-auto font-sans">
                  Mark tasks as complete from the "To Do" tab once you finish implementing them on your business.
                </p>
              </div>
            )
          )}
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-1 hidden lg:block space-y-4">
          <div className="bg-[#efe9de] rounded-xl p-5 border border-[#e6dfd8] shadow-xs">
            <h4 className="font-serif font-medium text-sm text-[#141413] mb-3">AI Progress Tracker</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-[#6c6a64]">Completion Rate</span>
                  <span className="font-bold text-[#141413]">
                    {recommendations.length > 0 
                      ? Math.round((completedItems.length / recommendations.length) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-[#faf9f5] border border-[#e6dfd8] rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#cc785c] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${recommendations.length > 0 ? (completedItems.length / recommendations.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-[#6c6a64] font-sans leading-relaxed pt-1">
                Completing actions directly improves your Growth Score on the next audit. Focus on High Priority items for the fastest results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
