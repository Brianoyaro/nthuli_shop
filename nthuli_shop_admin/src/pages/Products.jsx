import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/apiService';
import toast from 'react-hot-toast';

export const Products = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: '',
    search: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch products
  const { data: productsResponse = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['allProducts'],
    queryFn: async () => {
      try {
        const response = await productAPI.getAllProducts();
        return Array.isArray(response.data) ? response.data : response.data.products || [];
      } catch (err) {
        toast.error('Failed to load products');
        throw err;
      }
    },
  });

  // Fetch categories
  const { data: categoriesResponse = [] } = useQuery({
    queryKey: ['allCategories'],
    queryFn: async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        return Array.isArray(response.data) ? response.data : response.data.categories || [];
      } catch (err) {
        toast.error('Failed to load categories');
        throw err;
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (productId) => productAPI.deleteProduct(productId),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      refetchProducts();
      setDeleteConfirm(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    },
  });

  // Filter products
  const filteredProducts = productsResponse
    .filter((p) => !filters.category || p.categoryId === filters.category)
    .filter((p) => !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog</p>
          </div>
          <button
            onClick={() => navigate('/product/create')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ Add New Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              >
                <option value="">All Categories</option>
                {categoriesResponse.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-sm text-gray-600">Found {filteredProducts.length} products</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No products found</p>
            <button
              onClick={() => navigate('/product/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create your first product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {/* Product Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {product.ProductImages && product.ProductImages.length > 0 ? (
                    <img
                      src={`http://localhost:8080/${product.ProductImages[0].imagePath}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No image</div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-blue-600">KES {Math.round(product.price).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {categoriesResponse.find((c) => c.id === product.categoryId)?.name || 'Uncategorized'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-900 rounded hover:bg-gray-200 transition-colors font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/product/${product.id}/edit`)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-900 rounded hover:bg-blue-200 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product.id)}
                      className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-900 rounded hover:bg-red-200 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Product?</h2>
              <p className="text-gray-600 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
