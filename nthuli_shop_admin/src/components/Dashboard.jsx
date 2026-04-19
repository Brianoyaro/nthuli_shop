import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useApi';
import CategoryModal from './CategoryModal';

export default function Dashboard() {
  const navigate = useNavigate();
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
          <button
            onClick={handleCreateProduct}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-lg"
          >
            + New Product
          </button>
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
            {Object.keys(products).map((category) => (
              <div key={category} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-200">
                  {category}
                </h2>

                {products[category].length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products[category].map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onViewDetail={handleViewProductDetail}
                        formatPrice={formatPrice}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No products in this category.
                  </p>
                )}
              </div>
            ))}
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
      className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer border border-gray-200 hover:border-blue-500"
    >
      {/* Image Container */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {primaryImage && fullImageUrl && !imageError ? (
          <img
            src={fullImageUrl}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-full object-cover hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
            {imageError ? '⚠️ Image Error' : 'No Image'}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
            {product.type}
          </span>
        </div>

        <div className="text-xs text-gray-500">
          Category: {product.categoryName}
        </div>

        <div className="mt-3 p-2 bg-blue-50 rounded text-center text-xs font-semibold text-blue-700">
          Click to View Details
        </div>
      </div>
    </div>
  );
}
