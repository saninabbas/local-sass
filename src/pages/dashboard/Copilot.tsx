import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { sendCopilotMessage, runAudit } from '../../lib/api';
import { 
  Send, 
  ArrowRight, 
  RefreshCw, 
  Radio,
  TrendingUp,
  Layers,
  ShieldCheck,
  Activity,
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: Array<{ type: string; label: string; target?: string }>;
  timestamp: string;
}

const STARTER_PROMPTS = [
  {
    title: "Google Maps 3-Pack Gap",
    prompt: "Why am I not ranking in the Google Maps Local 3-Pack in my target city, and what are my biggest local SEO bottlenecks?",
    icon: Radio
  },
  {
    title: "Competitor Ranking Advantage",
    prompt: "Why are my top competitors ranking above me and what are they doing differently?",
    icon: TrendingUp
  },
  {
    title: "Prioritized 30-Day Growth Roadmap",
    prompt: "Give me a prioritized 30-day tactical growth plan based on my actual audit data.",
    icon: Layers
  },
  {
    title: "Missing Local Service Pages",
    prompt: "Which local service pages and location guides should I create first to capture high-intent search traffic?",
    icon: ShieldCheck
  }
];

export function Copilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "**SCORANKIO GROWTH INTELLIGENCE CONSOLE**\n\nSynchronized with live website crawl, Growth Score dimensions, local competitors, tracked keywords, and reviews telemetry. Select an operational query below or enter a prompt.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'view_module', label: 'View Action Roadmap', target: '/dashboard/actions' },
        { type: 'run_audit', label: 'Run Diagnostic Audit', target: '/dashboard/website' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await sendCopilotMessage(messageText);
      const assistantMsg: Message = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: res.reply || 'Telemetry evaluated and roadmap updated.',
        actions: res.actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: "Unable to retrieve verified telemetry for this query: " + (err.message || "Please make sure your website is configured."),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = async (action: { type: string; label: string; target?: string }) => {
    if (action.target) {
      navigate(action.target);
    } else if (action.type === 'run_audit') {
      setLoading(true);
      try {
        await runAudit();
        setMessages(prev => [
          ...prev,
          {
            id: 'audit-done-' + Date.now(),
            role: 'assistant',
            content: "✓ **Diagnostic Audit Completed!** Growth Scores and competitive telemetry have been refreshed.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } catch (err: any) {
        alert("Failed to run audit: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#5db872] animate-pulse" />
            <span className="text-[11px] font-mono text-[#5db872] uppercase font-bold tracking-wider">LIVE OPERATIONS CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#141413] tracking-tight flex items-center gap-2.5">
            Scorankio Growth Intelligence
          </h1>
          <p className="text-xs text-[#6c6a64] font-sans mt-1">
            Business intelligence and operational SEO console with real-time telemetry from D1 database engine.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Starter Prompts Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6c6a64] px-1">
            Operational Telemetry Queries
          </h2>
          <div className="space-y-2">
            {STARTER_PROMPTS.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.prompt)}
                  disabled={loading}
                  className="w-full text-left p-3.5 rounded-xl bg-[#efe9de] hover:bg-[#e6dfd8] border border-[#e6dfd8] transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className="text-[#cc785c]" />
                    <span className="text-xs font-serif font-bold text-[#141413]">
                      {prompt.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6c6a64] line-clamp-2 font-sans">
                    {prompt.prompt}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Terminal Area */}
        <div className="lg:col-span-3 flex flex-col h-[640px] bg-[#faf9f5] rounded-2xl border border-[#e6dfd8] shadow-xs overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#141413] text-[#faf9f5] rounded-br-none shadow-xs font-medium'
                      : 'bg-[#efe9de] text-[#141413] border border-[#e6dfd8] rounded-bl-none shadow-xs'
                  }`}
                >
                  <div className="prose prose-xs max-w-none prose-headings:font-serif prose-headings:text-[#141413] prose-headings:font-bold prose-p:my-1 prose-strong:text-[#141413]">
                    {msg.content}
                  </div>

                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#e6dfd8] flex flex-wrap gap-2">
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
              <div className="flex items-center gap-2.5 p-3.5 bg-[#efe9de] rounded-xl border border-[#e6dfd8] text-[#6c6a64] max-w-md">
                <RefreshCw size={14} className="animate-spin text-[#cc785c]" />
                <span className="text-xs font-mono">Evaluating live database telemetry...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-[#faf9f5] border-t border-[#e6dfd8]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Growth Intelligence about rankings, competitors, or technical SEO..."
                className="flex-1 px-4 py-3 rounded-xl border border-[#e6dfd8] bg-[#faf9f5] focus:outline-none focus:ring-1 focus:ring-[#cc785c] text-xs text-[#141413] font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-4 py-3 bg-[#141413] hover:bg-[#252320] text-white rounded-xl disabled:opacity-40 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                aria-label="Send Query"
              >
                <span>Send</span>
                <Send size={13} className="text-[#cc785c]" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
