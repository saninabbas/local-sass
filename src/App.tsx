import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Signup } from './pages/auth/Signup';
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { Onboarding } from './pages/onboarding/Onboarding';

import { AuthProvider } from './contexts/AuthContext';
import { BusinessProvider } from './context/BusinessContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { About } from './pages/marketing/About';
import { Contact } from './pages/marketing/Contact';
import { Privacy } from './pages/marketing/Privacy';
import { Terms } from './pages/marketing/Terms';
import { Resources } from './pages/marketing/Resources';
import { Features } from './pages/marketing/Features';
import { HowItWorks } from './pages/marketing/HowItWorks';
import { Pricing } from './pages/marketing/Pricing';
import { PublicReport } from './pages/report/PublicReport';
import { ClaudeShowcasePage } from './pages/ClaudeShowcasePage';
import { AdminRoute } from './pages/admin/AdminRoute';

import { DashboardLayout } from './components/dashboard/DashboardLayout';

// Lazy load dashboard pages to optimize initial bundle size
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const Businesses = lazy(() => import('./pages/dashboard/Businesses').then(m => ({ default: m.Businesses })));
const ActionPlan = lazy(() => import('./pages/dashboard/ActionPlan').then(m => ({ default: m.ActionPlan })));
const Settings = lazy(() => import('./pages/dashboard/Settings').then(m => ({ default: m.Settings })));
const Reports = lazy(() => import('./pages/dashboard/Reports').then(m => ({ default: m.Reports })));
const Score = lazy(() => import('./pages/dashboard/Score').then(m => ({ default: m.Score })));
const Website = lazy(() => import('./pages/dashboard/Website').then(m => ({ default: m.Website })));
const Reviews = lazy(() => import('./pages/dashboard/Reviews').then(m => ({ default: m.Reviews })));
const Competitors = lazy(() => import('./pages/dashboard/Competitors').then(m => ({ default: m.Competitors })));
const Keywords = lazy(() => import('./pages/dashboard/Keywords').then(m => ({ default: m.Keywords })));
const Content = lazy(() => import('./pages/dashboard/Content').then(m => ({ default: m.Content })));
const Leads = lazy(() => import('./pages/dashboard/Leads').then(m => ({ default: m.Leads })));
const Account = lazy(() => import('./pages/dashboard/Account').then(m => ({ default: m.Account })));
const BacklinksAuthority = lazy(() => import('./pages/dashboard/AuthorityBuilder').then(m => ({ default: m.AuthorityBuilder })));
const GeoGrid = lazy(() => import('./pages/dashboard/GeoGrid').then(m => ({ default: m.GeoGrid })));
const Copilot = lazy(() => import('./pages/dashboard/Copilot').then(m => ({ default: m.Copilot })));
const Campaign = lazy(() => import('./pages/dashboard/Campaign').then(m => ({ default: m.Campaign })));
const KeywordDiscovery = lazy(() => import('./pages/dashboard/KeywordDiscovery').then(m => ({ default: m.KeywordDiscovery })));
const InternalLinks = lazy(() => import('./pages/dashboard/InternalLinks').then(m => ({ default: m.InternalLinks })));
const ChangeHistory = lazy(() => import('./pages/dashboard/ChangeHistory').then(m => ({ default: m.ChangeHistory })));
const Billing = lazy(() => import('./pages/dashboard/Billing').then(m => ({ default: m.Billing })));
const FreeAudit = lazy(() => import('./pages/FreeAudit').then(m => ({ default: m.FreeAudit })));

import { ErrorBoundary } from './components/ErrorBoundary';

function DashboardPlaceholder({ title }: { title: string }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-white rounded-2xl shadow-xs border border-gray-200 py-16 mt-6">
        <h2 className="text-xl font-bold text-primary mb-2">{title}</h2>
        <p className="text-secondary text-xs mb-6 max-w-md">
          This module is currently being synchronized. Return to your Overview.
        </p>
      </div>
    </DashboardLayout>
  );
}

