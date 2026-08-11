import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function CTASection() {
  return (
    <section className="py-24 sm:py-32 bg-primary relative overflow-hidden">
      {/* Subtle background depth without heavy gradients */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-6">
            See what is holding your business back.
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 mb-10">
            Run your free audit and get a clear AI-powered action plan.
          </p>
          <div className="flex justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold px-8 shadow-sm hover:shadow-md">
                Start Free Audit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
