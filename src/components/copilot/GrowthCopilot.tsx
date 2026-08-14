import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  Send, 
  RefreshCw, 
  ArrowRight, 
  Bot
} from 'lucide-react';
import { sendCopilotMessage, runAudit } from '../../lib/api';
import type { CopilotMessage } from '../../types';

interface GrowthCopilotProps {
  businessName?: string;
}

const PRESET_QUESTIONS = [
  "Why is my score low?",
  "Why is my competitor ranking higher?",
  "What should I fix first?",
  "What pages am I missing?",
  "Which keywords should I target?",
  "What is hurting my local SEO?",
  "What should I do this week?"
];

export function GrowthCopilot({ businessName }: GrowthCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **Rankora Growth Copilot**.\n\nI have live telemetry from your website audits, competitor benchmarks, and local keyword positions for **${businessName || 'your business'}**.\n\nAsk me anything or choose a quick prompt below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'view_module', label: 'View Action Plan', target: '/dashboard/actions' },
        { type: 'run_audit', label: 'Run Fresh Audit' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
        content: response?.reply || 'I analyzed your website and identified actionable opportunities in your Action Plan.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response?.actions as any
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: 'I encountered an issue querying your live telemetry. Please make sure your website is configured or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
            content: '✓ **New Audit Initiated**: Crawling website signals and refreshing keyword positions. Reloading in a moment...',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setTimeout(() => window.location.reload(), 2500);
      } catch (err: any) {
        alert(err.message || 'Audit trigger failed.');
      } finally {
        setLoading(false);
      }
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
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-primary text-white hover:bg-slate-800 rounded-full shadow-2xl border border-blue-500/30 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
          aria-label="Ask Rankora Copilot"
        >
          <div className="w-6 h-6 rounded-full bg-primary-accent text-white flex items-center justify-center shadow-xs">
            <Sparkles size={13} className="animate-pulse" />
          </div>
          <span className="font-semibold text-xs tracking-wide">Ask Rankora AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Slide-out Copilot Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right-8 duration-300">
          
          {/* Copilot Header */}
          <div className="p-4 bg-primary text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-accent text-white flex items-center justify-center shadow-xs">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold">Rankora Growth Copilot</h2>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">LIVE AI</span>
                </div>
                <p className="text-[10px] text-slate-300">Telemetry-aware strategic advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompt Presets */}
          <div className="p-3 bg-gray-50 border-b border-gray-100 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-secondary hover:text-primary-accent border border-gray-200 hover:border-primary-accent transition-colors shrink-0 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary-accent text-white rounded-br-none shadow-xs font-medium'
                      : 'bg-gray-50 text-primary border border-gray-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  <div className="prose prose-xs max-w-none prose-p:my-1 prose-strong:text-primary">
                    {msg.content}
                  </div>

                  {/* Contextual Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-gray-200 flex flex-wrap gap-2">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-primary-accent font-semibold rounded-lg text-[11px] border border-gray-200 transition-colors shadow-xs cursor-pointer"
                        >
                          <Sparkles size={11} />
                          <span>{act.label}</span>
                          <ArrowRight size={11} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-secondary mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-secondary max-w-[80%]">
                <RefreshCw size={14} className="animate-spin text-primary-accent" />
                <span className="text-xs font-medium">Evaluating local ranking signals...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3.5 bg-white border-t border-gray-200">
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
                placeholder="Ask about your rankings, competitors, or fixes..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-accent text-xs text-primary"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 bg-primary-accent hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
