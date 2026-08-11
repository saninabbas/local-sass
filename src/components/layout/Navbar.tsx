import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BarChart2 } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Features', href: '/features' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Resources', href: '/resources' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <BarChart2 size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">
                Local Growth AI
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-semibold transition-colors hover:text-primary ${
                    isActive(item.href) ? 'text-primary' : 'text-secondary'
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
              <Link to="/login" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
                Log in
              </Link>
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="font-semibold px-5 shadow-sm">
                  Start Free Audit
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-secondary hover:bg-gray-100 hover:text-primary focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="space-y-1 px-4 pb-3 pt-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block rounded-md px-4 py-3 text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-gray-50 text-primary'
                    : 'text-secondary hover:bg-gray-50 hover:text-primary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 pb-6 pt-6">
            <div className="flex flex-col space-y-4 px-6">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full justify-center">Log in</Button>
              </Link>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full justify-center">Start Free Audit</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
