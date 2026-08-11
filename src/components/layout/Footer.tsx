import { Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Resources', href: '/resources' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <BarChart2 size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">
                Local Growth AI
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-secondary max-w-xs">
              The AI-powered growth assistant for local businesses. Know where you stand and exactly what to fix next.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-primary">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.product.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm text-secondary hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-primary">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.company.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm text-secondary hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-primary">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.legal.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm text-secondary hover:text-primary transition-colors">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-100 pt-8 sm:mt-20 lg:mt-24 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm leading-5 text-gray-400">
            &copy; {currentYear} Local Growth AI. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
