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

    return apiClient.post('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

export default apiClient;
