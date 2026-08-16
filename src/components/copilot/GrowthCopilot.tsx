import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  Send, 
  RefreshCw, 
  ArrowRight, 
  Bot,
  Layers,
  Wrench
} from 'lucide-react';
import { sendCopilotMessage, runAudit } from '../../lib/api';
import { useBusiness } from '../../context/BusinessContext';
import type { CopilotMessage } from '../../types';

interface GrowthCopilotProps {
  businessName?: string;
}

export function GrowthCopilot({ businessName }: GrowthCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { activeBusiness, activeBusinessId } = useBusiness();

  const activeProjectName = activeBusiness?.name || activeBusiness?.website_url || businessName || 'My Project';

  // Contextual screen-aware loading indicators (Requirement #11)
  const getContextualLoadingText = () => {
    const path = location.pathname;
    if (path.includes('competitors')) return "Analyzing competitor search gaps...";
    if (path.includes('keywords')) return "Checking SERP keyword ranks...";
    if (path.includes('website') || path.includes('score')) return "Checking live DOM audit & schema...";
    if (path.includes('campaign')) return "Reading campaign priority queue...";
    if (path.includes('billing')) return "Verifying account entitlements & plan...";
    if (path.includes('reviews')) return "Reading GMB review telemetry...";
    return "Evaluating growth score & telemetry...";
  };

  // Screen-aware quick action presets (Requirement #6 & #10)
  const getContextualPresets = () => {
    const path = location.pathname;
    if (path.includes('competitors')) {
      return [
        "Why are they beating me?",
        "Show biggest gap",
        "Create competitor strategy"
      ];
    }
    if (path.includes('keywords')) {
      return [
        "Which keyword should I target?",
        "Show ranking drops",
        "Discover keywords"
      ];
    }
    if (path.includes('website') || path.includes('score')) {
      return [
        "What is my biggest technical issue?",
        "Fix my title",
        "Check schema"
      ];
    }
    if (path.includes('campaign')) {
      return [
        "What's today's priority?",
        "Fix highest-impact issue",
        "Show completed work"
      ];
    }
    if (path.includes('changes')) {
      return [
        "What changes were verified?",
        "Show failed changes",
        "Re-verify live DOM"
      ];
    }
    if (path.includes('billing')) {
      return [
        "What is my plan status?",
        "Show usage limits",
        "Upgrade to Growth"
      ];
    }
    if (path.includes('reviews')) {
      return [
        "What is my review status?",
        "Which reviews need responses?",
        "Improve reputation"
      ];
    }
    return [
      "Why is my score low?",
      "What should I fix first?",
      "What changed?"
    ];
  };

  const currentPresets = getContextualPresets();

  const [messages, setMessages] = useState<CopilotMessage[]>([]);

  // Project switch awareness: reset conversation context when project changes (Requirement #10)
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${activeBusinessId || 'default'}`,
        role: 'assistant',
        content: `### Finding\nRANKORA GROWTH OPERATOR active for **${activeProjectName}**.\n\n### Evidence\n- Telemetry: Synced with D1\n\n### Action\nSelect a quick action or enter a query.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { type: 'view_module', label: 'View Action Plan', target: '/dashboard/actions' },
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
        content: response?.reply || '### Finding\nTelemetry loaded and roadmap updated.\n\n### Evidence\n- Status: Synced with D1\n\n### Action\nReview action roadmap.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response?.actions as any
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: '### Finding\nRankora couldn\'t retrieve verified telemetry for this query.\n\n### Evidence\n- Status: **UNAVAILABLE**\n\n### Action\nRun diagnostic audit.',
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
        setTimeout(() => window.location.reload(), 2500);
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
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Open RANKORA Growth Operator"
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 bg-[#181715] text-[#faf9f5] hover:bg-[#252320] rounded-full shadow-2xl border border-[#cc785c]/50 transition-all duration-300 transform hover:scale-110 cursor-pointer group"
          aria-label="Open RANKORA Growth Operator"
        >
          <Sparkles size={18} className="text-[#cc785c]" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#5db872] border-2 border-[#181715]" />
        </button>
      )}

      {/* Slide-out / Compact Drawer Panel (380-400px - Requirement #11) */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[390px] bg-[#faf9f5] shadow-2xl border-l border-[#e6dfd8] flex flex-col animate-in slide-in-from-right-8 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-[#181715] text-[#faf9f5] border-b border-[#252320] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#cc785c] text-white flex items-center justify-center shadow-xs shrink-0 font-serif font-bold text-xs">
                R
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xs font-bold tracking-wider uppercase text-[#faf9f5]">RANKORA GROWTH OPERATOR</h2>
                </div>
                <p className="text-[10px] text-[#8e8b82] font-mono truncate">
                  Active Domain: <span className="text-white font-bold">{activeProjectName}</span>
                </p>
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

          {/* Screen-Aware Contextual Quick Actions (3-4 pills - Requirement #10) */}
          <div className="p-3 bg-[#efe9de]/60 border-b border-[#e6dfd8] overflow-x-auto no-scrollbar flex items-center gap-1.5">
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

          {/* Messages Stream */}
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

          {/* Input Footer */}
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
                placeholder={`Ask Growth Operator...`}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:outline-none focus:ring-1 focus:ring-[#cc785c] text-xs text-[#141413] font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 bg-[#141413] hover:bg-[#252320] text-white rounded-xl disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                aria-label="Send message"
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
