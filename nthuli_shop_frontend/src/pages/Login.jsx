import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaEnvelope, FaLock, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setError('');

      console.log('🔓 Attempting login:', data.email);
      const result = await login(data.email, data.password);

      if (result.success) {
        console.log('✅ Login successful, redirecting...');
        // Redirect to the page they came from, or checkout/home
        const from = location.state?.from?.pathname;
        navigate(from || '/checkout', { replace: true });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Nthuli Shop account</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline w-4 h-4 mr-2" />
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                <FaLock className="inline w-4 h-4 mr-2" />
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <input
              {...register('password')}
              type="password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className="w-full mt-8"
          >
            {isLoading ? (
              <>
                <FaSpinner className="inline w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Create one now
          </Link>
        </p>

        {/* Back Link */}
        <Link
          to="/"
          className="block text-center text-gray-500 hover:text-gray-700 text-sm mt-4 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
