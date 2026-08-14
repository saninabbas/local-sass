import { PageLayout } from '../../components/layout/PageLayout';
import { BookOpen, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Resources() {
  return (
    <PageLayout>
      <div className="bg-[#faf9f5] py-24 sm:py-32 border-b border-[#e6dfd8]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold">
              Knowledge Base & Field Guides
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-normal tracking-[-1px] text-[#141413]">
              Local Growth Resources
            </h1>
            <p className="text-sm text-[#6c6a64] font-sans">
              Comprehensive frameworks and technical documentation to master local search algorithms.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
            <div className="flex flex-col justify-between rounded-xl bg-[#efe9de] p-8 border border-[#e6dfd8] shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#faf9f5] text-[#cc785c] flex items-center justify-center border border-[#e6dfd8]">
                  <BookOpen size={20} />
                </div>
                <h3 className="font-serif font-medium text-lg text-[#141413]">Local Map Pack Field Guide</h3>
                <p className="text-xs text-[#3d3d3a] font-sans leading-relaxed">
                  The complete blueprint for conquering Google Maps 3-pack rankings across multi-zip service areas.
                </p>
              </div>
              <Link to="/signup" className="mt-6 text-xs font-medium text-[#cc785c] hover:text-[#a9583e] inline-flex items-center gap-1">
                Read Guide &rarr;
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-xl bg-[#efe9de] p-8 border border-[#e6dfd8] shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#faf9f5] text-[#5db8a6] flex items-center justify-center border border-[#e6dfd8]">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-serif font-medium text-lg text-[#141413]">Computer Use Agent Playbook</h3>
                <p className="text-xs text-[#3d3d3a] font-sans leading-relaxed">
                  How autonomous visual agents automate browser actions, review analysis, and citation verification.
                </p>
              </div>
              <Link to="/claude" className="mt-6 text-xs font-medium text-[#cc785c] hover:text-[#a9583e] inline-flex items-center gap-1">
                Explore Demo &rarr;
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-xl bg-[#efe9de] p-8 border border-[#e6dfd8] shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#faf9f5] text-[#e8a55a] flex items-center justify-center border border-[#e6dfd8]">
                  <FileText size={20} />
                </div>
                <h3 className="font-serif font-medium text-lg text-[#141413]">Enterprise Case Studies</h3>
                <p className="text-xs text-[#3d3d3a] font-sans leading-relaxed">
                  How regional healthcare clinics and multi-unit hospitality operators scale local lead capture with Rankora.
                </p>
              </div>
              <Link to="/signup" className="mt-6 text-xs font-medium text-[#cc785c] hover:text-[#a9583e] inline-flex items-center gap-1">
                Read Studies &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
