import { Link } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Mail, CheckCircle2, ExternalLink } from 'lucide-react';

import { useState } from 'react';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devLink, setDevLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        if (data.verificationLink) {
          setDevLink(data.verificationLink);
        }
      } else {
        setError(data.error || 'An error occurred during signup');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
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

        {isSubmitted ? (
          <div className="bg-[#efe9de] py-8 px-6 shadow-xl sm:rounded-2xl border border-[#e6dfd8] text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#5db872]/20 text-[#2b753e] mb-2">
              <Mail size={28} />
            </div>
            <h2 className="text-2xl font-serif font-normal text-[#141413]">Check Your Email</h2>
            <p className="text-xs text-[#6c6a64] font-sans">
              We have sent a verification link to <strong className="text-[#141413]">{email}</strong>.
            </p>

            <div className="p-3.5 bg-[#faf9f5] rounded-xl border border-[#e6dfd8] text-xs text-[#252523] flex items-start gap-2 text-left">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#5db872]" />
              <span>Please check your inbox to verify your account, or click the instant test button below:</span>
            </div>

            {devLink ? (
              <div className="p-3.5 bg-[#efe9de] rounded-xl border border-[#cc785c]/30 text-left space-y-2">
                <span className="text-[11px] font-mono font-bold text-[#cc785c] uppercase tracking-wide">⚡ Quick Test Verification</span>
                <p className="text-xs text-[#3d3d3a]">Click below to verify your email right now without opening inbox:</p>
                <a href={devLink} className="inline-flex items-center gap-2 text-xs font-medium text-white bg-[#cc785c] hover:bg-[#a9583e] px-4 py-2 rounded-lg transition-colors w-full justify-center shadow-sm">
                  <span>Click Here To Verify Email Instantly</span> <ExternalLink size={14} />
                </a>
              </div>
            ) : (
              <div className="pt-2">
                <a href={`/api/auth/verify?token=test`} className="text-xs text-[#cc785c] underline">
                  Verify Email
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-[#e6dfd8]">
              <Link to="/login">
                <Button variant="primary" size="md" className="w-full bg-[#cc785c] hover:bg-[#a9583e]">
                  Proceed to Log In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-center text-3xl font-serif font-normal text-[#141413] mb-2">
              Start growing your business
            </h2>
            <p className="text-center text-xs font-sans text-[#6c6a64] mb-8">
              Create your account and get your first Growth Score.
            </p>

            <div className="bg-[#efe9de] py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-[#e6dfd8]">
              {error && (
                <div className="mb-4 p-3 bg-[#c64545]/15 border border-[#c64545]/30 text-[#c64545] text-xs font-mono rounded-lg">
                  {error}
                </div>
              )}
              <form className="space-y-3" onSubmit={handleSubmit}>
                <FormField
                  label="Full Name"
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
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
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FormField
                  label="Confirm Password"
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <div className="pt-3">
                  <Button type="submit" variant="primary" size="md" className="w-full h-11 text-sm bg-[#cc785c] hover:bg-[#a9583e]" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </form>

              {/* Social Sign Up Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e6dfd8]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase font-mono">
                    <span className="bg-[#efe9de] px-2 text-[#8e8b82]">Or sign up with</span>
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
                    <span>Sign up with Google</span>
                  </a>
                </div>
              </div>

              <div className="mt-6 text-center pt-4 border-t border-[#e6dfd8]">
                <p className="text-xs font-sans text-[#6c6a64]">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-[#cc785c] hover:text-[#a9583e] transition-colors">
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
