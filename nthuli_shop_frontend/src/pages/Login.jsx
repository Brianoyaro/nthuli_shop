import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { loginSchema } from '../schemas/authSchema';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error: authError, clearError } = useAuth();
  const [serverError, setServerError] = useState('');

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
    setServerError('');
    clearError();
    try {
      await login(data.email, data.password);
      
      // Redirect to the page they were trying to access, or home
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-gray-600">Access your Nthuli Shop account</p>
          </div>

          {/* Error Messages */}
          {(serverError || authError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{serverError || authError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaLock className="absolute left-3 top-3 text-gray-400" />
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center gap-2 justify-center">
                  <FaSpinner className="animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">Or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Register here
            </Link>
          </p>

          {/* Continue Shopping */}
          <button
            onClick={() => navigate('/products')}
            className="w-full mt-4 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Continue Shopping
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-blue-900">
            You need to login to proceed with checkout and access M-Pesa payment.
          </p>
        </div>
      </div>
    </div>
  );
}
