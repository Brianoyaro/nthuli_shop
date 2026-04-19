import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '../components/ProductCard';
import { productsAPI } from '../services/api';

export function Home() {
  const navigate = useNavigate();
  
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll,
  });

  // Transform grouped data into flat array and get first 6
  const featuredProducts = productsData
    ? Object.values(productsData).flat().slice(0, 6)
    : [];

  // Extract categories from the data
  const categories = productsData
    ? Object.keys(productsData).map((categoryKey, idx) => ({
        id: idx + 1,
        name: categoryKey.charAt(0) + categoryKey.slice(1).toLowerCase(),
        slug: categoryKey.toLowerCase(),
      }))
    : [];

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
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Hero Text */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome to Nthuli Shop
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Discover premium quality products for every lifestyle. Shop the latest fashion, accessories, and more.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Shop Now
              </button>
            </div>

            {/* Hero Image */}
            <div className="hidden md:block">
              <img
                src="https://picsum.photos/500/400?random=hero"
                alt="Hero"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map(category => (
              <div
                key={category.id}
                className="cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => navigate(`/products?category=${category.slug}`)}
              >
                <div className="relative overflow-hidden bg-gray-200 h-48 rounded-lg">
                  <img
                    src={`https://picsum.photos/400/300?random=${category.id}`}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
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
