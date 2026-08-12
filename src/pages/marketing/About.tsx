import { PageLayout } from '../../components/layout/PageLayout';

export function About() {
  return (
    <PageLayout>
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-extrabold tracking-tight text-primary sm:text-6xl">About Rankora</h2>
            <p className="mt-6 text-lg leading-8 text-secondary">
              Rankora was founded on a simple premise: local businesses deserve access to the same high-end digital growth tools that large corporations use, but without the complexity and enterprise pricing.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-primary">
                  Our Mission
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-secondary">
                  <p className="flex-auto">To empower local business owners with AI-driven insights that translate directly into foot traffic, online visibility, and revenue growth.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-primary">
                  Data-Driven
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-secondary">
                  <p className="flex-auto">We don't believe in guesswork. Our audit engine analyzes hundreds of specific signals across SEO, website performance, and local directories to build your Growth Score.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-primary">
                  Action-Oriented
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-secondary">
                  <p className="flex-auto">An audit is useless if you don't know what to do next. That's why every Rankora audit comes with a prioritized, step-by-step AI Action Plan.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
