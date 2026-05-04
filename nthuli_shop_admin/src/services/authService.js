import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const authClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (email, password) => {
    const response = await authClient.post('/api/auth/login', { email, password });
    const data = response.data;
    
    // Backend returns user data flat, restructure to match app expectations
    return {
      user: {
        id: data.id,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },

  register: async (email, password, firstName, lastName, adminCode = null) => {
    const payload = {
      email,
      password,
      firstName,
      lastName,
    };
    
    if (adminCode) {
      payload.adminCode = adminCode;
    }
    
    const response = await authClient.post('/api/auth/register', payload);
    const data = response.data;
    
    // Backend returns user data flat, restructure to match app expectations
    return {
      user: {
        id: data.id,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  },

  refreshAccessToken: async (refreshToken) => {
    const response = await authClient.post('/api/auth/refresh-token', { refreshToken });
    const data = response.data;
    
    // Backend returns tokens directly
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || refreshToken,
    };
  },
};

export default authClient;
