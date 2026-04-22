import { useCartStore } from '../store/cartStore';
import { useToast } from '../context/ToastContext';

export function ProductCard({ product, onViewDetails, variant = 'grid' }) {
  const addToCart = useCartStore(state => state.addToCart);
  const { success } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    success(`${product.name} added to cart!`);
  };

  // Get primary image or first image
  const primaryImage = product.images?.find(img => img.primary) || product.images?.[0];
  const imageUrl = primaryImage?.imageUrl
    ? `http://localhost:8080${primaryImage.imageUrl}`
    : 'https://via.placeholder.com/300x300?text=No+Image';

  // Calculate discount (mock data - can be added to backend later)
  const originalPrice = product.originalPrice || null;
  const discount = originalPrice ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : null;
  const savings = originalPrice ? Math.round(originalPrice - product.price) : null;

  if (variant === 'carousel') {
    return (
      <div className="flex-shrink-0 w-48 cursor-pointer group">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          {/* Product Image with Discount Badge */}
          <div className="relative overflow-hidden bg-gray-100 h-48">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onClick={onViewDetails}
            />
            {discount && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {discount}% off
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-3">
            <h3
              className="text-sm font-semibold text-gray-800 line-clamp-2 cursor-pointer hover:text-blue-600 mb-2"
              onClick={onViewDetails}
            >
              {product.name}
            </h3>

            {/* Price Section */}
            <div className="mb-3">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-lg font-bold text-gray-900">
                  KSH {product.price.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    KSH {originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {savings && (
                <p className="text-xs text-green-600 font-semibold">
                  Save KSH {savings.toFixed(2)}
                </p>
              )}
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image with Discount Badge */}
      <div className="relative bg-gray-100 overflow-hidden cursor-pointer h-64">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onClick={onViewDetails}
        />
        {discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
            {discount}% off
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category Badge */}
        <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-100 rounded-full px-2 py-1 mb-2 capitalize">
          {product.categoryName || product.type}
        </span>

        {/* Product Name */}
        <h3
          className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
          onClick={onViewDetails}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900">
                KSH {product.price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  KSH {originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {savings && (
            <p className="text-sm text-green-600 font-semibold">
              Save KSH {savings.toFixed(2)}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 border border-blue-600 text-blue-600 py-1 sm:py-2 rounded hover:bg-blue-50 transition-colors text-xs sm:text-sm font-medium"
          >
            View Details
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-blue-600 text-white py-1 sm:py-2 rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
