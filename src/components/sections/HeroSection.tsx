import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40 bg-background border-b border-gray-100">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-8 items-center">
          
          {/* Left Column: Copy & CTA */}
          <div className="xl:col-span-5 max-w-2xl mx-auto xl:mx-0 text-center xl:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-primary-accent text-sm font-semibold mb-8">
              AI-powered growth for local businesses
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-primary leading-[1.1] mb-8">
              Grow Your Local Business With AI
            </h1>
            
            <p className="text-xl sm:text-2xl text-secondary leading-relaxed mb-12 max-w-lg mx-auto xl:mx-0">
              See what is holding your business back, get a clear action plan, and improve your online presence with AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-5 mb-5">
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full shadow-md text-lg px-8 h-14">
                  Start Free Audit
                </Button>
              </Link>
              <Link to="/how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full border-gray-200 text-lg px-8 h-14 bg-white">
                  See How It Works
                </Button>
              </Link>
            </div>
            
            <p className="text-base text-secondary font-medium">
              No credit card required · Takes about 2 minutes
            </p>
          </div>

          {/* Right Column: Dashboard Preview */}
          <div className="xl:col-span-7 relative mx-auto w-full xl:pl-12">
            <div className="relative rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden ring-1 ring-black/5 transform xl:scale-105 origin-left">
              
              {/* Dashboard Header Mock */}
              <div className="border-b border-gray-100 bg-white px-8 py-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">Good morning</h3>
                  <p className="text-xl font-bold text-primary flex items-center gap-3">
                    ABC Dental 
                    <span className="text-sm font-medium px-2.5 py-0.5 bg-gray-100 rounded-md text-secondary">Islamabad</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base">
                  S
                </div>
              </div>
              
              {/* Dashboard Content Mock */}
              <div className="p-8 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-8 min-h-[440px]">
                
                {/* Left side: Growth Score */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-primary mb-1">Growth Score</h4>
                      <p className="text-sm text-secondary mb-6">Last updated today</p>
                      <div className="flex items-end gap-2 mb-8">
                        <span className="text-[80px] font-black text-primary tracking-tighter leading-none">78</span>
                        <span className="text-xl font-medium text-secondary mb-2">/ 100</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: 'SEO', score: 82, bg: 'bg-success' },
                        { label: 'Reviews', score: 74, bg: 'bg-warning' },
                        { label: 'Website', score: 86, bg: 'bg-success' },
                        { label: 'Visibility', score: 69, bg: 'bg-warning' },
                      ].map(metric => (
                        <div key={metric.label}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-secondary font-medium">{metric.label}</span>
                            <span className="font-bold text-primary">{metric.score}</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${metric.bg} w-[${metric.score}%] rounded-full`} style={{ width: `${metric.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right side: Action Plan */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-primary">AI Growth Plan</h4>
                  </div>
                  
                  <div className="space-y-3 flex-1 overflow-hidden">
                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-danger uppercase tracking-wider">High Priority</span>
                      <h5 className="font-semibold text-primary text-base">8 reviews need replies</h5>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-warning uppercase tracking-wider">Medium Priority</span>
                      <h5 className="font-semibold text-primary text-base">3 service pages missing</h5>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-warning uppercase tracking-wider">Medium Priority</span>
                      <h5 className="font-semibold text-primary text-base">2 technical issues</h5>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider">Opportunity</span>
                      <h5 className="font-semibold text-primary text-base">5 content opportunities</h5>
                    </div>
                  </div>

                  <Button variant="outline" size="md" className="w-full mt-6 font-semibold text-base bg-white h-12">
                    View Action Plan
                  </Button>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
