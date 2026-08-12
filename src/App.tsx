import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Signup } from './pages/auth/Signup';
import { Login } from './pages/auth/Login';
import { Onboarding } from './pages/onboarding/Onboarding';
import { Dashboard } from './pages/dashboard/Dashboard';
import { PageLayout } from './components/layout/PageLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ActionPlan } from './pages/dashboard/ActionPlan';
import { Settings } from './pages/dashboard/Settings';

// Simple placeholder page component for remaining routes
function PlaceholderPage({ title }: { title: string }) {
  return (
    <PageLayout>
      <div className="py-32 bg-gray-50 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">{title}</h1>
          <p className="mt-6 text-lg text-secondary">This page is currently under development.</p>
        </div>
      </div>
    </PageLayout>
  );
}

import { DashboardLayout } from './components/dashboard/DashboardLayout';

function DashboardPlaceholder({ title }: { title: string }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-white rounded-2xl shadow-sm border border-gray-100 py-16 mt-6">
        <h2 className="text-3xl font-bold text-primary mb-4">{title}</h2>
        <p className="text-secondary mb-8 max-w-md">
          We are currently building this feature. Check back soon for detailed insights on your {title.toLowerCase()}.
        </p>
      </div>
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<PlaceholderPage title="Features" />} />
          <Route path="/how-it-works" element={<PlaceholderPage title="How It Works" />} />
          <Route path="/pricing" element={<PlaceholderPage title="Pricing" />} />
          <Route path="/resources" element={<PlaceholderPage title="Resources" />} />
          <Route path="/about" element={<PlaceholderPage title="About Us" />} />
          <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/score" element={<DashboardPlaceholder title="Growth Score" />} />
            <Route path="/dashboard/actions" element={<ActionPlan />} />
            <Route path="/dashboard/website" element={<DashboardPlaceholder title="Website Analysis" />} />
            <Route path="/dashboard/reviews" element={<DashboardPlaceholder title="Reviews Manager" />} />
            <Route path="/dashboard/reports" element={<DashboardPlaceholder title="Custom Reports" />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/*" element={<DashboardPlaceholder title="Page Not Found" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
