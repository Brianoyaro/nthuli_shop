import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaUser, FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { registerSchema } from '../schemas/authSchema';

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error: authError, clearError } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    clearError();
    try {
      await registerUser(data.email, data.password, data.firstName, data.lastName);
      
      // Redirect to checkout or home
      navigate('/checkout');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join Nthuli Shop today</p>
          </div>

          {/* Error Messages */}
          {(serverError || authError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{serverError || authError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <input
                    {...register('firstName')}
                    type="text"
                    placeholder="John"
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                </div>
                {errors.firstName && (
                  <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <input
                    {...register('lastName')}
                    type="text"
                    placeholder="Doe"
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaUser className="absolute left-3 top-3 text-gray-400" />
                </div>
                {errors.lastName && (
                  <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaLock className="absolute left-3 top-3 text-gray-400" />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
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
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">Or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login here
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
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-sm text-green-900">
            Register now to save your cart and proceed with M-Pesa checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
