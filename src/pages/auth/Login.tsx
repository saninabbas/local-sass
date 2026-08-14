import { Link, useNavigate } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { ShieldCheck } from 'lucide-react';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
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
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          if (data.require2FA) {
            setRequires2FA(true);
            setTempToken(data.tempToken);
          } else {
            await login({ email, password });
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
              src="/brand/logo.png" 
              alt="Rankora" 
              className="h-10 w-auto object-contain" 
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
                placeholder="••••••••"
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
                  <span className="font-medium text-[#cc785c] hover:text-[#a9583e] cursor-not-allowed opacity-80">Forgot password?</span>
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" variant="primary" size="md" className="w-full h-11 text-sm bg-[#cc785c] hover:bg-[#a9583e] font-medium" disabled={isLoading}>
                  {isLoading ? 'Logging In...' : 'Log In'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center pt-4 border-t border-[#e6dfd8]">
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
