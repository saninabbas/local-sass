import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FAQSection() {
  const faqs = [
    {
      question: 'What is Rankora?',
      answer: 'Rankora is an autonomous visual reasoning platform designed specifically for local enterprises. It audits your online footprint, tracks competitors, and deploys high-impact AI workflows to capture local market share.'
    },
    {
      question: 'Do I need technical SEO expertise?',
      answer: 'Not at all. Claude synthesizes raw technical data into human-readable, prioritized directives. Every recommendation comes with plain-English context and one-click execution.'
    },
    {
      question: 'How is the Growth Score calculated?',
      answer: 'The Growth Score is a verified benchmark (0-100) calculated across search visibility, local map pack rankings, customer review sentiment, and mobile page speed metrics.'
    },
    {
      question: 'Does this support multi-location businesses?',
      answer: 'Yes. The Pro Scale tier supports multiple physical branches with aggregated group reporting and location-specific local pack tracking.'
    },
    {
      question: 'How often does Claude re-audit my presence?',
      answer: 'Growth accounts receive automated weekly continuous re-audits. Pro accounts receive daily rank tracking updates and instant alert notifications.'
    },
    {
      question: 'Can I test the platform before committing?',
      answer: 'Yes. You can run a comprehensive free audit instantly with zero credit card required.'
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 sm:py-32 bg-[#faf9f5] border-b border-[#e6dfd8]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs font-mono uppercase tracking-[1.5px] text-[#cc785c] font-semibold">
            Common Inquiries
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-normal tracking-[-1px] text-[#141413] leading-[1.1]">
            Frequently asked questions.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`bg-[#efe9de] border ${isOpen ? 'border-[#cc785c]/40' : 'border-[#e6dfd8]'} rounded-xl overflow-hidden transition-all`}
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none hover:bg-[#e8e0d2] transition-colors"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="text-base font-serif font-medium text-[#141413]">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp size={18} className="text-[#cc785c] flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown size={18} className="text-[#6c6a64] flex-shrink-0 ml-4" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-0 border-t border-[#e6dfd8]/50">
                    <p className="text-sm text-[#3d3d3a] font-sans leading-relaxed pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
