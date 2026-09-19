import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, XCircle, Loader2, BarChart2 } from 'lucide-react';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (data.success) {
          setStatus('success');
          setMessage('Your email address has been verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. The token may be expired.');
        }
      } catch {
        setStatus('error');
        setMessage('Network error while verifying email.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <BarChart2 size={24} />
            </div>
          </Link>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl shadow-black/5 sm:rounded-2xl border border-gray-200">
          {status === 'loading' && (
            <div className="py-6 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-gray-600 font-medium">Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4 flex flex-col items-center gap-4">
              <CheckCircle2 className="text-emerald-500" size={56} />
              <h3 className="text-2xl font-bold text-gray-900">Email Verified!</h3>
              <p className="text-gray-600 text-sm">{message}</p>
              <Link to="/login" className="w-full mt-4">
                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Log In
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4 flex flex-col items-center gap-4">
              <XCircle className="text-danger" size={56} />
              <h3 className="text-2xl font-bold text-gray-900">Verification Failed</h3>
              <p className="text-gray-600 text-sm">{message}</p>
              <Link to="/signup" className="w-full mt-4">
                <Button variant="outline" size="lg" className="w-full">
                  Back to Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
