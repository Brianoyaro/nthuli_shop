import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { useToast } from '../hooks/useToast';
import passwordResetAPI from '../services/passwordResetAPI';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      addToast('Please enter your email address', 'error');
      return;
    }

    setLoading(true);
    try {
      await passwordResetAPI.forgotPassword(email);
      setSubmitted(true);
      addToast('Password reset link sent successfully to your email', 'success');
    } catch (error) {
      const errorMessage = error.message || 'Failed to send password reset email';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          to="/login"
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-8 transition-colors"
        >
          <FaArrowLeft className="text-lg" />
          <span className="font-medium">Back to Login</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEnvelope className="text-2xl text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                <p className="text-gray-600 text-sm mt-2">
                  Don't worry! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              {/* Help text */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Sign up here
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Success message */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-2xl text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to <span className="font-semibold">{email}</span>
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  The link will expire in 24 hours. If you don't receive the email, please check your spam folder or try again.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Back to Login
                  </Button>
                  <button
                    onClick={() => {
                      setEmail('');
                      setSubmitted(false);
                    }}
                    className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Try Another Email
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
