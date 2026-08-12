import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Signup } from './pages/auth/Signup';
import { Login } from './pages/auth/Login';
import { Onboarding } from './pages/onboarding/Onboarding';
import { Dashboard } from './pages/dashboard/Dashboard';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ActionPlan } from './pages/dashboard/ActionPlan';
import { Settings } from './pages/dashboard/Settings';
import { Reports } from './pages/dashboard/Reports';
import { Score } from './pages/dashboard/Score';
import { About } from './pages/marketing/About';
import { Contact } from './pages/marketing/Contact';
import { Privacy } from './pages/marketing/Privacy';
import { Terms } from './pages/marketing/Terms';
import { Resources } from './pages/marketing/Resources';
import { Website } from './pages/dashboard/Website';
import { Reviews } from './pages/dashboard/Reviews';
import { Competitors } from './pages/dashboard/Competitors';

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
          <Route path="/resources" element={<Resources />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/score" element={<Score />} />
            <Route path="/dashboard/actions" element={<ActionPlan />} />
            <Route path="/dashboard/website" element={<Website />} />
            <Route path="/dashboard/competitors" element={<Competitors />} />
            <Route path="/dashboard/reviews" element={<Reviews />} />
            <Route path="/dashboard/reports" element={<Reports />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/*" element={<DashboardPlaceholder title="Page Not Found" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
