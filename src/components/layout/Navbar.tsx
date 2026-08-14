import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Features', href: '/#features' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Resources', href: '/resources' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const id = href.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMobileMenuOpen(false);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#e6dfd8] bg-[#faf9f5]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
            <Link to="/" className="flex items-center py-1">
              <img 
                src="/brand/logo.svg" 
                alt="Rankora" 
                className="w-[105px] sm:w-[125px] h-auto object-contain transition-transform hover:scale-105" 
              />
            </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`text-[14px] font-medium transition-colors ${
                    isActive(item.href) ? 'text-[#cc785c] font-semibold' : 'text-[#3d3d3a] hover:text-[#141413]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Desktop CTAs */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-6">
              <Link to="/login" className="text-[14px] font-medium text-[#3d3d3a] hover:text-[#141413] transition-colors">
                Log in
              </Link>
              <Link
                to="/dashboard"
                className="h-10 px-5 bg-[#cc785c] text-white text-[14px] font-medium rounded-lg hover:bg-[#a9583e] active:bg-[#a9583e] transition-colors flex items-center justify-center shadow-sm"
              >
                Start Free Audit
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-[#6c6a64] hover:bg-[#efe9de] hover:text-[#141413] focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6 text-[#141413]" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6 text-[#141413]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#e6dfd8] bg-[#faf9f5]">
          <div className="space-y-1 px-4 pb-3 pt-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block rounded-md px-4 py-3 text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-[#efe9de] text-[#cc785c]'
                    : 'text-[#3d3d3a] hover:bg-[#efe9de] hover:text-[#141413]'
                }`}
                onClick={(e) => handleNavClick(e, item.href)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-[#e6dfd8] pb-6 pt-6">
            <div className="flex flex-col space-y-3 px-6">
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-medium border border-[#e6dfd8] bg-[#faf9f5] rounded-lg text-[#141413]"
              >
                Log in
              </Link>
              <Link 
                to="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-medium bg-[#cc785c] text-white rounded-lg hover:bg-[#a9583e]"
              >
                Start Free Audit
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
