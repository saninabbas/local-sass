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
            src="/brand/logo.svg" 
            alt="Scorankio" 
            className="w-[130px] sm:w-[150px] h-auto object-contain transition-transform hover:scale-105" 
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
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#5db872]/20 text-[#2b753e] mb-2">
                <Mail size={28} />
              </div>
              <h2 className="text-2xl font-serif font-normal text-[#141413]">Check Your Email</h2>
              <p className="text-xs text-[#6c6a64] font-sans leading-relaxed">
                We have sent a secure password reset link to <strong className="text-[#141413]">{email}</strong>.
              </p>
              
              <div className="p-4 bg-[#faf9f5] rounded-xl border border-[#e6dfd8] text-xs text-[#3d3d3a] flex items-start gap-2.5 text-left">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#5db872]" />
                <span className="leading-relaxed">
                  Please check your inbox (and spam folder). Click the link inside the email to choose a new password. The link expires in 60 minutes.
                </span>
              </div>

              <div className="pt-3 space-y-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setSuccessData(null);
                    setEmail('');
                  }}
                  className="w-full text-xs font-medium border-[#e6dfd8] text-[#141413] hover:bg-[#faf9f5]"
                >
                  Send to Another Email
                </Button>
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-[#6c6a64] hover:text-[#141413] transition-colors"
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
