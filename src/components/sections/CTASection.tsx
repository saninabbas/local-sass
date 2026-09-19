import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 bg-[#faf9f5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-16 rounded-2xl bg-[#cc785c] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal leading-tight">
              See what is holding your local business back.
            </h2>
            <p className="font-sans text-white/90 text-base leading-relaxed">
              Run your free audit today and receive an immediate AI action plan.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link
              to="/dashboard"
              className="px-8 py-3.5 bg-[#faf9f5] text-[#141413] text-sm font-medium rounded-lg hover:bg-[#efe9de] transition-colors shadow-md flex items-center gap-2"
            >
              <span>Start Free Audit</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
