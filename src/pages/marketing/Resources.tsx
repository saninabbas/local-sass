import { PageLayout } from '../../components/layout/PageLayout';
import { BookOpen, Video, FileText } from 'lucide-react';

export function Resources() {
  return (
    <PageLayout>
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Growth Resources</h2>
            <p className="mt-2 text-lg leading-8 text-secondary">
              Everything you need to master local SEO and grow your business online.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
            <div className="flex gap-x-4 rounded-xl bg-gray-50 p-6 ring-1 ring-inset ring-gray-200">
              <BookOpen className="h-7 w-5 flex-none text-primary-accent" aria-hidden="true" />
              <div className="text-base leading-7">
                <h3 className="font-semibold text-primary">Local SEO Guide</h3>
                <p className="mt-2 text-secondary">The complete guide to dominating your local market search results.</p>
                <p className="mt-4 text-sm font-semibold text-primary-accent cursor-pointer hover:underline">Read Guide &rarr;</p>
              </div>
            </div>
            <div className="flex gap-x-4 rounded-xl bg-gray-50 p-6 ring-1 ring-inset ring-gray-200">
              <Video className="h-7 w-5 flex-none text-primary-accent" aria-hidden="true" />
              <div className="text-base leading-7">
                <h3 className="font-semibold text-primary">Video Tutorials</h3>
                <p className="mt-2 text-secondary">Step-by-step video lessons on fixing your most critical growth blockers.</p>
                <p className="mt-4 text-sm font-semibold text-primary-accent cursor-pointer hover:underline">Watch Videos &rarr;</p>
              </div>
            </div>
            <div className="flex gap-x-4 rounded-xl bg-gray-50 p-6 ring-1 ring-inset ring-gray-200">
              <FileText className="h-7 w-5 flex-none text-primary-accent" aria-hidden="true" />
              <div className="text-base leading-7">
                <h3 className="font-semibold text-primary">Case Studies</h3>
                <p className="mt-2 text-secondary">Learn how other local businesses used Rankora to double their foot traffic.</p>
                <p className="mt-4 text-sm font-semibold text-primary-accent cursor-pointer hover:underline">Read Studies &rarr;</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
