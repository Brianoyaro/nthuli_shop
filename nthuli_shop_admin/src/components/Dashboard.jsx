import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import CategoryModal from './CategoryModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: products = {} } = useProducts();
  const { data: categories = [] } = useCategories();

  // Modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Handle product interactions
  const handleViewProductDetail = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleCreateProduct = () => {
    navigate('/product/create');
  };



  // Handle category modal opening
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsCreatingCategory(false);
    setCategoryModalOpen(true);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsCreatingCategory(true);
    setCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="px-5 py-2.5 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow"
            >
              Orders
            </button>
            <button
              onClick={handleCreateProduct}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-lg"
            >
              + New Product
            </button>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition text-sm"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          </div>

          {/* Categories Grid */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => navigate(`/category/${category.id}`)}
                  className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-lg transition group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      {category.name}
                    </h3>
                    <span className="text-gray-500 group-hover:text-blue-600">
                      {
                        Object.values(products).flat().filter(
                          (p) => p.categoryName === category.name
                        ).length
                      }
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click to view products
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No categories yet. Create one to get started!
            </p>
          )}
        </div>

        {/* Products by Category Section */}
        {Object.keys(products).length > 0 ? (
          <div className="space-y-8">
            {Object.keys(products).map((category) => {
              const categoryProducts = products[category];
              // Find the category ID by matching with any product's categoryName
              const categoryId = categoryProducts.length > 0 
                ? categories.find(c => c.name === categoryProducts[0].categoryName)?.id 
                : null;
              const itemsPerPage = 6;
              const displayedProducts = categoryProducts.slice(0, itemsPerPage);
              const hasMore = categoryProducts.length > itemsPerPage;

              return (
                <div key={category} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {categoryProducts.length} items
                    </span>
                  </div>

                  {displayedProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {displayedProducts.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onViewDetail={handleViewProductDetail}
                            formatPrice={formatPrice}
                          />
                        ))}
                      </div>

                      {hasMore && (
                        <div className="mt-6 text-center">
                          <button
                            onClick={() => categoryId && navigate(`/category/${categoryId}`)}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                          >
                            View All ({categoryProducts.length})
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No products in this category.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              No products yet. Add one to get started!
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        category={selectedCategory}
        isCreating={isCreatingCategory}
      />
    </div>
  );
}

// Product Card Component
function ProductCard({ product, onViewDetail, formatPrice }) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [imageError, setImageError] = useState(false);
  
  const images = product.images && product.images.length > 0;
  const primaryImage = images ? product.images.find(img => img.primary) || product.images[0] : null;

  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return `${BACKEND_URL}${imageUrl}`;
  };

  const handleImageError = (e) => {
    console.error('❌ Image failed to load:', { 
      src: e.target.src, 
      productName: product.name,
      imageUrl: primaryImage?.imageUrl 
    });
    setImageError(true);
  };

  const fullImageUrl = getFullImageUrl(primaryImage?.imageUrl);

  return (
    <div
      onClick={() => onViewDetail(product)}
      className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer border border-gray-200 hover:border-blue-500 flex flex-col"
    >
      {/* Image Container */}
      <div className="h-32 bg-gray-200 overflow-hidden flex-shrink-0">
        {primaryImage && fullImageUrl && !imageError ? (
          <img
            src={fullImageUrl}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-full object-cover hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-xs">
            {imageError ? '⚠️ Error' : 'No Image'}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-gray-600 text-xs mb-2 line-clamp-1">
          {product.description}
        </p>

        <div className="flex justify-between items-start gap-2 mb-2">
          <span className="text-lg font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold flex-shrink-0">
            {product.type}
          </span>
        </div>

        <div className="text-xs text-gray-500 mb-2 line-clamp-1">
          {product.categoryName}
        </div>

        <div className="mt-auto p-1.5 bg-blue-50 rounded text-center text-xs font-semibold text-blue-700">
          View Details
        </div>
      </div>
    </div>
  );
}
