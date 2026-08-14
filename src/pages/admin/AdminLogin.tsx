import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

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
    <div className="min-h-screen bg-[#faf9f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#141413]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-1.5">
            <img 
              src="/brand/logo.png" 
              alt="Rankora Logo" 
              className="h-10 w-auto object-contain scale-[1.3] -mr-1" 
            />
            <span className="text-2xl font-bold font-serif text-[#141413] tracking-tight">
              Rankora
            </span>
          </Link>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cc785c]/10 border border-[#cc785c]/25 text-[#cc785c] text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Shield size={13} /> Rankora Control Center
          </div>
          <h2 className="text-center text-3xl font-serif font-normal text-[#141413] mb-2">
            Administrator Portal
          </h2>
          <p className="text-center text-xs text-[#6c6a64] font-sans mb-8">
            Access user metrics, telemetry, and platform management
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#efe9de] py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-[#e6dfd8]">
          {error && (
            <div className="mb-6 p-3 bg-[#c64545]/15 border border-[#c64545]/30 text-[#c64545] text-xs font-mono rounded-lg flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
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

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full h-11 text-sm bg-[#cc785c] hover:bg-[#a9583e] flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    <span>Sign In to Admin Dashboard</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center pt-4 border-t border-[#e6dfd8]">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-medium text-[#6c6a64] hover:text-[#141413] transition-colors"
            >
              <ArrowLeft size={13} /> Back to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
