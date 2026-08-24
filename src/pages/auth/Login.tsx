import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ShieldCheck } from 'lucide-react';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const initialError = searchParams.get('error') 
    ? (searchParams.get('error') === 'google_auth_not_configured' 
        ? 'Google OAuth is not configured on the server. Please sign in with email and password.'
        : searchParams.get('error') === 'redirect_uri_mismatch'
        ? 'Google OAuth redirect URI is pending whitelist in Google Cloud Console. Please use email/password login.'
        : decodeURIComponent(searchParams.get('error') || 'Authentication issue occurred.'))
    : '';
  const [error, setError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (requires2FA) {
        const res = await fetch('/api/auth/2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tempToken, code: totpCode })
        });
        const data = await res.json();
        if (data.success) {
          navigate('/dashboard');
          window.location.reload();
        } else {
          setError(data.error || 'Invalid 2FA verification code');
        }
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password })
        });
        const data = await res.json();
        if (data.success) {
          if (data.require2FA) {
            setRequires2FA(true);
            setTempToken(data.tempToken);
          } else {
            await login(data.data || { email: email.trim(), password });
            navigate('/dashboard');
          }
        } else {
          setError(data.error || 'Invalid credentials');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#141413]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center justify-center">
            <img 
              src="/brand/logo.svg" 
              alt="Rankora" 
              className="w-[130px] sm:w-[150px] h-auto object-contain transition-transform hover:scale-105" 
            />
          </Link>
        </div>

        <h2 className="text-center text-3xl font-serif font-normal text-[#141413] mb-8">
          {requires2FA ? 'Two-Factor Authentication' : 'Welcome back'}
        </h2>

        <div className="bg-[#efe9de] py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-[#e6dfd8]">
          {error && (
            <div className="mb-4 p-3 bg-[#c64545]/15 border border-[#c64545]/30 text-[#c64545] text-xs font-mono rounded-lg">
              {error}
            </div>
          )}

          {requires2FA ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="text-center mb-2">
                <ShieldCheck className="mx-auto text-[#cc785c] mb-2" size={36} />
                <p className="text-xs text-[#6c6a64] font-sans">
                  Please enter the 6-digit verification code from your authenticator app.
                </p>
              </div>
              <FormField
                label="Security Code"
                id="totpCode"
                type="text"
                placeholder="123456"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" size="md" className="w-full h-11 text-sm bg-[#cc785c] hover:bg-[#a9583e]" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Log In'}
              </Button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={handleSubmit}>
              <FormField
                label="Email"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FormField
                label="Password"
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex items-center justify-between text-xs font-sans pt-1">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-3.5 w-3.5 text-[#cc785c] focus:ring-[#cc785c] border-[#e6dfd8] rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-[#3d3d3a]">Remember me</label>
                </div>
                <div>
                  <Link to="/forgot-password" className="font-medium text-[#cc785c] hover:text-[#a9583e] transition-colors cursor-pointer">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" variant="primary" size="md" className="w-full h-11 text-sm bg-[#cc785c] hover:bg-[#a9583e] font-medium" disabled={isLoading}>
                  {isLoading ? 'Logging In...' : 'Log In'}
                </Button>
              </div>
            </form>
          )}

          {/* Social Sign In Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e6dfd8]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono">
                <span className="bg-[#efe9de] px-2 text-[#8e8b82]">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <a
                href="/api/auth/google"
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[#e6dfd8] rounded-xl bg-white hover:bg-gray-50 text-xs font-semibold text-[#141413] shadow-xs transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </a>
            </div>
          </div>

          <div className="mt-6 text-center pt-4 border-t border-[#e6dfd8]">
            <p className="text-xs font-sans text-[#6c6a64]">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-[#cc785c] hover:text-[#a9583e] transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
