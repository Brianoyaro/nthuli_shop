import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const loadTokens = () => {
      try {
        const stored = localStorage.getItem('auth');
        if (stored) {
          const { user: storedUser, accessToken: storedAccessToken, refreshToken: storedRefreshToken } = JSON.parse(stored);
          setUser(storedUser);
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
        }
      } catch (err) {
        console.error('Failed to load tokens from localStorage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.login(email, password);
      setUser(user);
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);

      // Store in localStorage
      localStorage.setItem('auth', JSON.stringify({
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }));

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, firstName, lastName, adminCode = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.register(email, password, firstName, lastName, adminCode);
      setUser(user);
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);

      // Store in localStorage
      localStorage.setItem('auth', JSON.stringify({
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }));

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAccessTokenFn = useCallback(async () => {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { accessToken: newAccessToken } = await authService.refreshAccessToken(refreshToken);
      setAccessToken(newAccessToken);

      // Update localStorage
      const stored = localStorage.getItem('auth');
      if (stored) {
        const auth = JSON.parse(stored);
        auth.accessToken = newAccessToken;
        localStorage.setItem('auth', JSON.stringify(auth));
      }

      return newAccessToken;
    } catch (err) {
      console.error('Failed to refresh token:', err);
      logout();
      throw err;
    }
  }, [refreshToken]);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setError(null);
    localStorage.removeItem('auth');
  }, []);

  const value = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    isAuthenticated: !!accessToken && !!user,
    login,
    register,
    refreshAccessToken: refreshAccessTokenFn,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
