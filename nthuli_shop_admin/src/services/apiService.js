import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup interceptors for auth handling
export const setupApiInterceptors = () => {
  // Request interceptor: Add Authorization header
  apiClient.interceptors.request.use(
    (config) => {
      // Get the current token from localStorage instead of relying on closure
      const authData = localStorage.getItem('auth');
      console.log('[Interceptor] Request to:', config.url, 'Auth data present:', !!authData);
      if (authData) {
        try {
          const { accessToken } = JSON.parse(authData);
          console.log('[Interceptor] Token found:', !!accessToken);
          if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            console.log('[Interceptor] Authorization header set');
          }
        } catch (err) {
          console.error('Failed to parse auth data from localStorage:', err);
        }
      } else {
        console.log('[Interceptor] No auth data in localStorage');
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle 401 and refresh token
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const authData = localStorage.getItem('auth');
          if (!authData) {
            throw new Error('No auth data available');
          }

          const { refreshToken } = JSON.parse(authData);
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Refresh the token
          const response = await apiClient.post('/api/auth/refresh-token', { refreshToken });
          const newAccessToken = response.data.accessToken;

          // Update localStorage with new token
          const updatedAuth = JSON.parse(localStorage.getItem('auth'));
          updatedAuth.accessToken = newAccessToken;
          localStorage.setItem('auth', JSON.stringify(updatedAuth));

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // Clear auth and redirect to login
          localStorage.removeItem('auth');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

// API Service for Products
export const productAPI = {
  // Get all products
  getAllProducts: () => apiClient.get('/api/products'),

  // Get single product
  getProduct: (id) => apiClient.get(`/api/products/${id}`),

  // Create product with images
  createProduct: (productData, images, primaryIndex = 0) => {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('categoryId', productData.categoryId);
    
    images.forEach((image) => {
      formData.append('images', image);
    });

    return apiClient.post('/api/products', formData);
  },

  // Update product with images
  updateProduct: (id, productData, newImages, primaryIndex = 0) => {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('categoryId', productData.categoryId);
    
    // Add only new images
    newImages.forEach((image) => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });

    return apiClient.put(`/api/products/${id}`, formData);
  },

  // Delete product
  deleteProduct: (id) => apiClient.delete(`/api/products/${id}`),
};

// API Service for Categories
export const categoryAPI = {
  // Get all categories
  getAllCategories: () => apiClient.get('/api/categories'),

  // Get single category
  getCategory: (id) => apiClient.get(`/api/categories/${id}`),

  // Create category
  createCategory: (categoryData) =>
    apiClient.post('/api/categories', categoryData),

  // Update category
  updateCategory: (id, categoryData) =>
    apiClient.put(`/api/categories/${id}`, categoryData),

  // Delete category
  deleteCategory: (id) => apiClient.delete(`/api/categories/${id}`),
};

// API Service for Orders (Admin)
export const orderAPI = {
  // Get all orders (admin)
  getAdminOrders: (status, startDate, endDate, limit = 10, offset = 0) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit);
    params.append('offset', offset);
    return apiClient.get(`/api/orders/admin/all?${params.toString()}`);
  },

  // Get single order (admin)
  getAdminOrderDetail: (orderId) => apiClient.get(`/api/orders/admin/${orderId}`),

  // Update order status (admin)
  updateOrderStatus: (orderId, newStatus) =>
    apiClient.patch(`/api/orders/admin/${orderId}/status`, { status: newStatus }),

  // Cancel order (admin)
  cancelOrder: (orderId) => apiClient.patch(`/api/orders/admin/${orderId}/cancel`),
};

// API Service for Payments (Admin)
export const paymentAPI = {
  // Get all payments (admin)
  getCompletedPayments: () => apiClient.get('/api/payments'),

  // Refund payment (admin)
  refundPayment: (paymentId, reason) =>
    apiClient.post(`/api/payments/${paymentId}/refund`, { reason }),

  // Get payment status
  getPaymentStatus: (paymentId) => apiClient.get(`/api/payments/${paymentId}/status`),
};

export default apiClient;
