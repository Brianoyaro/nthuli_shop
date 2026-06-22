import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const TOKEN_KEY = 'adminToken';
const USER_KEY = 'adminUser';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
    const data = response.data;

    console.log(data)

    //call /api/user/profile to get my role
    const resp = await axios.get(
      `${BACKEND_URL}/api/user/profile`,
      {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      }
    );

    const role = resp.data.role;
    console.log("role:", role);
    const profileData = JSON.stringify(resp.data);
  

    if (role !== 'ADMIN') throw new Error('Access denied: admin account required');

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    // localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    setToken(data.accessToken);
    // setUser(userInfo);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
