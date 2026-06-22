import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject admin JWT on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear session and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service for Products
export const productAPI = {
  // Get all products grouped by category
  getAllProducts: () => apiClient.get('/api/products'),

  // Get single product
  getProduct: (id) => apiClient.get(`/api/products/${id}`),

  // Create product with images
  createProduct: (productData, images, primaryIndex = 0) => {
    const formData = new FormData();
    formData.append('product', JSON.stringify(productData));
    images.forEach((image) => {
      formData.append('images', image);
    });
    formData.append('primaryIndex', primaryIndex);

    console.log('Creating product with data:', productData);
    
    return apiClient.post('/api/products/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update product with images
  updateProduct: (id, productData, newImages, primaryIndex = 0) => {
    const formData = new FormData();
    // productData already includes imagesToKeep array, so it will be JSON stringified together
    formData.append('product', JSON.stringify(productData));
    
    // Add only new images
    newImages.forEach((image) => {
      if (image instanceof File) {
        formData.append('images', image);
      }
    });
    
    formData.append('primaryIndex', primaryIndex);

    return apiClient.put(`/api/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete product
  deleteProduct: (id) => apiClient.delete(`/api/products/${id}`),
};

// API Service for Categories
export const categoryAPI = {
  // Get all categories
  getAllCategories: () => apiClient.get('/api/category'),

  // Get single category
  getCategory: (id) => apiClient.get(`/api/category/${id}`),

  // Create category
  createCategory: (categoryData) =>
    apiClient.post('/api/category/create', categoryData),

  // Update category
  updateCategory: (id, categoryData) =>
    apiClient.put(`/api/category/${id}`, categoryData),

  // Delete category
  deleteCategory: (id) => apiClient.delete(`/api/category/${id}`),
};

// API Service for Orders (admin)
export const orderAPI = {
  // Get all orders
  getAllOrders: () =>
    apiClient.get('/api/orders/admin/all').then((r) => r.data.data),

  // Get orders filtered by status
  getOrdersByStatus: (status) =>
    apiClient.get(`/api/orders/admin/status/${status}`).then((r) => r.data.data),

  // Update an order's status
  updateOrderStatus: (orderId, status) =>
    apiClient.put(`/api/orders/${orderId}/status/${status}`).then((r) => r.data.data),

  // Delete an order
  deleteOrder: (orderId) =>
    apiClient.delete(`/api/orders/${orderId}`).then((r) => r.data),
};

export default apiClient;
