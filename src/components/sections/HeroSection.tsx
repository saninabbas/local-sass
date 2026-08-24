import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40 bg-[#faf9f5] border-b border-[#e6dfd8]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-8 items-center">
          
          {/* Left Column: Copy & CTA */}
          <div className="xl:col-span-5 max-w-2xl mx-auto xl:mx-0 text-center xl:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-[#cc785c] text-xs font-semibold uppercase tracking-wider mb-8">
              AI Local Growth Operating System
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-serif font-normal tracking-[-1.5px] text-[#141413] leading-[1.05] mb-8">
              Find Out Why Your Local Business Isn't Ranking.
            </h1>
            
            <p className="text-lg sm:text-xl text-[#3d3d3a] leading-relaxed mb-10 max-w-lg mx-auto xl:mx-0 font-sans">
              Rankora audits your website, analyzes your competitors, tracks local visibility, and gives you an AI-powered plan to grow, all from one dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-4 mb-5">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-[#cc785c] hover:bg-[#a9583e] text-white shadow-sm font-medium px-8 h-12 rounded-lg text-base">
                  Start Free Audit
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-[#e6dfd8] text-[#141413] px-8 h-12 text-base rounded-lg bg-[#faf9f5] hover:bg-[#efe9de]">
                  See How It Works
                </Button>
              </a>
            </div>
            
            <p className="text-xs text-[#6c6a64] font-sans">
              Free &bull; No credit card required &bull; Setup in 2 minutes
            </p>
          </div>

          {/* Right Column: Dashboard Preview in Claude Dark/Cream Chrome */}
          <div className="xl:col-span-7 relative mx-auto w-full xl:pl-12">
            <div className="relative rounded-2xl border border-[#e6dfd8] bg-[#181715] text-[#faf9f5] shadow-2xl overflow-hidden transform xl:scale-105 origin-left">
              
              {/* Dashboard Header Mock */}
              <div className="border-b border-[#252320] bg-[#181715] px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#a09d96] mb-1">Good morning</h3>
                  <p className="text-lg sm:text-xl font-serif font-medium text-[#faf9f5] flex items-center gap-2 sm:gap-3 flex-wrap">
                    ABC Dental 
                    <span className="text-xs font-sans font-medium px-2.5 py-0.5 bg-[#252320] rounded-md text-[#a09d96]">United States</span>
                  </p>
                </div>
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#cc785c] flex items-center justify-center text-white font-serif font-bold text-sm sm:text-base shadow-sm shrink-0">
                  A
                </div>
              </div>
              
              {/* Dashboard Content Mock */}
              <div className="p-4 sm:p-8 bg-[#1f1e1b] grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-[380px]">
                
                {/* Left side: Growth Score */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#252320] bg-[#181715] p-4 sm:p-6 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#a09d96] mb-1">Growth Score</h4>
                      <p className="text-xs text-[#6c6a64] font-sans mb-4 sm:mb-6">Last updated today</p>
                      <div className="flex items-baseline gap-2 mb-4 sm:mb-6">
                        <span className="text-5xl sm:text-[72px] font-serif font-normal text-[#faf9f5] tracking-tight leading-none">78</span>
                        <span className="text-sm font-mono text-[#a09d96]">/ 100</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-2 border-t border-[#252320]">
                      {[
                        { label: 'SEO', score: 82, color: 'bg-[#5db872]' },
                        { label: 'Reviews', score: 74, color: 'bg-[#e8a55a]' },
                        { label: 'Website', score: 86, color: 'bg-[#5db872]' },
                        { label: 'Visibility', score: 69, color: 'bg-[#e8a55a]' },
                      ].map(metric => (
                        <div key={metric.label}>
                          <div className="flex justify-between text-xs font-mono mb-1 text-[#a09d96]">
                            <span>{metric.label}</span>
                            <span className="text-[#faf9f5] font-semibold">{metric.score}</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#252320] rounded-full overflow-hidden">
                            <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right side: Action Plan */}
                <div className="flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#a09d96]">AI Growth Plan</h4>
                  </div>
                  
                  <div className="space-y-2.5 flex-1">
                    <div className="p-3 rounded-lg border border-[#252320] bg-[#181715] flex flex-col gap-1">
                      <span className="text-[10px] font-mono font-bold text-[#c64545] uppercase tracking-wider">High Priority</span>
                      <h5 className="font-sans font-medium text-xs text-[#faf9f5]">8 reviews need replies</h5>
                    </div>

                    <div className="p-3 rounded-lg border border-[#252320] bg-[#181715] flex flex-col gap-1">
                      <span className="text-[10px] font-mono font-bold text-[#e8a55a] uppercase tracking-wider">Medium Priority</span>
                      <h5 className="font-sans font-medium text-xs text-[#faf9f5]">3 service pages missing</h5>
                    </div>

                    <div className="p-3 rounded-lg border border-[#252320] bg-[#181715] flex flex-col gap-1">
                      <span className="text-[10px] font-mono font-bold text-[#e8a55a] uppercase tracking-wider">Medium Priority</span>
                      <h5 className="font-sans font-medium text-xs text-[#faf9f5]">2 technical issues</h5>
                    </div>

                    <div className="p-3 rounded-lg border border-[#252320] bg-[#181715] flex flex-col gap-1">
                      <span className="text-[10px] font-mono font-bold text-[#5db8a6] uppercase tracking-wider">Opportunity</span>
                      <h5 className="font-sans font-medium text-xs text-[#faf9f5]">5 content opportunities</h5>
                    </div>
                  </div>

                  <Link to="/signup" className="pt-4">
                    <Button variant="secondary" size="md" className="w-full text-xs font-sans h-10 bg-[#252320] text-[#faf9f5] border-[#252320] hover:bg-[#2e2c28]">
                      View Action Plan
                    </Button>
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
