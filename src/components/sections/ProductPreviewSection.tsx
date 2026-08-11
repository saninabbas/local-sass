import { Button } from '../ui/Button';

export function ProductPreviewSection() {
  return (
    <section className="py-24 sm:py-32 bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl mb-6">
            Everything you need to know about your local growth.
          </h2>
          <p className="text-xl text-secondary">
            One simple dashboard for your website, visibility, reviews, and next steps.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden ring-1 ring-black/5">
            {/* Browser/App Header */}
            <div className="border-b border-gray-100 bg-white px-8 py-5 flex items-center justify-between">
              <div className="flex space-x-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-400"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-400"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-400"></div>
              </div>
              <div className="flex bg-gray-50 rounded-md px-4 py-2 border border-gray-100">
                <span className="text-sm font-medium text-gray-400">app.localgrowth.ai</span>
              </div>
              <div className="w-20"></div> {/* Spacer for balance */}
            </div>

            {/* App Content */}
            <div className="p-10 bg-gray-50 flex flex-col gap-10">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-primary">Overview</h3>
                  <p className="text-base text-secondary mt-2">Here is what happened with your business this week.</p>
                </div>
                <Button size="md" variant="outline" className="bg-white">Download Report</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Score Card */}
                <div className="col-span-1 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center">
                  <h4 className="text-base font-semibold text-secondary uppercase tracking-widest mb-6">Growth Score</h4>
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#2563EB" strokeWidth="8" strokeDasharray="283" strokeDashoffset="62" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-primary tracking-tighter">78</span>
                    </div>
                  </div>
                  <span className="text-base font-medium text-success bg-green-50 px-3 py-1 rounded-full border border-green-100">+3 points this week</span>
                </div>

                {/* Sub Scores */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6">
                  {[
                    { name: 'SEO', score: 82, change: '+5' },
                    { name: 'Reviews', score: 74, change: '-1' },
                    { name: 'Website', score: 86, change: '0' },
                    { name: 'Visibility', score: 69, change: '+2' }
                  ].map(metric => (
                    <div key={metric.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                      <h4 className="text-base font-medium text-secondary mb-4">{metric.name}</h4>
                      <div className="flex items-end justify-between">
                        <span className="text-4xl font-bold text-primary">{metric.score}</span>
                        <span className={`text-base font-medium ${metric.change.startsWith('+') ? 'text-success' : metric.change === '0' ? 'text-gray-400' : 'text-danger'}`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recent Improvements */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="text-lg font-bold text-primary mb-6">Recent Improvements</h4>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                      <div>
                        <h5 className="text-base font-semibold text-primary">Responded to 3 Google Reviews</h5>
                        <p className="text-sm text-secondary mt-1">Completed 2 days ago</p>
                      </div>
                      <span className="text-sm font-bold text-success bg-green-50 px-3 py-1.5 rounded border border-green-100">+2 Score</span>
                    </div>
                    <div className="flex items-center justify-between pb-2">
                      <div>
                        <h5 className="text-base font-semibold text-primary">Added operating hours to Yelp</h5>
                        <p className="text-sm text-secondary mt-1">Completed 4 days ago</p>
                      </div>
                      <span className="text-sm font-bold text-success bg-green-50 px-3 py-1.5 rounded border border-green-100">+1 Score</span>
                    </div>
                  </div>
                </div>

                {/* AI Action Plan Snippet */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-primary">Next Actions</h4>
                    <span className="text-sm font-semibold text-primary-accent bg-blue-50 px-3 py-1 rounded-full border border-blue-100">8 High Priority</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-danger mt-2"></div>
                      <div>
                        <h5 className="text-base font-semibold text-primary">Draft replies for 8 Google Reviews</h5>
                        <p className="text-sm text-secondary mt-1">AI has prepared drafts for your review.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pt-2">
                      <div className="w-2 h-2 rounded-full bg-warning mt-2"></div>
                      <div>
                        <h5 className="text-base font-semibold text-primary">Create "Teeth Whitening" page</h5>
                        <p className="text-sm text-secondary mt-1">Missing dedicated service page.</p>
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
