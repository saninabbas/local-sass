import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../lib/api';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, ExternalLink } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ message: string; resetLink?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccessData(null);

    try {
      const res = await forgotPassword(email.trim());
      setSuccessData(res || { message: "Password reset link generated." });
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <img 
            src="/brand/logo.png" 
            alt="Rankora" 
            className="h-14 sm:h-16 w-auto max-w-[260px] object-contain transition-transform hover:scale-105" 
          />
        </Link>
        <h2 className="text-center text-3xl font-serif font-normal text-[#141413]">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-xs font-sans text-[#6c6a64]">
          Enter your account email and we'll provide a secure link to reset your password.
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

          {successData ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-sans text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Reset Link Generated!</span>
                </div>
                <p className="leading-relaxed">
                  {successData.message}
                </p>
                {successData.resetLink && (
                  <div className="pt-2 border-t border-emerald-200/60">
                    <p className="font-semibold text-emerald-950 mb-1.5">Direct Reset Link:</p>
                    <Link
                      to={successData.resetLink.replace(/^https?:\/\/[^\/]+/, '')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs transition-colors"
                    >
                      <KeyRound size={13} />
                      <span>Proceed to Reset Password Now</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-[#e6dfd8] rounded-xl text-xs font-medium text-[#141413] hover:bg-[#faf9f5] transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormField
                label="Account Email"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  {isLoading ? 'Generating Link...' : 'Send Password Reset Link'}
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
