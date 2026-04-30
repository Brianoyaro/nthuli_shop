import { getProductAttributesForDisplay, groupAttributesByCategory } from '../services/productAttributeUtils';

// const categoryIcons = {
//   specifications: '📋',
//   materials: '🧵',
//   dimensions: '📏',
//   other: 'ℹ️',
// };

const categoryTitles = {
  specifications: 'Specifications',
  materials: 'Materials & Colors',
  dimensions: 'Dimensions & Weight',
  other: 'Additional Info',
};

export function ProductAttributesDisplay({ product }) {
  if (!product) return null;

  const attributes = getProductAttributesForDisplay(product);
  
  if (attributes.length === 0) return null;

  const groupedAttributes = groupAttributesByCategory(attributes);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 md:p-8 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        {/* <span className="text-2xl">🏷️</span> */}
        Product Specifications
      </h3>

      <div className="space-y-6">
        {Object.entries(groupedAttributes).map(([category, attrs]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-gray-300">
              {/* <span className="text-lg">{categoryIcons[category]}</span> */}
              <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                {categoryTitles[category]}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {attrs.map((attr, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {attr.label}
                  </p>
                  <p className="text-sm md:text-base font-bold text-gray-900 break-words">
                    {attr.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Type Indicator */}
      <div className="mt-6 pt-6 border-t border-gray-300">
        <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Product Type
          </p>
          <p className="text-sm font-bold text-blue-900">
            {product.type || product.categoryName}
          </p>
        </div>
      </div>
    </div>
  );
}
