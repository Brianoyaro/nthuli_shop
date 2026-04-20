import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '../components/ProductCard';
import { productsAPI } from '../services/api';

export function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll,
  });

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Extract categories from the data
  const categories = productsData
    ? Object.keys(productsData).map(key => ({
        id: key,
        name: key.charAt(0) + key.slice(1).toLowerCase(),
        slug: key.toLowerCase(),
      }))
    : [];

  // Get max price from all products for slider
  const maxAvailablePrice = useMemo(() => {
    if (!productsData) return 10000;
    const allProducts = Object.values(productsData).flat();
    return Math.ceil(Math.max(...allProducts.map(p => p.price), 10000) / 100) * 100;
  }, [productsData]);

  // Filter and sort products - used when a specific category is selected
  const filteredProducts = useMemo(() => {
    if (!productsData || !categoryParam) return [];

    const categoryKey = categoryParam.toUpperCase();
    let products = productsData[categoryKey] || [];

    // Apply price filter
    products = products.filter(
      p => p.price >= minPrice && p.price <= maxPrice
    );

    // Apply sorting
    if (sortBy === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      products.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'name') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }

    return products;
  }, [productsData, minPrice, maxPrice, sortBy, categoryParam]);

  // Group products by category with price filtering - used when no category is selected
  const groupedAndFilteredProducts = useMemo(() => {
    if (!productsData || categoryParam) return {};

    const grouped = {};
    Object.entries(productsData).forEach(([categoryKey, products]) => {
      // Apply price filter
      let filtered = products.filter(
        p => p.price >= minPrice && p.price <= maxPrice
      );

      // Apply sorting
      if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'newest') {
        filtered.sort((a, b) => b.id - a.id);
      } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      }

      grouped[categoryKey] = filtered;
    });

    return grouped;
  }, [productsData, minPrice, maxPrice, sortBy, categoryParam]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {categoryParam 
              ? categories.find(c => c.slug === categoryParam)?.name || 'All Products'
              : 'All Products'
            }
          </h1>
          <p className="text-gray-600 text-lg">
            {categoryParam 
              ? `Showing ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`
              : 'Browse products by category'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Filters */}
          <div
            className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1`}
          >
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6 sticky top-4">
              {/* Filter Header */}
              <div className="flex items-center justify-between lg:justify-start">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer hover:text-blue-600 transition-colors">
                    <input
                      type="radio"
                      name="category"
                      checked={!categoryParam}
                      onChange={() => navigate('/products')}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="ml-3 text-gray-700">All Categories</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center cursor-pointer hover:text-blue-600 transition-colors">
                      <input
                        type="radio"
                        name="category"
                        checked={categoryParam === cat.slug}
                        onChange={() => navigate(`/products?category=${cat.slug}`)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="ml-3 text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Price Range</h3>
                <div className="space-y-4">
                  {/* Min Price Slider */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Min: KSH {minPrice.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={maxAvailablePrice}
                      value={minPrice}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value);
                        if (newMin <= maxPrice) setMinPrice(newMin);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Max Price Slider */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Max: KSH {maxPrice.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={maxAvailablePrice}
                      value={maxPrice}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value);
                        if (newMax >= minPrice) setMaxPrice(newMax);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Price Display */}
                  <div className="text-sm font-medium text-gray-900 bg-blue-50 p-2 rounded">
                    KSH {minPrice.toLocaleString()} - KSH {maxPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(categoryParam || minPrice > 0 || maxPrice < maxAvailablePrice) && (
                <button
                  onClick={() => {
                    navigate('/products');
                    setMinPrice(0);
                    setMaxPrice(maxAvailablePrice);
                  }}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Products Grid - Grouped by Category */}
          <div className="lg:col-span-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>

              {/* Sort Dropdown */}
              <div className="ml-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="newest">Newest</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                </select>
              </div>
            </div>

            {/* Products Grid - Single Category View */}
            {categoryParam ? (
              filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={() => navigate(`/product/${product.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 text-lg font-medium">
                    No products found matching your filters.
                  </p>
                  <button
                    onClick={() => {
                      navigate('/products');
                      setMinPrice(0);
                      setMaxPrice(maxAvailablePrice);
                    }}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters & Try Again
                  </button>
                </div>
              )
            ) : (
              /* All Categories View */
              <div className="space-y-12">
                {categories.map(category => {
                  const categoryProducts = groupedAndFilteredProducts[category.id] || [];
                  const displayCount = 6;
                  const displayedProducts = categoryProducts.slice(0, displayCount);
                  const hasMore = categoryProducts.length > displayCount;

                  return (
                    <div key={category.id}>
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                        <span className="text-sm text-gray-500">
                          {categoryProducts.length} products
                        </span>
                      </div>

                      {/* Products Grid */}
                      {categoryProducts.length > 0 ? (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6">
                            {displayedProducts.map(product => (
                              <ProductCard
                                key={product.id}
                                product={product}
                                onViewDetails={() => navigate(`/product/${product.id}`)}
                              />
                            ))}
                          </div>

                          {/* Show More Button */}
                          {hasMore && (
                            <div className="flex justify-center">
                              <button
                                onClick={() => navigate(`/products?category=${category.slug}`)}
                                className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                Show More ({categoryProducts.length - displayCount} more)
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12 bg-gray-100 rounded-lg">
                          <p className="text-gray-500">
                            No products in {category.name} within this price range.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
