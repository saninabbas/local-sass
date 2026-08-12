import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FAQSection() {
  const faqs = [
    {
      question: 'What is Rankora?',
      answer: 'Rankora is an intelligent platform designed specifically for local businesses. It analyzes your online presence and provides a simple, actionable plan to help you attract more customers.'
    },
    {
      question: 'Do I need SEO knowledge?',
      answer: 'Not at all. We built this specifically for business owners who don\'t have time to learn technical SEO. Our AI explains everything in plain English and tells you exactly what to do.'
    },
    {
      question: 'How does the Growth Score work?',
      answer: 'Your Growth Score is a single number from 0 to 100 that represents your overall online health. It\'s calculated by analyzing factors across your website, Google Business Profile, and reviews.'
    },
    {
      question: 'Will this work for my specific type of business?',
      answer: 'Whether you run a dental clinic, a restaurant, a law firm, or a hair salon, if you serve local customers, Rankora can help you improve your online visibility.'
    },
    {
      question: 'How often should I check my score?',
      answer: 'We recommend checking in once a week. We\'ll send you a simple weekly report highlighting any changes to your score and new recommendations.'
    },
    {
      question: 'Is the first audit free?',
      answer: 'Yes, you can run a free initial audit to see your Growth Score and get a preview of the issues holding your business back.'
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 sm:py-32 bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`bg-white border ${isOpen ? 'border-gray-300 shadow-sm' : 'border-gray-200'} rounded-xl overflow-hidden transition-all`}
              >
                <button
                  className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="text-lg font-bold text-primary">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp size={24} className="text-secondary flex-shrink-0 ml-6" />
                  ) : (
                    <ChevronDown size={24} className="text-secondary flex-shrink-0 ml-6" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-8 pb-8 pt-0">
                    <p className="text-lg text-secondary leading-relaxed">{faq.answer}</p>
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
