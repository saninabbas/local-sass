import { PageLayout } from '../../components/layout/PageLayout';
import { Mail } from 'lucide-react';

export function Contact() {
  return (
    <PageLayout>
      <div className="bg-[#faf9f5] py-24 sm:py-32 border-b border-[#e6dfd8]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold">
              Get in Touch
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-normal tracking-[-1px] text-[#141413]">
              Contact Rankora Support
            </h1>
            <p className="text-sm text-[#6c6a64] font-sans">
              Have questions about your audit telemetry or enterprise deployment? Our engineering team is here to assist.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-xl">
            <div className="bg-[#efe9de] p-8 rounded-2xl border border-[#e6dfd8] shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-none">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#cc785c] text-white">
                    <Mail size={20} />
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-serif font-medium text-[#141413]">Direct Support Desk</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#3d3d3a] font-sans">
                    Reach our technical support team at <a href="mailto:support@rankora.com" className="text-[#cc785c] font-medium hover:underline">support@rankora.com</a>. Enterprise SLA inquiries receive responses within 4 business hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
