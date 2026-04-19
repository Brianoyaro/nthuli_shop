import { useNavigate, useParams } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useApi';
import { useState } from 'react';

const CategoryProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: products = {} } = useProducts();
  const { data: categories = [] } = useCategories();
  const [imageError, setImageError] = useState({});

  const category = categories.find(cat => cat.id === parseInt(id));
  const categoryProducts = category 
    ? Object.values(products).flat().filter(p => p.categoryName === category.name)
    : [];

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return `${BACKEND_URL}${imageUrl}`;
  };

  const handleImageError = (productId) => {
    setImageError(prev => ({ ...prev, [productId]: true }));
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-xl text-gray-600">Category not found</div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
          </div>
          <button
            onClick={() => navigate('/product/create')}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-lg"
          >
            + New Product
          </button>
        </div>

        {/* Products Grid */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetail={() => navigate(`/product/${product.id}`)}
                onImageError={handleImageError}
                getFullImageUrl={getFullImageUrl}
                formatPrice={formatPrice}
                imageError={imageError}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-6">
              No products in this category yet.
            </p>
            <button
              onClick={() => navigate('/product/create')}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              + Add First Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Product Card Component
function ProductCard({ product, onViewDetail, onImageError, getFullImageUrl, formatPrice, imageError }) {
  const images = product.images && product.images.length > 0;
  const primaryImage = images ? product.images.find(img => img.primary) || product.images[0] : null;
  const fullImageUrl = getFullImageUrl(primaryImage?.imageUrl);
  const hasImageError = imageError[product.id];

  return (
    <div
      onClick={onViewDetail}
      className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer border border-gray-200 hover:border-blue-500"
    >
      {/* Image Container */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {primaryImage && fullImageUrl && !hasImageError ? (
          <img
            src={fullImageUrl}
            alt={product.name}
            onError={() => onImageError(product.id)}
            className="w-full h-full object-cover hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500 text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
          {product.images?.length > 0 && (
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
              {product.images.length} {product.images.length === 1 ? 'image' : 'images'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryProducts;
