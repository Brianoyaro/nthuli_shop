import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../context/ToastContext';
import { ImageGallery } from '../components/ImageGallery';
import { ProductCard } from '../components/ProductCard';
import { productsAPI } from '../services/api';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore(state => state.addToCart);
  const { success } = useToast();
  const [quantity, setQuantity] = useState(1);
  const carouselRef = useRef(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getById(id),
  });

  const { data: allProductsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll(),
  });

  // Handle API response format: { "CLOTHES": [...], "SHOES": [...], ... }
  const allProducts = allProductsData 
    ? Object.values(allProductsData).flat() 
    : [];

  // Get related products - same category, excluding current product
  const relatedProducts = product
    ? allProducts
        .filter(p => (p.type || p.categoryName) === (product.type || product.categoryName) && p.id !== product.id)
        .slice(0, 8)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Generate gallery images from product images
  const galleryImages = product.images?.map(img => `http://localhost:8080${img.imageUrl}`) || [
    'https://via.placeholder.com/500x600?text=Product+Image'
  ];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(value);
  };

  const handleScrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      if (direction === 'left') {
        carouselRef.current.scrollLeft -= scrollAmount;
      } else {
        carouselRef.current.scrollLeft += scrollAmount;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-gray-600">
          <button
            onClick={() => navigate('/')}
            className="hover:text-blue-600 transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => navigate('/products')}
            className="hover:text-blue-600 transition-colors"
          >
            Products
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white rounded-lg shadow-md p-6 md:p-8 mb-16">
          {/* Image Gallery - Left Column */}
          <div className="lg:col-span-1">
            <ImageGallery images={galleryImages} alt={product.name} />
          </div>

          {/* Product Info - Right Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Badge & Stock */}
            <div className="flex items-center justify-between">
              <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-100 rounded-full px-3 py-1 capitalize">
                {product.categoryName || product.type}
              </span>
              <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                In Stock
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
            </div>

            {/* Price Section */}
            <div className="border-b pb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl font-bold text-gray-900">
                  KSH {product.price.toFixed(2)}
                </span>
              </div>
              <p className="text-gray-600">Free shipping on orders over KSH 50</p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this product</h3>
              <p className="text-gray-700 leading-relaxed line-clamp-4">
                {product.description}
              </p>
            </div>

            {/* Product Details */}
            {(product.attributes?.material || product.attributes?.gender || product.clotheMaterial || product.clotheGender) && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {(product.attributes?.material || product.clotheMaterial) && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Material</p>
                      <p className="text-gray-900 font-semibold">{product.attributes?.material || product.clotheMaterial}</p>
                    </div>
                  )}
                  {(product.attributes?.gender || product.clotheGender || product.gender) && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gender</p>
                      <p className="text-gray-900 font-semibold capitalize">{product.attributes?.gender || product.clotheGender || product.gender}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Available Sizes */}
            {product.attributes?.sizes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Available Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {product.attributes.sizes.map(size => (
                    <button
                      key={size}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all font-medium"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Colors */}
            {product.attributes?.colors && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Available Colors</h3>
                <div className="flex flex-wrap gap-3">
                  {product.attributes.colors.map(color => (
                    <button
                      key={color}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-600 transition-all font-medium"
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                    >
                      −
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-16 text-center border-l border-r border-gray-300 py-2 focus:outline-none font-semibold"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
              >
                ADD TO CART
              </button>

              <button
                onClick={() => navigate('/products')}
                className="w-full border-2 border-blue-600 text-blue-600 font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>

            {/* Trust Signals */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Free shipping on orders over KSH 50</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">30-day money-back guarantee</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-1">✓</span>
                  <span className="text-gray-700">Secure checkout with SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
              <button
                onClick={() => navigate('/products')}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                See More →
              </button>
            </div>

            {/* Carousel */}
            <div className="relative group">
              {/* Left Arrow */}
              <button
                onClick={() => handleScrollCarousel('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ←
              </button>

              {/* Products Scroll Container */}
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {relatedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="carousel"
                    onViewDetails={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => handleScrollCarousel('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                →
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
