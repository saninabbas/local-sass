import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../lib/api';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, AlertCircle, ArrowLeft, KeyRound, Lock } from 'lucide-react';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Password reset token is missing or invalid.');
      return;
    }
    if (!emailParam) {
      setError('Email parameter is missing from the reset link.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword({
        email: emailParam,
        token,
        password
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <img 
            src="/brand/logo.svg" 
            alt="Scorankio" 
            className="w-[130px] sm:w-[150px] h-auto object-contain transition-transform hover:scale-105" 
          />
        </Link>
        <h2 className="text-center text-3xl font-serif font-normal text-[#141413]">
          Create new password
        </h2>
        <p className="mt-2 text-center text-xs font-sans text-[#6c6a64]">
          {emailParam ? `Resetting password for ${emailParam}` : 'Enter your new secure password'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#efe9de] py-8 px-4 shadow-sm border border-[#e6dfd8] rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-sans text-red-700">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-bold text-[#141413]">Password Reset Successfully!</h3>
              <p className="text-xs font-sans text-[#6c6a64]">
                Your password has been updated. Redirecting you to login in 3 seconds...
              </p>
              <div className="pt-3">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-xl text-xs font-medium transition-colors"
                >
                  <Lock size={13} />
                  <span>Log In Now</span>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormField
                label="New Password (min 6 characters)"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <FormField
                label="Confirm New Password"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md" 
                  className="w-full h-11 text-sm bg-[#cc785c] hover:bg-[#a9583e] font-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating Password...' : 'Reset Password'}
                </Button>
              </div>

              <div className="text-center pt-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6c6a64] hover:text-[#141413] transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
