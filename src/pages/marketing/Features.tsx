import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Bot, 
  FileText, 
  ShieldCheck, 
  Star, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Features() {
  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#141413] font-sans flex flex-col justify-between selection:bg-[#cc785c] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 sm:px-8 border-b border-[#e6dfd8] bg-[#efe9de]/40">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-xs font-mono uppercase tracking-wider text-[#cc785c] mb-6 shadow-2xs">
              <Sparkles size={13} /> Complete AI Growth Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#141413] tracking-tight mb-6">
              Everything your local business needs to <span className="italic text-[#cc785c]">dominate Google search</span>.
            </h1>
            <p className="text-base sm:text-lg text-[#6c6a64] max-w-2xl mx-auto leading-relaxed mb-8">
              From automated technical audits and SERP competitor intelligence to our live AI Growth Copilot and reputation manager.
            </p>
            <div className="flex justify-center gap-3">
              <Link to="/signup">
                <Button className="bg-[#cc785c] hover:bg-[#a9583e] text-white px-7 py-3 text-sm font-medium rounded-xl shadow-sm flex items-center gap-2">
                  Start Free Audit <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 px-6 sm:px-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#efe9de] p-8 rounded-2xl border border-[#e6dfd8] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#cc785c] mb-6 shadow-2xs">
                  <Target size={22} />
                </div>
                <h3 className="text-xl font-serif font-medium text-[#141413] mb-3">7-Vector Diagnostic Audit</h3>
                <p className="text-xs text-[#6c6a64] leading-relaxed">
                  Real HTML DOM crawler evaluating Technical, On-Page, Local, Content, Performance, Mobile, and Security health with precise fix protocols.
                </p>
              </div>
            </div>

            <div className="bg-[#efe9de] p-8 rounded-2xl border border-[#e6dfd8] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#cc785c] mb-6 shadow-2xs">
                  <Bot size={22} />
                </div>
                <h3 className="text-xl font-serif font-medium text-[#141413] mb-3">Rankora Growth Copilot</h3>
                <p className="text-xs text-[#6c6a64] leading-relaxed">
                  Live, context-aware AI assistant equipped with your real-time ranking data to explain gaps and execute tasks with one click.
                </p>
              </div>
            </div>

            <div className="bg-[#efe9de] p-8 rounded-2xl border border-[#e6dfd8] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#cc785c] mb-6 shadow-2xs">
                  <Layers size={22} />
                </div>
                <h3 className="text-xl font-serif font-medium text-[#141413] mb-3">SERP Competitor Spy</h3>
                <p className="text-xs text-[#6c6a64] leading-relaxed">
                  Dual-site comparison, 9-point gap analysis, and reverse-engineered confidence factors explaining exactly why competitors rank higher.
                </p>
              </div>
            </div>

            <div className="bg-[#efe9de] p-8 rounded-2xl border border-[#e6dfd8] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#cc785c] mb-6 shadow-2xs">
                  <FileText size={22} />
                </div>
                <h3 className="text-xl font-serif font-medium text-[#141413] mb-3">Local Content Studio</h3>
                <p className="text-xs text-[#6c6a64] leading-relaxed">
                  Identify competitor topic gaps and generate complete publication-ready blog drafts and service guides with clean HTML exports.
                </p>
              </div>
            </div>

            <div className="bg-[#efe9de] p-8 rounded-2xl border border-[#e6dfd8] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#cc785c] mb-6 shadow-2xs">
                  <Star size={22} />
                </div>
                <h3 className="text-xl font-serif font-medium text-[#141413] mb-3">Reputation & Review AI</h3>
                <p className="text-xs text-[#6c6a64] leading-relaxed">
                  Monitor customer sentiment, average ratings, and draft brand-aligned AI review responses in multiple tones with 1-click approvals.
                </p>
              </div>
            </div>

            <div className="bg-[#efe9de] p-8 rounded-2xl border border-[#e6dfd8] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#cc785c] mb-6 shadow-2xs">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-xl font-serif font-medium text-[#141413] mb-3">Authority Link Builder</h3>
                <p className="text-xs text-[#6c6a64] leading-relaxed">
                  Curated directory opportunities, backlink verification badges, and AI outreach pitch drafting to steadily increase domain trust.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
