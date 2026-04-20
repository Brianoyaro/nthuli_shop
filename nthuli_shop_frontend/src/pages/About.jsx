import { useNavigate } from 'react-router-dom';

export function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Nthuli Shop</h1>
          <p className="text-xl text-blue-100">
            Discover the story behind your favorite online shopping destination
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            {/* Left - Image */}
            <div>
              <img
                src="https://picsum.photos/500/400?random=about"
                alt="About Nthuli Shop"
                className="rounded-lg shadow-lg w-full"
              />
            </div>

            {/* Right - Content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Nthuli Shop was founded with a simple mission: to bring quality products to customers at unbeatable prices. We believe that online shopping should be convenient, reliable, and enjoyable for everyone.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Since our inception, we've grown from a small startup to a trusted e-commerce platform serving thousands of customers. Our commitment to excellence and customer satisfaction remains unchanged.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex-1 min-w-48">
                  <h3 className="text-2xl font-bold text-blue-600">10K+</h3>
                  <p className="text-gray-600">Happy Customers</p>
                </div>
                <div className="flex-1 min-w-48">
                  <h3 className="text-2xl font-bold text-blue-600">5K+</h3>
                  <p className="text-gray-600">Products Available</p>
                </div>
                <div className="flex-1 min-w-48">
                  <h3 className="text-2xl font-bold text-blue-600">100%</h3>
                  <p className="text-gray-600">Satisfaction Guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-gray-50 rounded-lg p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">★</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quality</h3>
                <p className="text-gray-700">
                  We carefully curate every product to ensure it meets our high standards and your expectations.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">✓</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trust</h3>
                <p className="text-gray-700">
                  Transparency and honesty are at the core of everything we do. We're here to serve you.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-white">♡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customer First</h3>
                <p className="text-gray-700">
                  Your satisfaction is our priority. We go the extra mile to make you happy.
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Nthuli Shop?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Fast Shipping</h3>
                  <p className="text-gray-700">Quick and reliable delivery to your doorstep</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Easy Returns</h3>
                  <p className="text-gray-700">30-day money-back guarantee on all products</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Best Prices</h3>
                  <p className="text-gray-700">Competitive pricing with frequent discounts</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">24/7 Support</h3>
                  <p className="text-gray-700">Always available to help with your questions</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Explore our amazing collection of products and find exactly what you're looking for.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
