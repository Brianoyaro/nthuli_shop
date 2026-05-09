import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaExclamationCircle, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useToast } from '../hooks/useToast';
import passwordResetAPI from '../services/passwordResetAPI';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        addToast('Invalid reset link', 'error');
        setValidating(false);
        return;
      }

      try {
        await passwordResetAPI.validateResetToken(token);
        setTokenValid(true);
      } catch (error) {
        addToast('This reset link has expired or is invalid', 'error');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, addToast]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain a lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain an uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain a number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await passwordResetAPI.resetPassword(token, formData.newPassword);
      setSuccess(true);
      addToast('Password reset successfully! Please log in with your new password.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const errorMessage = error.message || 'Failed to reset password';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.newPassword;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;

    return strength;
  };

  const getStrengthLabel = () => {
    const strength = getPasswordStrength();
    if (strength < 2) return { text: 'Weak', color: 'bg-red-500' };
    if (strength < 4) return { text: 'Medium', color: 'bg-yellow-500' };
    return { text: 'Strong', color: 'bg-green-500' };
  };

  // Loading state
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validating your reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationCircle className="text-2xl text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
            <p className="text-gray-600 mb-8">
              This password reset link has expired or is invalid. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-2xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-8">
              Your password has been reset successfully. You'll be redirected to the login page shortly.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Reset form
  const passwordStrength = getPasswordStrength();
  const strengthLabel = getStrengthLabel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-2xl text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Password</h1>
            <p className="text-gray-600 text-sm mt-2">
              Enter a strong password to secure your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pr-10 ${
                    errors.newPassword ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}

              {/* Password Strength */}
              {formData.newPassword && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-600">Strength:</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-4 rounded-full ${
                            i < passwordStrength ? strengthLabel.color : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${
                      strengthLabel.color === 'bg-red-500' ? 'text-red-600' :
                      strengthLabel.color === 'bg-yellow-500' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {strengthLabel.text}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Password should contain uppercase, lowercase, numbers, and be at least 8 characters.
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pr-10 ${
                    errors.confirmPassword ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          {/* Help */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
