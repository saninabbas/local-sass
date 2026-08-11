import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary-accent selection:text-white">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
