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

  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
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

  const priceRanges = [
    { id: 'under-50', label: 'Under $50', min: 0, max: 50 },
    { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
    { id: '100-500', label: '$100 - $500', min: 100, max: 500 },
    { id: '500-plus', label: '$500+', min: 500, max: Infinity },
  ];

  // Flatten and filter products
  const filteredProducts = useMemo(() => {
    if (!productsData) return [];

    let filtered = [];
    
    if (categoryParam) {
      const categoryKey = categoryParam.toUpperCase();
      filtered = productsData[categoryKey] || [];
    } else {
      filtered = Object.values(productsData).flat();
    }

    // Filter by price range
    if (selectedPriceRange) {
      filtered = filtered.filter(
        p => p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max
      );
    }

    // Sort products
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [productsData, categoryParam, selectedPriceRange, sortBy]);

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
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Showing {filteredProducts.length} products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div
            className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1`}
          >
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between lg:justify-start">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={!categoryParam}
                      onChange={() => navigate('/products')}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-gray-700">All Categories</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={categoryParam === cat.slug}
                        onChange={() => navigate(`/products?category=${cat.slug}`)}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={!selectedPriceRange}
                      onChange={() => setSelectedPriceRange(null)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-gray-700">All Prices</span>
                  </label>
                  {priceRanges.map(range => (
                    <label key={range.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={selectedPriceRange?.id === range.id}
                        onChange={() => setSelectedPriceRange(range)}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(categoryParam || selectedPriceRange) && (
                <button
                  onClick={() => {
                    navigate('/products');
                    setSelectedPriceRange(null);
                  }}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
              >
                <option value="newest">Newest</option>
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
