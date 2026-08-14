import { Link } from 'react-router-dom';
import { AnthropicLogo } from '../claude/AnthropicLogo';
import { socialLinks } from '../../config/social';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '/#features' },
      { name: 'How It Works', href: '/#how-it-works' },
      { name: 'Pricing', href: '/#pricing' },
      { name: 'Computer Use Agent', href: '/claude' },
      { name: 'Resources', href: '/resources' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  return (
    <footer className="bg-[#181715] text-[#a09d96] border-t border-[#252320] py-16 px-6 lg:px-12" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Bio */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-block">
              <AnthropicLogo size={24} color="#cc785c" showWordmark={true} wordmarkColor="#faf9f5" brandName="Rankora" />
            </Link>
            <p className="text-xs text-[#8e8b82] leading-relaxed max-w-xs font-sans">
              Autonomous AI growth systems and visual reasoning intelligence to scale local enterprises.
            </p>
            <div className="pt-2 flex space-x-4">
              <a href={socialLinks.twitter} className="text-[#8e8b82] hover:text-[#cc785c] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href={socialLinks.linkedin} className="text-[#8e8b82] hover:text-[#cc785c] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-[1.5px] text-[#faf9f5] font-semibold mb-4">Product</h3>
            <ul className="space-y-2.5 text-xs font-sans">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-[#a09d96] hover:text-[#faf9f5] transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-[1.5px] text-[#faf9f5] font-semibold mb-4">Company</h3>
            <ul className="space-y-2.5 text-xs font-sans">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-[#a09d96] hover:text-[#faf9f5] transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-[1.5px] text-[#faf9f5] font-semibold mb-4">Legal</h3>
            <ul className="space-y-2.5 text-xs font-sans">
              {footerLinks.legal.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-[#a09d96] hover:text-[#faf9f5] transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#252320] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-sans text-[#6c6a64]">
          <p>© {currentYear} Rankora Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/terms" className="hover:text-[#a09d96] transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-[#a09d96] transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
