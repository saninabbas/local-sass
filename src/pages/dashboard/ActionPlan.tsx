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
      throw err; // re-throw to be caught by ActionPlanCard
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
      <div className="mb-8 mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">AI Action Plan</h1>
          <p className="text-secondary">Manage and track your personalized growth recommendations.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="goal-selector" className="text-sm font-semibold text-gray-700">Goal:</label>
          <select 
            id="goal-selector"
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Goals</option>
            <option value="More Calls">More Calls</option>
            <option value="More Leads">More Leads</option>
            <option value="More Reviews">More Reviews</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('todo')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'todo' 
              ? 'border-primary-accent text-primary-accent' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          To Do ({todoItems.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'completed' 
              ? 'border-green-500 text-green-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Completed ({completedItems.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
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
              <div className="bg-gray-50 rounded-xl p-10 text-center border border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">You're all caught up!</h3>
                <p className="text-secondary max-w-sm mx-auto">
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
              <div className="bg-gray-50 rounded-xl p-10 text-center border border-gray-200">
                <h3 className="text-xl font-bold text-primary mb-2">No completed actions yet</h3>
                <p className="text-secondary max-w-sm mx-auto">
                  Mark tasks as complete from the "To Do" tab once you finish implementing them on your business.
                </p>
              </div>
            )
          )}
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-1 hidden lg:block space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
            <h4 className="font-bold text-primary mb-3">AI Progress Tracker</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary">Completion Rate</span>
                  <span className="font-bold text-primary">
                    {recommendations.length > 0 
                      ? Math.round((completedItems.length / recommendations.length) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${recommendations.length > 0 ? (completedItems.length / recommendations.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                Completing actions directly improves your Growth Score on the next audit. Focus on High Priority items for the fastest results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
