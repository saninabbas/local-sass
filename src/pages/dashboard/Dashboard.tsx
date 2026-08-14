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
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);

  const auditMessages = [
    "Perceiving website viewport...",
    "Scanning local map pack signals...",
    "Analyzing review sentiment velocity...",
    "Synthesizing competitive keyword opportunities...",
    "Formulating prioritized AI action queue..."
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
        <LoadingState message="Loading your growth telemetry..." />
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 bg-[#efe9de] rounded-2xl shadow-sm border border-[#e6dfd8] py-16 mt-6">
          {isAuditing ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-3 border-[#cc785c] border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-serif font-normal text-[#141413] mb-2 transition-all duration-300">
                {auditMessages[auditStep]}
              </h2>
              <p className="text-xs font-mono text-[#6c6a64]">Sonnet 3.7 visual audit pipeline active (~10-15s)</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-[#cc785c]/15 text-[#cc785c] flex items-center justify-center mb-4">
                <Sparkles size={24} />
              </div>
              <h2 className="text-2xl font-serif font-normal text-[#141413] mb-2">Your enterprise profile is configured.</h2>
              <p className="text-xs font-sans text-[#6c6a64] mb-6 max-w-md">Run your initial autonomous diagnostic to calculate your Growth Score.</p>
              <Button variant="primary" size="md" className="h-11 px-6 text-sm bg-[#cc785c] hover:bg-[#a9583e]" onClick={handleRunAudit}>
                Trigger Autonomous Audit
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-4">
        {/* Left: Score & Sub-metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <GrowthScoreCard score={growthScore.overall} />
          </div>
          <div className="sm:col-span-2 grid grid-cols-2 gap-3">
            <ScoreMetric label="Search Engine Index" score={growthScore.seo} />
            <ScoreMetric label="Customer Reviews" score={growthScore.reviews} />
            <ScoreMetric label="Core Web Vitals" score={growthScore.website} />
            <ScoreMetric label="Local Map Pack" score={growthScore.visibility} />
          </div>
        </div>

        {/* Right: Progress */}
        <div className="lg:col-span-1">
          <ProgressCard previousScore={growthScore.previousScore} currentScore={growthScore.overall} />
        </div>
      </div>

      {/* Bottom Area: Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main: Action Plan is dominant */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif font-normal text-[#141413]">Autonomous Action Queue</h3>
            <span className="text-xs font-mono text-[#cc785c]">
              {recommendations.length} Active Directives
            </span>
          </div>
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
                difficulty={rec.difficulty}
                seoImpact={rec.seoImpact}
                localImpact={rec.localImpact}
                conversionImpact={rec.conversionImpact}
                businessOutcome={rec.businessOutcome}
              />
            ))}
          </div>
        </div>
        
        {/* Right sidebar */}
        <div className="lg:col-span-1 hidden lg:block space-y-4">
          <div className="bg-[#efe9de] rounded-xl p-5 border border-[#e6dfd8] text-xs font-sans text-[#3d3d3a]">
            <h4 className="font-serif font-medium text-sm text-[#141413] mb-2">Why focus on these actions?</h4>
            <p className="leading-relaxed text-[#6c6a64] mb-3">
              Your AI action plan is prioritized deterministically by competitive impact. Completing top items triggers immediate ranking re-evaluation.
            </p>
            <div className="pt-3 border-t border-[#e6dfd8]">
              <span className="text-[11px] font-mono text-[#cc785c] block mb-1">AUTOMATION AVAILABLE</span>
              <p className="text-[11px] text-[#6c6a64]">
                Claude Computer Use Agent can execute browser-based tasks autonomously.
              </p>
              <Link to="/claude" className="inline-flex items-center gap-1 text-xs font-medium text-[#cc785c] hover:text-[#a9583e] mt-2">
                <span>Try Computer Use Demo</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="bg-[#181715] text-[#faf9f5] rounded-xl p-5 border border-[#252320] text-xs font-sans">
            <span className="text-[10px] font-mono text-[#cc785c] uppercase tracking-wider block mb-1">Continuous Monitoring</span>
            <h4 className="font-serif font-normal text-sm text-[#faf9f5] mb-2">Weekly Executive Digest</h4>
            <p className="text-[#a09d96] text-[11px] leading-relaxed">
              We re-scan local rankings every Monday morning and push delta changes to your registered email.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
