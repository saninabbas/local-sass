import { Link } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Mail, CheckCircle2, ExternalLink } from 'lucide-react';
import { AnthropicLogo } from '../../components/claude/AnthropicLogo';

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
    <div className="min-h-screen bg-[#faf9f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#141413] selection:bg-[#cc785c] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <AnthropicLogo size={28} color="#cc785c" showWordmark={true} wordmarkColor="#141413" brandName="Rankora" />
          </Link>
        </div>

        {isSubmitted ? (
          <div className="bg-[#efe9de] py-8 px-6 shadow-xl sm:rounded-2xl border border-[#e6dfd8] text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#5db872]/20 text-[#2b753e] mb-2">
              <Mail size={28} />
            </div>
            <h2 className="text-2xl font-serif font-normal text-[#141413]">Check Your Email</h2>
            <p className="text-xs text-[#6c6a64] font-sans">
              We have dispatched a verification link to <strong className="text-[#141413]">{email}</strong>.
            </p>

            <div className="p-3.5 bg-[#faf9f5] rounded-xl border border-[#e6dfd8] text-xs text-[#252523] flex items-start gap-2 text-left">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#5db872]" />
              <span>Please click the link in your email, or use the quick verification bypass:</span>
            </div>

            {devLink ? (
              <div className="p-3.5 bg-[#efe9de] rounded-xl border border-[#cc785c]/30 text-left space-y-2">
                <span className="text-[11px] font-mono font-bold text-[#cc785c] uppercase tracking-wide">⚡ Quick Verification Link</span>
                <p className="text-xs text-[#3d3d3a]">Click below to complete registration instantly:</p>
                <a href={devLink} className="inline-flex items-center gap-2 text-xs font-medium text-white bg-[#cc785c] hover:bg-[#a9583e] px-4 py-2 rounded-lg transition-colors w-full justify-center shadow-sm">
                  <span>Verify Email Instantly</span> <ExternalLink size={14} />
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
              Start scaling your local business
            </h2>
            <p className="text-center text-xs font-sans text-[#6c6a64] mb-8">
              Create your account to unlock continuous AI audit intelligence.
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
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <FormField
                  label="Business Email"
                  id="email"
                  type="email"
                  placeholder="alex@business.com"
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
                <FormField
                  label="Confirm Password"
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <div className="pt-3">
                  <Button type="submit" variant="primary" size="md" className="w-full h-11 text-sm bg-[#cc785c] hover:bg-[#a9583e]" disabled={isLoading}>
                    {isLoading ? 'Generating Audit Account...' : 'Create Account & Start Audit'}
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center pt-4 border-t border-[#e6dfd8]">
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
