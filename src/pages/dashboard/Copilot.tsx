import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { sendCopilotMessage, runAudit } from '../../lib/api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Compass,
  Zap
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
    title: "Why am I not ranking in Google Maps?",
    prompt: "Why am I not ranking in the Google Maps Local 3-Pack in my city, and what are my biggest local SEO problems?",
    icon: Compass
  },
  {
    title: "Competitor Ranking Advantage",
    prompt: "Why are my competitors ranking above me and what are they doing differently?",
    icon: Sparkles
  },
  {
    title: "30-Day Growth Plan",
    prompt: "Give me a prioritized 30-day tactical growth plan based on my actual audit data.",
    icon: ArrowRight
  },
  {
    title: "Missing High-Intent Pages",
    prompt: "Which local service pages and location guides should I create first to capture ready-to-buy customers?",
    icon: Zap
  }
];

export function Copilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hello! I am your **Rankora AI Growth Agent**.\n\nI have direct, real-time access to your live website crawl, 11 Growth Score dimensions, local competitors, tracked keywords, and reviews. Ask me anything about how to improve your rankings, fix technical bottlenecks, or beat local competitors.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'view_module', label: 'View 30-Day Roadmap', target: '/dashboard/actions' },
        { type: 'run_audit', label: 'Run Diagnostic Audit', target: '/dashboard/score' }
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
        content: res.reply,
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
          content: "I encountered an issue querying your live telemetry: " + (err.message || "Please make sure your website is configured."),
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
            content: "✓ **Diagnostic Audit Completed!** Your 11 Growth Scores and competitive telemetry have been refreshed.",
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
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight flex items-center gap-2.5">
            <Bot className="text-primary-accent" size={26} />
            Rankora AI Growth Agent
          </h1>
          <p className="text-xs text-secondary mt-1">
            Dedicated local business growth assistant with direct access to your live telemetry and competitor data.
          </p>
        </div>
      </div>

      {/* Starter Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STARTER_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.prompt)}
            className="p-3.5 bg-white hover:bg-blue-50/50 rounded-2xl border border-gray-200 hover:border-blue-200 text-left transition-all shadow-xs cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-primary group-hover:text-primary-accent transition-colors">
                {p.title}
              </span>
              <p.icon size={14} className="text-secondary group-hover:text-primary-accent" />
            </div>
            <p className="text-[11px] text-secondary line-clamp-2 leading-relaxed">
              "{p.prompt}"
            </p>
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col h-[600px] overflow-hidden mb-8">
        
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => {
            const isAssistant = m.role === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
              >
                {isAssistant && (
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-primary-accent border border-blue-100 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} />
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                    isAssistant
                      ? 'bg-gray-50 border border-gray-200 text-primary space-y-2'
                      : 'bg-primary-accent text-white font-medium'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                  
                  {/* Action Buttons */}
                  {isAssistant && m.actions && m.actions.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2 flex-wrap mt-2">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-primary font-semibold text-xs border border-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sparkles size={11} className="text-primary-accent" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <span className={`text-[9px] block text-right font-mono mt-1 ${isAssistant ? 'text-secondary' : 'text-blue-100'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-primary-accent border border-blue-100 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-secondary flex items-center gap-2">
                <RefreshCw size={12} className="animate-spin text-primary-accent" />
                <span>Consulting live telemetry & formulating strategic advice...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Rankora AI (e.g. 'Why is competitor X ranking above me?', 'What should I fix first?')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-accent text-primary"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!input.trim() || loading}
              className="bg-primary-accent hover:bg-blue-700 text-white font-semibold text-xs h-10 px-5 flex items-center gap-1.5 shrink-0"
            >
              <Send size={13} />
              <span>Send</span>
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
