import { useCartStore } from '../store/cartStore';
import { Button } from './Button';

export function ProductCard({ product, onViewDetails }) {
  const addToCart = useCartStore(state => state.addToCart);

  const handleAddToCart = () => {
    addToCart(product);
    alert('Added to cart!');
  };

  // Get primary image or first image
  const primaryImage = product.images?.find(img => img.primary) || product.images?.[0];
  const imageUrl = primaryImage?.imageUrl
    ? `http://localhost:8080${primaryImage.imageUrl}`
    : 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="bg-gray-100 overflow-hidden cursor-pointer h-64">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onClick={onViewDetails}
        />
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

        {/* Product Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewDetails}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
