import { Link } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { BarChart2, Mail, CheckCircle2 } from 'lucide-react';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Signup() {
  const { signup } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      await signup({ name, email, password });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <BarChart2 size={24} />
            </div>
          </Link>
        </div>

        {isSubmitted ? (
          <div className="bg-white py-8 px-6 shadow-xl shadow-black/5 sm:rounded-2xl border border-gray-200 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
              <Mail size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
            <p className="text-sm text-gray-600">
              We have sent a verification link to <strong className="text-gray-900">{email}</strong>.
            </p>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-start gap-2 text-left">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>Please click the link in your email inbox to verify your account before logging in.</span>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <Link to="/login">
                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Log In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-center text-3xl font-extrabold text-primary mb-2">
              Start growing your business
            </h2>
            <p className="text-center text-base text-secondary mb-8">
              Create your account and get your first Growth Score.
            </p>

            <div className="bg-white py-8 px-4 shadow-xl shadow-black/5 sm:rounded-2xl sm:px-10 border border-gray-200">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-danger text-sm rounded-lg">
                  {error}
                </div>
              )}
              <form className="space-y-2" onSubmit={handleSubmit}>
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

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="lg" className="w-full text-lg h-12" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-secondary">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-primary hover:text-primary-accent transition-colors">
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
