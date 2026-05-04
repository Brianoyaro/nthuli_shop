import React, { createContext, useState, useEffect, useCallback } from 'react';
import authAPI from '../services/authAPI';
import cartAPI from '../services/cartAPI';
import { useCartStore } from '../store/cartStore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { cart, setSyncedCart } = useCartStore();

  // Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          
          // Try to sync localStorage cart to database
          syncCartToDB();
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const syncCartToDB = useCallback(async () => {
    try {
      // Only sync if there are items in localStorage cart
      if (cart && cart.length > 0) {
        const items = cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        }));

        const syncedCartData = await cartAPI.syncLocalCart(items);
        
        // Update store with database cart
        if (syncedCartData.items) {
          const dbCart = syncedCartData.items.map(item => ({
            id: item.productId,
            name: item.product?.name,
            price: item.product?.price,
            image: item.product?.images?.[0]?.imageUrl,
            category: item.product?.categoryName,
            quantity: item.quantity,
          }));
          setSyncedCart(dbCart);
        }
      }
    } catch (err) {
      console.error('Failed to sync cart:', err);
      // Continue without syncing
    }
  }, [cart, setSyncedCart]);

  const register = useCallback(async (email, password, firstName, lastName) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await authAPI.register(email, password, firstName, lastName);
      
      // Store tokens and user data
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);

      // Sync cart after successful registration
      await syncCartToDB();

      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [syncCartToDB]);

  const login = useCallback(async (email, password) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      
      // Store tokens and user data
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('refresh_token', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
      setIsAuthenticated(true);

      // Sync cart after successful login
      await syncCartToDB();

      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [syncCartToDB]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setError('');
    // Cart persists in localStorage for next session
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
