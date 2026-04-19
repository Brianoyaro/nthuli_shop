import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  updateProduct: (id, productData, images) => {
    const formData = new FormData();
    formData.append('product', JSON.stringify(productData));
    images.forEach((image) => {
      formData.append('images', image);
    });

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

export default apiClient;
