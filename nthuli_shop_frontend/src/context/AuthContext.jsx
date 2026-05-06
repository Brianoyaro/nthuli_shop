import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/authAPI';

/**
 * AuthContext
 * Manages user authentication, JWT tokens
 */
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenRefreshScheduled, setTokenRefreshScheduled] = useState(false);

  /**
   * Load tokens from localStorage on mount
   */
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  /**
   * Register new user
   */
  const signup = useCallback(async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authAPI.register(email, password);
      console.log('✅ Signup successful:', response);

      // Automatically log in after signup
      const loginResponse = await authAPI.login(email, password);
      console.log('✅ Auto-login after signup:', loginResponse);

      // Save tokens and user
      localStorage.setItem('accessToken', loginResponse.accessToken);
      localStorage.setItem('refreshToken', loginResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify({ email }));

      setAccessToken(loginResponse.accessToken);
      setRefreshToken(loginResponse.refreshToken);
      setUser({ email });

      return { success: true, data: loginResponse };
    } catch (err) {
      const errorMessage = err.message || 'Signup failed';
      setError(errorMessage);
      console.error('❌ Signup error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authAPI.login(email, password);
      console.log('✅ Login successful:', response);

      // Save tokens and user
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify({ email }));

      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser({ email });

      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      console.error('❌ Login error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh access token
   */
  const handleRefreshToken = useCallback(async () => {
    try {
      if (!refreshToken) {
        console.error('❌ No refresh token available');
        await logout();
        return false;
      }

      console.log('🔄 Refreshing access token...');
      const response = await authAPI.refreshToken(refreshToken);
      console.log('✅ Token refreshed:', response);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      scheduleTokenRefresh(response.expiresIn);
      return true;
    } catch (err) {
      console.error('❌ Token refresh failed:', err);
      await logout();
      return false;
    }
  }, [refreshToken]);

  /**
   * Schedule token refresh 2 minutes before expiry
   */
  const scheduleTokenRefresh = useCallback((expiresIn) => {
    if (tokenRefreshScheduled) return;

    // Refresh 2 minutes before expiry (or 1 minute before if expiresIn < 3 minutes)
    const refreshTime = Math.max(expiresIn - 120000, expiresIn - 60000);

    console.log(`⏰ Scheduling token refresh in ${refreshTime / 1000} seconds`);

    const timer = setTimeout(() => {
      handleRefreshToken();
      setTokenRefreshScheduled(false);
    }, refreshTime);

    setTokenRefreshScheduled(true);

    return () => clearTimeout(timer);
  }, [tokenRefreshScheduled, handleRefreshToken]);

  /**
   * Schedule initial token refresh if token exists
   */
  useEffect(() => {
    if (accessToken && !tokenRefreshScheduled) {
      scheduleTokenRefresh(900000); // Assume 15 min expiry
    }
  }, [accessToken, tokenRefreshScheduled, scheduleTokenRefresh]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');

      // Clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setError(null);

      console.log('✅ Logout complete');
      return { success: true };
    } catch (err) {
      console.error('❌ Logout error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!accessToken && !!user;

  const value = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated,
    error,
    login,
    signup,
    logout,
    refreshToken: handleRefreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
