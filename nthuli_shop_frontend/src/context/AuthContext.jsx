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
   * Check if token is expired by decoding it
   */
  const isTokenExpired = useCallback((token) => {
    try {
      // Simple JWT decode (not cryptographically verifying, just reading payload)
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      // Token is expired if expiry time is in the past
      return currentTime > expiryTime;
    } catch (err) {
      console.error('Error checking token expiry:', err);
      return true; // Consider token invalid if we can't decode it
    }
  }, []);

  /**
   * Schedule initial token refresh if token exists
   */
  useEffect(() => {
    if (accessToken && !tokenRefreshScheduled) {
      // Check if token is already expired
      if (isTokenExpired(accessToken)) {
        console.warn('⚠️ Access token is already expired. Attempting refresh...');
        handleRefreshToken();
      } else {
        // Extract expiry time from token to schedule refresh at right time
        try {
          const parts = accessToken.split('.');
          const payload = JSON.parse(atob(parts[1]));
          const expiryTime = payload.exp * 1000;
          const currentTime = Date.now();
          const timeUntilExpiry = expiryTime - currentTime;
          
          console.log(`⏰ Token expires in ${Math.round(timeUntilExpiry / 1000)} seconds`);
          scheduleTokenRefresh(timeUntilExpiry);
        } catch (err) {
          // Fallback to 15 min expiry if we can't decode
          console.error('Error decoding token:', err);
          scheduleTokenRefresh(900000);
        }
      }
    }
  }, [accessToken, tokenRefreshScheduled, scheduleTokenRefresh, isTokenExpired, handleRefreshToken]);

  /**
   * Listen for logout event from api.js when token refresh fails
   */
  useEffect(() => {
    const handleLogoutEvent = () => {
      console.log('🚪 Logout event received from api interceptor');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    };

    window.addEventListener('logout', handleLogoutEvent);
    return () => window.removeEventListener('logout', handleLogoutEvent);
  }, []);

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
