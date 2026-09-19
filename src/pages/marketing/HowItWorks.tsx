import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Cpu, 
  Target, 
  Compass, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: Globe,
      title: "Enter Your Business URL",
      desc: "Our real-time crawler connects to your website, parsing DOM structure, metadata, schema markup, and technical server headers."
    },
    {
      num: "02",
      icon: Cpu,
      title: "7-Vector Diagnostic Audit",
      desc: "Scorankio tests your site across Local SEO, Technical hygiene, Content depth, Mobile UX, Performance, and Security protocols."
    },
    {
      num: "03",
      icon: Target,
      title: "SERP Competitor Reverse-Engineering",
      desc: "We benchmark your business against top local rivals, uncovering exact keyword gaps, schema omissions, and service page deficits."
    },
    {
      num: "04",
      icon: Compass,
      title: "Execute Prioritized AI Action Plan",
      desc: "Receive clear, step-by-step instructions categorized into Today, This Week, and This Month with estimated revenue impacts."
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#141413] font-sans flex flex-col justify-between selection:bg-[#cc785c] selection:text-white">
      <Navbar />

      <main className="flex-1">
        <section className="py-20 px-6 sm:px-8 border-b border-[#e6dfd8] bg-[#efe9de]/40">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efe9de] border border-[#e6dfd8] text-xs font-mono uppercase tracking-wider text-[#cc785c] mb-6 shadow-2xs">
              <Sparkles size={13} /> The Scorankio Method
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#141413] tracking-tight mb-6">
              How Scorankio turns local websites into <span className="italic text-[#cc785c]">search leaders</span>.
            </h1>
            <p className="text-base sm:text-lg text-[#6c6a64] max-w-2xl mx-auto leading-relaxed mb-8">
              Four automated steps from raw URL input to actionable roadmap and Google Map Pack elevation.
            </p>
          </div>
        </section>

        <section className="py-20 px-6 sm:px-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="bg-[#efe9de] p-8 rounded-2xl border border-[#e6dfd8] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-2xl font-bold text-[#cc785c]">{step.num}</span>
                      <div className="w-10 h-10 rounded-lg bg-[#faf9f5] border border-[#e6dfd8] flex items-center justify-center text-[#141413]">
                        <Icon size={20} />
                      </div>
                    </div>
                    <h3 className="text-xl font-serif font-medium text-[#141413] mb-3">{step.title}</h3>
                    <p className="text-xs text-[#6c6a64] leading-relaxed font-sans">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link to="/signup">
              <Button className="bg-[#cc785c] hover:bg-[#a9583e] text-white px-8 py-3 text-sm font-medium rounded-xl shadow-sm inline-flex items-center gap-2">
                Start Your Audit Now <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
