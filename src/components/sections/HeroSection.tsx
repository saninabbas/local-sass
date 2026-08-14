import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { AnthropicLogo } from '../claude/AnthropicLogo';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-20 sm:pb-32 bg-[#faf9f5] border-b border-[#e6dfd8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & CTA */}
          <div className="lg:col-span-6 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-[#252523] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#cc785c] animate-pulse"></span>
              <span>Visual Intelligence & AI Growth Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-serif font-normal tracking-[-1.5px] text-[#141413] leading-[1.05]">
              Know exactly what's holding your local business back.
            </h1>
            
            <p className="text-lg sm:text-xl text-[#3d3d3a] leading-relaxed font-sans font-normal max-w-xl mx-auto lg:mx-0">
              Rankora evaluates your complete digital presence, calculates a verified Growth Score, and deploys autonomous AI action plans to outrank competitors.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-[#cc785c] hover:bg-[#a9583e] text-white shadow-sm font-medium px-8 h-12 rounded-lg text-base flex items-center gap-2">
                  <span>Start Free Audit</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/claude" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto border-[#e6dfd8] text-[#141413] px-6 h-12 text-base rounded-lg flex items-center gap-2">
                  <Sparkles size={16} className="text-[#cc785c]" />
                  <span>Computer Use Demo</span>
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-6 text-xs text-[#6c6a64] font-sans pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#5db872]" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#5db872]" />
                2-minute visual audit
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Product Surface Card */}
          <div className="lg:col-span-6 relative mx-auto w-full">
            <div className="relative rounded-2xl border border-[#e6dfd8] bg-[#181715] text-[#faf9f5] shadow-2xl overflow-hidden">
              
              {/* Card Window Header */}
              <div className="border-b border-[#252320] bg-[#181715] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AnthropicLogo size={18} color="#cc785c" showWordmark={false} />
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#a09d96]">Live Audit</h3>
                    <p className="text-sm font-serif font-medium text-[#faf9f5] flex items-center gap-2">
                      Premier Health & Dental
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-[#252320] rounded text-[#5db8a6]">Verified</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-[#cc785c]/15 text-[#cc785c] rounded-full border border-[#cc785c]/30">
                  Sonnet 3.7 Engine
                </span>
              </div>
              
              {/* Card Inner Grid */}
              <div className="p-6 bg-[#1f1e1b] grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Left side: Growth Score */}
                <div className="rounded-xl border border-[#252320] bg-[#181715] p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-[#a09d96] tracking-wider">Growth Score</span>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="font-serif text-6xl text-[#faf9f5] tracking-tight">84</span>
                      <span className="text-sm font-mono text-[#a09d96]">/ 100</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    {[
                      { label: 'Local Visibility', score: 88, color: 'bg-[#5db872]' },
                      { label: 'Review Sentiment', score: 79, color: 'bg-[#e8a55a]' },
                      { label: 'Site Performance', score: 92, color: 'bg-[#5db872]' },
                      { label: 'Content Depth', score: 71, color: 'bg-[#e8a55a]' },
                    ].map(metric => (
                      <div key={metric.label}>
                        <div className="flex justify-between text-xs font-mono mb-1 text-[#a09d96]">
                          <span>{metric.label}</span>
                          <span className="text-[#faf9f5] font-semibold">{metric.score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#252320] rounded-full overflow-hidden">
                          <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Right side: Action Items */}
                <div className="flex flex-col justify-between space-y-3">
                  <span className="text-[11px] font-mono uppercase text-[#a09d96] tracking-wider">
                    Autonomous Action Queue
                  </span>
                  
                  <div className="space-y-2.5 flex-1">
                    <div className="p-3 rounded-lg border border-[#252320] bg-[#181715] space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[#c64545] uppercase">High Priority</span>
                      <h5 className="font-sans font-medium text-xs text-[#faf9f5]">Auto-reply to 6 unanswered reviews</h5>
                    </div>

                    <div className="p-3 rounded-lg border border-[#252320] bg-[#181715] space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[#e8a55a] uppercase">Medium Priority</span>
                      <h5 className="font-sans font-medium text-xs text-[#faf9f5]">Generate 3 missing geo-targeted landing pages</h5>
                    </div>

                    <div className="p-3 rounded-lg border border-[#252320] bg-[#181715] space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[#5db8a6] uppercase">Opportunity</span>
                      <h5 className="font-sans font-medium text-xs text-[#faf9f5]">Publish schema markup for dental implants</h5>
                    </div>
                  </div>

                  <Link to="/signup" className="pt-2">
                    <button className="w-full py-2 bg-[#252320] hover:bg-[#2e2c28] text-xs font-sans font-medium text-[#faf9f5] rounded-lg border border-[#252320] transition-colors">
                      Execute Plan with Claude
                    </button>
                  </Link>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
