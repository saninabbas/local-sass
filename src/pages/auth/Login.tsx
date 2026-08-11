import { Link, useNavigate } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { BarChart2 } from 'lucide-react';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
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
        <h2 className="text-center text-3xl font-extrabold text-primary mb-8">
          Welcome back
        </h2>

        <div className="bg-white py-8 px-4 shadow-xl shadow-black/5 sm:rounded-2xl sm:px-10 border border-gray-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-danger text-sm rounded-lg">
              {error}
            </div>
          )}
          <form className="space-y-2" onSubmit={handleSubmit}>
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
            <div className="flex items-center justify-end mb-4 -mt-2">
              <a href="#" className="text-sm font-semibold text-primary hover:text-primary-accent transition-colors">
                Forgot password?
              </a>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" className="w-full text-lg h-12" disabled={isLoading}>
                {isLoading ? 'Logging In...' : 'Log In'}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-secondary">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-primary hover:text-primary-accent transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
