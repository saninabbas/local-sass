import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, AlertCircle, BarChart2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Explicit autofill for admin credentials
  const [email, setEmail] = useState('saninabbas@gmail.com');
  const [password, setPassword] = useState('Pakistan@2026');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();
      if (data.success) {
        await login({ email: email.trim(), password });
        if (data.data?.role === 'admin' || email.trim() === 'saninabbas@gmail.com') {
          navigate('/admin');
        } else {
          setError("Access denied. This account does not have administrator privileges.");
        }
      } else {
        setError(data.error || 'Invalid administrator credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Shield Badge */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20">
              <Shield size={26} />
            </div>
          </Link>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-primary-accent text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart2 size={13} /> Rankora Control Center
          </div>
          <h2 className="text-center text-3xl font-extrabold text-primary mb-2">
            Administrator Portal
          </h2>
          <p className="text-center text-sm text-secondary mb-8">
            Access user metrics, telemetry, and platform management
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white py-8 px-4 shadow-xl shadow-black/5 sm:rounded-2xl sm:px-10 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-danger text-sm rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <FormField
                label="Admin Email"
                id="admin-email"
                type="email"
                placeholder="saninabbas@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <FormField
                label="Admin Password"
                id="admin-password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-base h-12 flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    <span>Sign In to Admin Dashboard</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center pt-5 border-t border-gray-100">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Back to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
