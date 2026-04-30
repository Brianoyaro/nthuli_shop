import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '../components/ProductCard';
import { productsAPI } from '../services/api';
import { FaBox, FaArrowLeft } from 'react-icons/fa';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: productsAPI.getAll,
  });

  // Get all products flattened
  const allProducts = productsData
    ? Object.values(productsData).flat()
    : [];

  // Search filtering logic - same as navbar
  const searchResults = query.trim().length > 0
    ? allProducts.filter(product => {
        const searchTerm = query.toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(searchTerm);
        const descriptionMatch = product.description?.toLowerCase().includes(searchTerm);
        
        // Check type/category attributes
        const typeMatch = product.type?.toLowerCase().includes(searchTerm);
        const categoryMatch = product.categoryName?.toLowerCase().includes(searchTerm);
        
        // Check type-specific attributes
        const genderMatch = product.gender?.toLowerCase().includes(searchTerm) || 
                           product.clotheGender?.toLowerCase().includes(searchTerm);
        const materialMatch = product.material?.toLowerCase().includes(searchTerm) || 
                             product.clotheMaterial?.toLowerCase().includes(searchTerm) ||
                             product.furnitureMaterial?.toLowerCase().includes(searchTerm);
        const furnitureTypeMatch = product.furnitureType?.toLowerCase().includes(searchTerm);
        const furnitureCategoryMatch = product.furnitureCategory?.toLowerCase().includes(searchTerm);
        const clotheTypeMatch = product.clotheType?.toLowerCase().includes(searchTerm);
        const applianceFunctionMatch = product.applianceFunction?.toLowerCase().includes(searchTerm);
        const wattageMatch = product.wattage?.toString().includes(searchTerm);
        const capacityMatch = product.capacity?.toString().includes(searchTerm);
        const warrantyMatch = product.warranty?.toLowerCase().includes(searchTerm);
        
        return nameMatch || descriptionMatch || typeMatch || categoryMatch || genderMatch || 
               materialMatch || furnitureTypeMatch || furnitureCategoryMatch || clotheTypeMatch || 
               applianceFunctionMatch || wattageMatch || capacityMatch || warrantyMatch;
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Search Results
              </h1>
              <p className="text-gray-600">
                Search term: <span className="font-bold text-blue-600">"{query}"</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {searchResults.length}
              </p>
              <p className="text-gray-600 text-sm">
                {searchResults.length === 1 ? 'Product' : 'Products'} found
              </p>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <FaBox className="w-20 h-20 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No products found
            </h2>
            <p className="text-gray-600 text-center max-w-md mb-8">
              We couldn't find any products matching "<span className="font-semibold">{query}</span>". 
              Try adjusting your search or browse all products.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
