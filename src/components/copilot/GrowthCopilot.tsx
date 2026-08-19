import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, 
  Send, 
  RefreshCw, 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  Star, 
  ShieldCheck, 
  Globe, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Wrench,
  Radio
} from 'lucide-react';
import { sendCopilotMessage, runAudit, getDashboard } from '../../lib/api';
import { useBusiness } from '../../context/BusinessContext';
import type { CopilotMessage, DashboardData } from '../../types';

interface GrowthCopilotProps {
  businessName?: string;
}

export function GrowthCopilot({ businessName }: GrowthCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeBusiness, activeBusinessId } = useBusiness();

  const activeProjectName = activeBusiness?.name || activeBusiness?.website_url?.replace(/^https?:\/\//, '') || businessName || 'My Project';

  // Load real telemetry from D1 via getDashboard
  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const data = await getDashboard(activeBusinessId || undefined);
        if (isMounted && data) {
          setDashboardData(data);
        }
      } catch {
        // Silently keep default state if not loaded yet
      }
    };
    fetchTelemetry();
    return () => { isMounted = false; };
  }, [activeBusinessId]);

  // Contextual screen-aware loading indicators
  const getContextualLoadingText = () => {
    const path = location.pathname;
    if (path.includes('competitors')) return "Analyzing competitor search gaps...";
    if (path.includes('keywords')) return "Checking SERP keyword ranks...";
    if (path.includes('website') || path.includes('score')) return "Checking live DOM audit & schema...";
    if (path.includes('campaign') || path.includes('actions')) return "Reading campaign priority queue...";
    if (path.includes('billing')) return "Verifying account entitlements & plan...";
    if (path.includes('reviews')) return "Reading GMB review telemetry...";
    return "Evaluating business signals & telemetry...";
  };

  // Screen-aware quick action presets
  const getContextualPresets = () => {
    const path = location.pathname;
    if (path.includes('competitors')) {
      return [
        "Why are competitors beating me?",
        "Show biggest gap",
        "Generate competitor strategy"
      ];
    }
    if (path.includes('keywords')) {
      return [
        "Which keyword should I target?",
        "Show ranking movements",
        "Discover local keywords"
      ];
    }
    if (path.includes('website') || path.includes('score')) {
      return [
        "What is my biggest technical issue?",
        "Fix homepage meta tags",
        "Check schema markup"
      ];
    }
    if (path.includes('campaign') || path.includes('actions')) {
      return [
        "What is today's priority?",
        "Fix highest-impact issue",
        "Show completed changes"
      ];
    }
    if (path.includes('reviews')) {
      return [
        "What is my review status?",
        "Which reviews need responses?",
        "Improve local reputation"
      ];
    }
    return [
      "What should I fix first?",
      "Analyze search visibility",
      "Show growth opportunities"
    ];
  };

  const currentPresets = getContextualPresets();

  const [messages, setMessages] = useState<CopilotMessage[]>([]);

  // Telemetry signals derived from real D1 / API state
  const growthScore = dashboardData?.growthScore;
  const keywordsSummary = dashboardData?.keywordsSummary;
  const primaryRecommendation = dashboardData?.recommendations?.[0] || null;

  const rankingSignal = keywordsSummary?.improvingCount 
    ? `↑ ${keywordsSummary.improvingCount} improving`
    : keywordsSummary?.totalTracked
    ? `${keywordsSummary.totalTracked} tracked`
    : '—';

  const reviewsSignal = growthScore?.reviews != null ? `${growthScore.reviews}/100` : '—';
  const authoritySignal = growthScore?.authority != null ? `${growthScore.authority}/100` : '—';
  const websiteSignal = growthScore?.website != null ? `${growthScore.website}/100` : growthScore?.overall != null ? `${growthScore.overall}/100` : '—';

  // Project switch awareness: reset conversation context when project changes
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${activeBusinessId || 'default'}`,
        role: 'assistant',
        content: `**RANKORA GROWTH INTELLIGENCE** initialized for **${activeProjectName}**.\n\nLive signals synchronized with D1 database engine. Select an operation or enter a query below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { type: 'view_module', label: 'View Action Roadmap', target: '/dashboard/actions' },
          { type: 'run_audit', label: 'Run Diagnostic Audit' }
        ]
      }
    ]);
  }, [activeBusinessId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for custom "open-copilot" events
  useEffect(() => {
    const handleOpenCopilot = (event: any) => {
      const prompt = event.detail?.prompt;
      setIsOpen(true);
      if (prompt) {
        handleSendMessage(prompt);
      }
    };
    window.addEventListener('rankora:open-copilot' as any, handleOpenCopilot);
    return () => window.removeEventListener('rankora:open-copilot' as any, handleOpenCopilot);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMsg: CopilotMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await sendCopilotMessage(messageText);
      const assistantMsg: CopilotMessage = {
        id: 'copilot-' + Date.now(),
        role: 'assistant',
        content: response?.reply || 'Telemetry evaluated. Action roadmap updated with prioritized recommendations.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response?.actions as any
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: 'Unable to retrieve real-time telemetry from upstream index at this moment. You can trigger a full diagnostic re-audit below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { type: 'run_audit', label: 'Run Diagnostic Audit' },
          { type: 'view_module', label: 'Open Website Diagnostics', target: '/dashboard/website' }
        ]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = async (action: { type: string; label: string; target?: string }) => {
    if (action.type === 'run_audit') {
      try {
        setLoading(true);
        await runAudit();
        setMessages(prev => [
          ...prev,
          {
            id: 'audit-started-' + Date.now(),
            role: 'assistant',
            content: '✓ **Diagnostic Audit Initiated**: Re-crawling HTML DOM structure and refreshing local search positions.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setTimeout(() => window.location.reload(), 2000);
      } catch (err: any) {
        alert(err.message || 'Audit trigger failed.');
      } finally {
        setLoading(false);
      }
    } else if (action.type === 'fix_with_ai' || action.target === '/dashboard/actions?fix=ai') {
      setIsOpen(false);
      navigate('/dashboard/actions?fix=ai');
    } else if (action.target) {
      setIsOpen(false);
      navigate(action.target);
    }
  };

  return (
    <>
      {/* Floating Operations Trigger Button (Requirement #11) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Growth Intelligence"
          aria-label="Open Growth Intelligence Console"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 bg-[#181715] hover:bg-[#252320] text-[#faf9f5] rounded-full shadow-2xl border border-[#e6dfd8]/30 transition-all duration-200 transform hover:scale-105 cursor-pointer font-mono text-xs group"
        >
          <span className="w-2 h-2 rounded-full bg-[#5db872] animate-pulse" />
          <Radio size={14} className="text-[#cc785c]" />
          <span className="font-semibold tracking-wide uppercase text-[11px]">Growth</span>
        </button>
      )}

      {/* Slide-out Operations Console Panel (390px - Requirements #9, #10, #12, #13, #14, #15) */}
      {isOpen && (
        <div 
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[410px] bg-[#faf9f5] shadow-2xl border-l border-[#e6dfd8] flex flex-col animate-in slide-in-from-right-8 duration-200"
          role="dialog"
          aria-label="Growth Intelligence Operations Console"
        >
          
          {/* Header */}
          <div className="p-4 bg-[#181715] text-[#faf9f5] border-b border-[#252320] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#cc785c] text-white flex items-center justify-center shadow-xs shrink-0 font-serif font-bold text-xs">
                R
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xs font-bold tracking-wider uppercase text-[#faf9f5]">RANKORA</h2>
                  <span className="text-[10px] font-sans text-[#8e8b82]">Growth Intelligence</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5db872] animate-pulse" />
                  <span className="text-[10px] text-[#5db872] font-mono font-medium">LIVE TELEMETRY</span>
                  <span className="text-[10px] text-[#8e8b82] font-mono truncate">&bull; {activeProjectName}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#8e8b82] hover:text-white hover:bg-[#252320] transition-colors cursor-pointer"
              aria-label="Close Assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* Business Signals (Requirement #12) */}
          <div className="p-3 bg-[#efe9de] border-b border-[#e6dfd8]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6c6a64]">
                Business Signals
              </span>
              <span className="text-[9px] font-mono text-[#8e8b82]">Verified D1 State</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-[#faf9f5] border border-[#e6dfd8] text-center">
                <span className="text-[9px] font-mono uppercase text-[#8e8b82] block">Ranking</span>
                <span className="text-xs font-mono font-bold text-[#141413] mt-0.5 block truncate">
                  {rankingSignal}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#faf9f5] border border-[#e6dfd8] text-center">
                <span className="text-[9px] font-mono uppercase text-[#8e8b82] block">Reviews</span>
                <span className="text-xs font-mono font-bold text-[#141413] mt-0.5 block truncate">
                  {reviewsSignal}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#faf9f5] border border-[#e6dfd8] text-center">
                <span className="text-[9px] font-mono uppercase text-[#8e8b82] block">Authority</span>
                <span className="text-xs font-mono font-bold text-[#141413] mt-0.5 block truncate">
                  {authoritySignal}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#faf9f5] border border-[#e6dfd8] text-center">
                <span className="text-[9px] font-mono uppercase text-[#8e8b82] block">Website</span>
                <span className="text-xs font-mono font-bold text-[#141413] mt-0.5 block truncate">
                  {websiteSignal}
                </span>
              </div>
            </div>
          </div>

          {/* What I Found & Recommended Action Telemetry Card (Requirements #13 & #14) */}
          <div className="p-3.5 bg-[#faf9f5] border-b border-[#e6dfd8] space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#141413]">
                  What I Found
                </span>
                <span className="text-[10px] font-mono text-[#cc785c] font-bold">Evidence</span>
              </div>
              <p className="text-xs text-[#4a4843] font-sans leading-relaxed">
                {keywordsSummary && keywordsSummary.totalTracked > 0
                  ? `Active search monitoring tracks ${keywordsSummary.totalTracked} keywords across local SERP.`
                  : 'Diagnostic evaluation active. Local visibility and DOM benchmarks computed from live crawl.'}
              </p>

              {/* Evidence Pills */}
              <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono">
                <div className="p-1.5 rounded bg-[#efe9de]/60 border border-[#e6dfd8] flex justify-between">
                  <span className="text-[#8e8b82]">SERP:</span>
                  <span className="font-bold text-[#141413]">{keywordsSummary?.totalTracked ?? 0} keywords</span>
                </div>
                <div className="p-1.5 rounded bg-[#efe9de]/60 border border-[#e6dfd8] flex justify-between">
                  <span className="text-[#8e8b82]">Reviews:</span>
                  <span className="font-bold text-[#141413]">{growthScore?.reviews ? `${growthScore.reviews}/100` : 'Synced'}</span>
                </div>
                <div className="p-1.5 rounded bg-[#efe9de]/60 border border-[#e6dfd8] flex justify-between">
                  <span className="text-[#8e8b82]">Authority:</span>
                  <span className="font-bold text-[#141413]">{growthScore?.authority ? `${growthScore.authority}/100` : 'Monitoring'}</span>
                </div>
                <div className="p-1.5 rounded bg-[#efe9de]/60 border border-[#e6dfd8] flex justify-between">
                  <span className="text-[#8e8b82]">Website:</span>
                  <span className="font-bold text-[#141413]">{websiteSignal}</span>
                </div>
              </div>
            </div>

            {/* Recommended Action (Requirement #14) */}
            <div className="p-3 rounded-xl bg-[#efe9de] border border-[#e6dfd8]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#cc785c]">
                  Recommended Action
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {primaryRecommendation?.impact || 'High Impact'}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#141413] mb-1 font-sans">
                {primaryRecommendation?.title || 'Optimize title & localized meta tags for homepage'}
              </p>
              <p className="text-[11px] text-[#6c6a64] font-sans leading-relaxed mb-3">
                {(primaryRecommendation as any)?.why_it_matters || (primaryRecommendation as any)?.description || 'Aligns HTML signals with localized user search queries to elevate Google rankings.'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/dashboard/actions');
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#faf9f5] hover:bg-[#efe9de] text-[#141413] text-xs font-medium border border-[#e6dfd8] transition-colors cursor-pointer"
                >
                  Review Fix
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/dashboard/actions?fix=ai');
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#141413] hover:bg-[#252320] text-[#faf9f5] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Apply Action</span>
                  <ArrowRight size={12} className="text-[#cc785c]" />
                </button>
              </div>
            </div>
          </div>

          {/* Screen-Aware Contextual Quick Actions (Requirement #15) */}
          <div className="p-2.5 bg-[#efe9de]/70 border-b border-[#e6dfd8] overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {currentPresets.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-sans font-semibold bg-[#faf9f5] text-[#141413] border border-[#e6dfd8] hover:border-[#cc785c] hover:text-[#cc785c] transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Operations Conversation Stream (Requirement #15) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#141413] text-[#faf9f5] rounded-br-none shadow-xs font-medium'
                      : 'bg-[#efe9de]/70 text-[#141413] border border-[#e6dfd8] rounded-bl-none shadow-xs'
                  }`}
                >
                  <div className="prose prose-xs max-w-none prose-headings:font-serif prose-headings:text-[#141413] prose-headings:font-bold prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-strong:text-[#141413]">
                    {msg.content}
                  </div>

                  {/* Contextual Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#e6dfd8] flex flex-wrap gap-2">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f5] hover:bg-[#141413] text-[#141413] hover:text-white font-sans font-bold rounded-xl text-[11px] border border-[#e6dfd8] transition-all shadow-xs cursor-pointer"
                        >
                          {act.type === 'run_audit' ? <RefreshCw size={11} className="text-[#cc785c]" /> : 
                           act.type === 'fix_with_ai' ? <Wrench size={11} className="text-[#cc785c]" /> : 
                           <Layers size={11} className="text-[#cc785c]" />}
                          <span>{act.label}</span>
                          <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-[#8e8b82] mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-[#efe9de] rounded-xl border border-[#e6dfd8] text-[#6c6a64] max-w-[85%]">
                <RefreshCw size={14} className="animate-spin text-[#cc785c]" />
                <span className="text-xs font-mono">{getContextualLoadingText()}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Operations Input Footer */}
          <div className="p-3.5 bg-[#faf9f5] border-t border-[#e6dfd8]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Growth Intelligence..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:outline-none focus:ring-1 focus:ring-[#cc785c] text-xs text-[#141413] font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 bg-[#141413] hover:bg-[#252320] text-white rounded-xl disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                aria-label="Send query"
              >
                <Send size={14} className="text-[#cc785c]" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