function DashboardSuspense({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <DashboardLayout>
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
            <div className="h-8 w-8 border-2 border-primary-accent border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-secondary text-xs">Loading module telemetry...</p>
          </div>
        </DashboardLayout>
      }>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/api/auth/verify" element={<VerifyEmail />} />
            <Route path="/report/:id" element={<PublicReport />} />
            <Route path="/free-audit" element={<DashboardSuspense><FreeAudit /></DashboardSuspense>} />
            
            {/* Claude Computer Use & Design System Showcase */}
            <Route path="/claude" element={<ClaudeShowcasePage />} />
            <Route path="/computer-use" element={<ClaudeShowcasePage />} />
            <Route path="/claude-design" element={<ClaudeShowcasePage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/admin/login" element={<AdminRoute />} />
            <Route path="/admin/dashboard" element={<AdminRoute />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Lazy Loaded Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardSuspense><Dashboard /></DashboardSuspense>} />
              <Route path="/dashboard/businesses" element={<DashboardSuspense><Businesses /></DashboardSuspense>} />
              <Route path="/dashboard/websites" element={<DashboardSuspense><Businesses /></DashboardSuspense>} />
              <Route path="/dashboard/billing" element={<DashboardSuspense><Billing /></DashboardSuspense>} />
              <Route path="/dashboard/score" element={<DashboardSuspense><Score /></DashboardSuspense>} />
              <Route path="/dashboard/actions" element={<DashboardSuspense><ActionPlan /></DashboardSuspense>} />
              <Route path="/dashboard/website" element={<DashboardSuspense><Website /></DashboardSuspense>} />
              <Route path="/dashboard/competitors" element={<DashboardSuspense><Competitors /></DashboardSuspense>} />
              <Route path="/dashboard/keywords" element={<DashboardSuspense><Keywords /></DashboardSuspense>} />
              <Route path="/dashboard/copilot" element={<DashboardSuspense><Copilot /></DashboardSuspense>} />
              <Route path="/dashboard/content" element={<DashboardSuspense><Content /></DashboardSuspense>} />
              <Route path="/dashboard/leads" element={<DashboardSuspense><Leads /></DashboardSuspense>} />
              <Route path="/dashboard/reviews" element={<DashboardSuspense><Reviews /></DashboardSuspense>} />
              <Route path="/dashboard/reports" element={<DashboardSuspense><Reports /></DashboardSuspense>} />
              <Route path="/dashboard/settings" element={<DashboardSuspense><Settings /></DashboardSuspense>} />
              <Route path="/dashboard/account" element={<DashboardSuspense><Account /></DashboardSuspense>} />
              <Route path="/dashboard/backlinks" element={<DashboardSuspense><BacklinksAuthority /></DashboardSuspense>} />
              <Route path="/dashboard/authority" element={<DashboardSuspense><BacklinksAuthority /></DashboardSuspense>} />
              <Route path="/dashboard/campaign" element={<DashboardSuspense><Campaign /></DashboardSuspense>} />
              <Route path="/dashboard/keywords/discover" element={<DashboardSuspense><KeywordDiscovery /></DashboardSuspense>} />
              <Route path="/dashboard/content/links" element={<DashboardSuspense><InternalLinks /></DashboardSuspense>} />
              <Route path="/dashboard/internal-links" element={<DashboardSuspense><InternalLinks /></DashboardSuspense>} />
              <Route path="/dashboard/changes" element={<DashboardSuspense><ChangeHistory /></DashboardSuspense>} />
              <Route path="/dashboard/geogrid" element={<DashboardSuspense><GeoGrid /></DashboardSuspense>} />
              
              <Route path="/dashboard/*" element={<DashboardPlaceholder title="Page Not Found" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BusinessProvider>
    </AuthProvider>
  );
}

export default App;
