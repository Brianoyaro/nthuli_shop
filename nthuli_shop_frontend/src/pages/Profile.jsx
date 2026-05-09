import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaLock,
  FaBoxOpen,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
import { profileAPI } from '../services/profileAPI';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

// Password change validation schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

function ProfileInfoCard({ profile }) {
  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const lastLogin = profile?.last_login
    ? new Date(profile.last_login).toLocaleString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
          <FaUser className="text-white w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{profile?.email || '—'}</h2>
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
            <FaShieldAlt className="w-3 h-3" />
            {profile?.role || 'USER'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 text-sm">
          <FaEnvelope className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Email</p>
            <p className="text-gray-900 font-medium">{profile?.email || '—'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-sm">
          <FaCheckCircle className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Member Since</p>
            <p className="text-gray-900 font-medium">{createdAt}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 text-sm">
          <FaShieldAlt className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Last Login</p>
            <p className="text-gray-900 font-medium">{lastLogin}</p>
          </div>
        </div>

        {profile?.last_login_ip && (
          <div className="flex items-start gap-3 text-sm">
            <FaShieldAlt className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Last Login IP</p>
              <p className="text-gray-900 font-medium font-mono text-xs">{profile.last_login_ip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await profileAPI.changePassword(data.currentPassword, data.newPassword);
      addToast('Password changed successfully', 'success');
      reset();
    } catch (err) {
      addToast(err.message || 'Failed to change password', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <FaLock className="text-blue-600 w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <p className="text-sm text-red-600 mt-1">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin" /> Changing Password...
            </span>
          ) : (
            'Change Password'
          )}
        </Button>
      </form>
    </div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: profileAPI.getProfile,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">Manage your account</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <FaSignOutAlt />
            Sign Out
          </Button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center mb-6">
            <FaSpinner className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 mb-6 flex items-center gap-3">
            <FaExclamationCircle className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        )}

        {/* Profile info */}
        {profile && !isLoading && (
          <div className="mb-6">
            <ProfileInfoCard profile={profile} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Change password */}
          <ChangePasswordCard />

          {/* Quick links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaBoxOpen className="text-blue-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">My Orders</p>
                  <p className="text-xs text-gray-500">View and track your orders</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/products')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="p-2 bg-green-50 rounded-lg">
                  <FaBoxOpen className="text-green-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Shop Products</p>
                  <p className="text-xs text-gray-500">Browse our collection</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
