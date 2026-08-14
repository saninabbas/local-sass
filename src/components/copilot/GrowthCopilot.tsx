import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  Send, 
  RefreshCw, 
  ArrowRight, 
  Bot,
  Layers,
  Plus
} from 'lucide-react';
import { sendCopilotMessage, runAudit } from '../../lib/api';
import type { CopilotMessage } from '../../types';

interface GrowthCopilotProps {
  businessName?: string;
}

const PRESET_QUESTIONS = [
  "Why am I not ranking?",
  "Why is competitor beating me?",
  "What should I fix first?",
  "What keywords should I target?",
  "What pages should I create?",
  "How can I get more reviews?",
  "Give me a 30-day growth plan.",
  "What are my biggest SEO problems?"
];

export function GrowthCopilot({ businessName }: GrowthCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am **RANKORA AI**, your dedicated local growth strategist.\n\nI have direct access to your live website crawl, competitor benchmarks, keyword rankings, and review telemetry for **${businessName || 'your business'}**.\n\nWhat would you like to solve today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'view_module', label: 'View Action Plan', target: '/dashboard/actions' },
        { type: 'run_audit', label: 'Run Diagnostic Audit' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Listen for custom "open-copilot" events from anywhere in the app (e.g. Action Plan "ASK AI" button)
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
        content: response?.reply || 'I analyzed your website and identified actionable opportunities in your Action Plan.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: response?.actions as any
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: 'I don’t have this data yet. Please execute a fresh diagnostic audit or connect your integrations.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { type: 'run_audit', label: 'Run Diagnostic Audit' },
          { type: 'view_module', label: 'Add Keyword', target: '/dashboard/keywords' }
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
            content: '✓ **New Diagnostic Audit Initiated**: Crawling DOM structure and refreshing local search positions. Updating view...',
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
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#181715] text-[#faf9f5] hover:bg-[#252320] rounded-full shadow-xl border border-[#cc785c]/40 transition-all duration-300 transform hover:scale-105 group"
          aria-label="Ask RANKORA AI"
        >
          <div className="w-6 h-6 rounded-full bg-[#cc785c] text-white flex items-center justify-center shadow-xs">
            <Sparkles size={13} className="animate-pulse" />
          </div>
          <span className="font-sans font-medium text-xs tracking-wide">RANKORA AI</span>
          <span className="w-2 h-2 rounded-full bg-[#5db872] animate-ping" />
        </button>
      )}

      {/* Slide-out Copilot Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#faf9f5] shadow-2xl border-l border-[#e6dfd8] flex flex-col animate-in slide-in-from-right-8 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-[#181715] text-[#faf9f5] border-b border-[#252320] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#cc785c] text-white flex items-center justify-center shadow-xs">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-sm font-medium">RANKORA AI</h2>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#252320] text-[#5db872] border border-[#5db872]/30 font-bold">
                    CONNECTED
                  </span>
                </div>
                <p className="text-[10px] text-[#8e8b82] font-mono">Live Business & SERP Telemetry</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#8e8b82] hover:text-white hover:bg-[#252320] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Question Presets */}
          <div className="p-3 bg-[#efe9de] border-b border-[#e6dfd8] overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-sans font-medium bg-[#faf9f5] text-[#141413] border border-[#e6dfd8] hover:border-[#cc785c] hover:text-[#cc785c] transition-colors shrink-0"
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
                  className={`max-w-[90%] p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#cc785c] text-white rounded-br-none shadow-xs font-medium'
                      : 'bg-[#efe9de] text-[#141413] border border-[#e6dfd8] rounded-bl-none shadow-xs'
                  }`}
                >
                  <div className="prose prose-xs max-w-none prose-headings:font-serif prose-headings:text-[#141413] prose-p:my-1 prose-strong:text-[#141413]">
                    {msg.content}
                  </div>

                  {/* Contextual Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#e6dfd8] flex flex-wrap gap-2">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#faf9f5] hover:bg-[#e8e0d2] text-[#cc785c] font-sans font-semibold rounded-lg text-[11px] border border-[#e6dfd8] transition-colors shadow-xs"
                        >
                          {act.type === 'run_audit' ? <RefreshCw size={11} /> : act.type === 'add_keyword' ? <Plus size={11} /> : <Layers size={11} />}
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
              <div className="flex items-center gap-2 p-3 bg-[#efe9de] rounded-xl border border-[#e6dfd8] text-[#6c6a64] max-w-[75%]">
                <RefreshCw size={14} className="animate-spin text-[#cc785c]" />
                <span className="text-xs font-sans">Evaluating local ranking signals...</span>
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
                placeholder="Ask RANKORA AI about rankings, competitors, or fixes..."
                className="flex-1 px-3.5 py-2 rounded-lg border border-[#e6dfd8] bg-[#faf9f5] focus:outline-none focus:ring-1 focus:ring-[#cc785c] text-xs text-[#141413] font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-lg disabled:opacity-40 transition-colors shadow-xs"
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
