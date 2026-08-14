export function ProductPreviewSection() {
  return (
    <section className="py-24 sm:py-32 bg-[#faf9f5] border-b border-[#e6dfd8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-normal tracking-[-1px] text-[#141413] leading-[1.1]">
            Everything you need to know about your local growth.
          </h2>
          <p className="text-base text-[#3d3d3a] font-sans">
            One simple dashboard for your website, visibility, reviews, and next steps.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-[#e6dfd8] bg-[#181715] text-[#faf9f5] shadow-2xl overflow-hidden">
            {/* Browser/App Header */}
            <div className="border-b border-[#252320] bg-[#181715] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/brand/logo.png" 
                  alt="Rankora Logo" 
                  className="h-6 w-auto object-contain brightness-200" 
                />
                <span className="font-serif font-bold text-sm text-[#faf9f5]">Rankora</span>
                <div className="flex space-x-1.5 ml-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#c64545]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#d4a017]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5db872]"></div>
                </div>
              </div>
              <div className="flex bg-[#141413] rounded-md px-3.5 py-1 border border-[#252320]">
                <span className="text-xs font-mono text-[#a09d96]">app.rankora.com/dashboard</span>
              </div>
              <div className="text-xs font-mono text-[#5db872] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5db872] animate-pulse"></span>
                <span>Live Data</span>
              </div>
            </div>

            {/* App Content */}
            <div className="p-8 bg-[#1f1e1b] flex flex-col gap-8">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#252320]">
                <div>
                  <h3 className="text-2xl font-serif font-normal text-[#faf9f5]">ABC Dental</h3>
                  <p className="text-xs text-[#a09d96] font-sans mt-1">Growth Score and Recommendations</p>
                </div>
                <button className="px-4 py-2 bg-[#252320] hover:bg-[#2e2c28] text-xs font-sans font-medium text-[#faf9f5] rounded-lg border border-[#252320]">
                  Download Report
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Score Card */}
                <div className="col-span-1 bg-[#181715] p-6 rounded-xl border border-[#252320] shadow-sm flex flex-col justify-center items-center">
                  <h4 className="text-xs font-mono text-[#a09d96] uppercase tracking-widest mb-4">Growth Score</h4>
                  <div className="relative w-36 h-36 mx-auto mb-3">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#252320" strokeWidth="7" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#cc785c" strokeWidth="7" strokeDasharray="283" strokeDashoffset="62" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-serif font-normal text-[#faf9f5]">78</span>
                      <span className="text-[10px] font-mono text-[#a09d96]">/ 100</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#5db872] bg-[#5db872]/15 px-3 py-1 rounded-full border border-[#5db872]/30">
                    +6 points this month
                  </span>
                </div>

                {/* Sub Scores */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                  {[
                    { name: 'SEO', score: 82, change: '+4' },
                    { name: 'Reviews', score: 74, change: '+8' },
                    { name: 'Website', score: 86, change: '+2' },
                    { name: 'Visibility', score: 69, change: '+11' }
                  ].map(metric => (
                    <div key={metric.name} className="bg-[#181715] p-5 rounded-xl border border-[#252320] shadow-sm flex flex-col justify-between">
                      <h4 className="text-xs font-sans text-[#a09d96] mb-3">{metric.name}</h4>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-serif font-normal text-[#faf9f5]">{metric.score}</span>
                        <span className="text-xs font-mono text-[#5db872]">
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Improvements */}
                <div className="bg-[#181715] p-6 rounded-xl border border-[#252320] shadow-sm">
                  <h4 className="text-sm font-serif font-normal text-[#faf9f5] mb-4">Recent Improvements</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-[#252320]">
                      <div>
                        <h5 className="text-xs font-sans font-medium text-[#faf9f5]">Fixed 3 broken links</h5>
                        <p className="text-[11px] text-[#a09d96] mt-0.5">Completed yesterday</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#5db872] bg-[#5db872]/15 px-2 py-0.5 rounded">
                        +2 pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-sans font-medium text-[#faf9f5]">Added business hours to Google Profile</h5>
                        <p className="text-[11px] text-[#a09d96] mt-0.5">Completed 3 days ago</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#5db872] bg-[#5db872]/15 px-2 py-0.5 rounded">
                        +4 pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Action Plan Snippet */}
                <div className="bg-[#181715] p-6 rounded-xl border border-[#252320] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-serif font-normal text-[#faf9f5]">Next Actions</h4>
                    <span className="text-[10px] font-mono text-[#cc785c] bg-[#cc785c]/15 px-2.5 py-0.5 rounded-full border border-[#cc785c]/30">
                      4 Pending
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-[#c64545] mt-1 shrink-0"></div>
                      <div>
                        <h5 className="text-xs font-sans font-medium text-[#faf9f5]">Respond to 8 unanswered reviews</h5>
                        <p className="text-[11px] text-[#a09d96] mt-0.5">High impact on review score</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 pt-1">
                      <div className="w-2 h-2 rounded-full bg-[#e8a55a] mt-1 shrink-0"></div>
                      <div>
                        <h5 className="text-xs font-sans font-medium text-[#faf9f5]">Create missing service pages</h5>
                        <p className="text-[11px] text-[#a09d96] mt-0.5">Teeth Whitening, Root Canal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
