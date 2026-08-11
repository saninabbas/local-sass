import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { BusinessHeader } from '../../components/dashboard/BusinessHeader';
import { GrowthScoreCard } from '../../components/dashboard/GrowthScoreCard';
import { ScoreMetric } from '../../components/dashboard/ScoreMetric';
import { ActionPlanCard } from '../../components/dashboard/ActionPlanCard';
import { ProgressCard } from '../../components/dashboard/ProgressCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { getDashboard } from '../../lib/api';
import type { DashboardData } from '../../types';

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);

  const auditMessages = [
    "Analyzing your website...",
    "Checking SEO...",
    "Checking local visibility...",
    "Finding opportunities...",
    "Building your growth plan..."
  ];

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dashboardData = await getDashboard();
      setData(dashboardData);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError(err instanceof Error ? err : new Error('Failed to load dashboard'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditStep(0);
    
    const interval = setInterval(() => {
      setAuditStep(prev => Math.min(prev + 1, auditMessages.length - 1));
    }, 2000);

    try {
      const { runAudit } = await import('../../lib/api');
      await runAudit();
      await loadDashboard(); 
    } catch (err: any) {
      alert("Failed to run audit: " + (err.message || 'Unknown error'));
    } finally {
      clearInterval(interval);
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading your growth data..." />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <ErrorState onRetry={loadDashboard} />
      </DashboardLayout>
    );
  }

  const { user, business, growthScore, recommendations } = data;

  if (!business) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!growthScore) {
    return (
      <DashboardLayout>
        <BusinessHeader 
          businessName={business.name} 
          city={business.city} 
          ownerName={user.name} 
        />
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 bg-white rounded-2xl shadow-sm border border-gray-100 py-16 mt-6">
          {isAuditing ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold text-primary mb-2 transition-all duration-300">
                {auditMessages[auditStep]}
              </h2>
              <p className="text-secondary">This usually takes about 10-15 seconds.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-primary mb-2">Your business is ready.</h2>
              <p className="text-secondary mb-8">Run your first AI audit to see your Growth Score.</p>
              <Button variant="primary" size="lg" className="h-12 px-8 text-lg" onClick={handleRunAudit}>
                Run First Audit
              </Button>
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BusinessHeader 
        businessName={business.name} 
        city={business.city} 
        ownerName={user.name} 
        lastAudited={growthScore.lastAudited} 
      />

      {/* Top Row: Score + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 mb-10 mt-6">
        {/* Left: Score & Sub-metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="sm:col-span-1">
            <GrowthScoreCard score={growthScore.overall} />
          </div>
          <div className="sm:col-span-2 grid grid-cols-2 gap-4">
            <ScoreMetric label="SEO" score={growthScore.seo} />
            <ScoreMetric label="Reviews" score={growthScore.reviews} />
            <ScoreMetric label="Website" score={growthScore.website} />
            <ScoreMetric label="Visibility" score={growthScore.visibility} />
          </div>
        </div>

        {/* Right: Progress */}
        <div className="lg:col-span-1">
          <ProgressCard previousScore={growthScore.previousScore} currentScore={growthScore.overall} />
        </div>
      </div>

      {/* Bottom Area: Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left/Main: Action Plan is dominant */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold text-primary mb-6">Your AI Action Plan</h3>
          <div className="space-y-4">
            {recommendations.map(rec => (
              <ActionPlanCard
                key={rec.id}
                id={rec.id}
                title={rec.title}
                description={rec.description}
                priority={rec.priority}
                priorityColor={rec.priorityColor}
                impact={rec.impact}
                estimatedTime={rec.estimatedTime}
              />
            ))}
          </div>
        </div>
        
        {/* Right sidebar space reserved for future secondary content (alerts, tips, etc.) */}
        <div className="lg:col-span-1 hidden lg:block">
           <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 text-sm text-secondary">
             <h4 className="font-bold text-primary mb-2">Why focus on these actions?</h4>
             <p className="leading-relaxed mb-4">Your AI action plan is prioritized by impact. Completing the top actions will have the fastest effect on your Growth Score.</p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
