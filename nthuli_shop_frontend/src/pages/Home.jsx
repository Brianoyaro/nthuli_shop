import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { productsAPI } from '../services/api';

export function Home() {
  const navigate = useNavigate();
  const scrollContainers = useRef({});
  const [scrollPositions, setScrollPositions] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Carousel images
  const carouselImages = [
    '/home-carousal/shoes.jpg',
    '/home-carousal/clothes.jpg',
    '/home-carousal/furniture.jpg',
    '/home-carousal/kitchen_appliance.jpg',
  ];

  // Auto-rotate carousel images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll,
  });

  // Organize products by category
  const productsByCategory = productsData || {};

  // Get all products flat for featured
  const allProducts = productsData
    ? Object.values(productsData).flat()
    : [];

  // Extract categories from the data
  const categories = productsData
    ? Object.keys(productsData).map((categoryKey, idx) => ({
        id: idx + 1,
        name: categoryKey.charAt(0) + categoryKey.slice(1).toLowerCase(),
        slug: categoryKey.toLowerCase(),
        key: categoryKey,
      }))
    : [];

  const handleScroll = (direction, categoryKey) => {
    const container = scrollContainers.current[categoryKey];
    if (!container) return;

    const scrollAmount = 300;
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  const ProductCarousel = ({ title, products, categoryKey, showViewMore = true }) => {
    if (!products || products.length === 0) return null;

    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {showViewMore && (
              <button
                onClick={() => navigate(`/products?category=${categoryKey.toLowerCase()}`)}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                See More →
              </button>
            )}
          </div>

          {/* Carousel Container */}
          <div className="relative group">
            {/* Left Arrow */}
            <button
              onClick={() => handleScroll('left', categoryKey)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ←
            </button>

            {/* Products Scroll Container */}
            <div
              ref={(el) => (scrollContainers.current[categoryKey] = el)}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {products.slice(0, 8).map(product => (
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
              onClick={() => handleScroll('right', categoryKey)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              →
            </button>
          </div>
        </div>
      </section>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load products</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Full-Screen Carousel */}
        <div className="relative w-full h-full bg-gray-200">
              {/* Carousel Images */}
              {carouselImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Hero carousel ${index + 1}`}
                  className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}

              {/* Previous Button */}
              <button
                onClick={() =>
                  setCurrentImageIndex(
                    (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 rounded-full p-2 transition-all"
              >
                ←
              </button>

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 rounded-full p-2 transition-all"
              >
                →
              </button>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-white w-8'
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                  />
                ))}
              </div>
        </div>

        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white px-4 max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome to Nthuli Shop
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Discover premium quality products for every lifestyle. Shop the latest fashion, accessories, and more.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 1, name: 'Shoes', slug: 'shoes', image: '/shoes-category.jpg' },
              { id: 2, name: 'Clothes', slug: 'clothes', image: '/clothes-category.jpg' },
              { id: 3, name: 'Furniture', slug: 'furniture', image: '/furniture-category.jpg' },
              { id: 4, name: 'Kitchen Appliances', slug: 'kitchen', image: '/kitchen_appliances-category.jpg' },
            ].map(category => (
              <div
                key={category.id}
                className="cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => {
                  const categoryKey = categories.find(c => c.slug === category.slug)?.key;
                  if (categoryKey) navigate(`/products?category=${category.slug}`);
                }}
              >
                <div className="relative overflow-hidden bg-gray-200 h-48 rounded-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                    <h3 className="text-lg font-bold text-white text-center">{category.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Most Popular / Trending Section */}
      <ProductCarousel 
        title="Most Popular" 
        products={allProducts.slice(0, 10)}
        categoryKey="POPULAR"
        showViewMore={false}
      />

      {/* Category-based Carousels */}
      {categories.map(category => (
        <ProductCarousel
          key={category.id}
          title={category.name}
          products={productsByCategory[category.key]}
          categoryKey={category.key}
        />
      ))}

      {/* Top Deals Section */}
      {allProducts.length > 0 && (
        <ProductCarousel 
          title="Top Deals" 
          products={allProducts.sort((a, b) => b.price - a.price).slice(0, 10)}
          categoryKey="DEALS"
          showViewMore={false}
        />
      )}

      {/* Exclusive Deals Section */}
      {allProducts.length > 0 && (
        <ProductCarousel 
          title="Exclusive Deals ✨" 
          products={allProducts.slice().reverse().slice(0, 10)}
          categoryKey="EXCLUSIVE"
          showViewMore={false}
        />
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Exclusive Offers Await!</h2>
          <p className="text-xl text-blue-100 mb-8">
            Sign up for our newsletter to get the latest deals and updates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
