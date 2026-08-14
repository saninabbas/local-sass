import { PageLayout } from '../../components/layout/PageLayout';
import { BookOpen, Video, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Resources() {
  return (
    <PageLayout>
      <div className="bg-[#faf9f5] py-24 sm:py-32 border-b border-[#e6dfd8]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-[#141413]">Growth Resources</h2>
            <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#6c6a64] font-sans">
              Everything you need to master local SEO and grow your business online.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
            <div className="flex flex-col justify-between rounded-xl bg-[#efe9de] p-8 border border-[#e6dfd8] shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#faf9f5] text-[#cc785c] flex items-center justify-center border border-[#e6dfd8]">
                  <BookOpen size={20} />
                </div>
                <h3 className="font-serif font-medium text-lg text-[#141413]">Local SEO Guide</h3>
                <p className="text-xs text-[#3d3d3a] font-sans leading-relaxed">
                  The complete guide to dominating your local market search results.
                </p>
              </div>
              <Link to="/signup" className="mt-6 text-xs font-medium text-[#cc785c] hover:text-[#a9583e] inline-flex items-center gap-1">
                Read Guide &rarr;
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-xl bg-[#efe9de] p-8 border border-[#e6dfd8] shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#faf9f5] text-[#cc785c] flex items-center justify-center border border-[#e6dfd8]">
                  <Video size={20} />
                </div>
                <h3 className="font-serif font-medium text-lg text-[#141413]">Video Tutorials</h3>
                <p className="text-xs text-[#3d3d3a] font-sans leading-relaxed">
                  Step-by-step video lessons on fixing your most critical growth blockers.
                </p>
              </div>
              <Link to="/signup" className="mt-6 text-xs font-medium text-[#cc785c] hover:text-[#a9583e] inline-flex items-center gap-1">
                Watch Videos &rarr;
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-xl bg-[#efe9de] p-8 border border-[#e6dfd8] shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#faf9f5] text-[#cc785c] flex items-center justify-center border border-[#e6dfd8]">
                  <FileText size={20} />
                </div>
                <h3 className="font-serif font-medium text-lg text-[#141413]">Case Studies</h3>
                <p className="text-xs text-[#3d3d3a] font-sans leading-relaxed">
                  Learn how other local businesses used Rankora to double their foot traffic.
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
