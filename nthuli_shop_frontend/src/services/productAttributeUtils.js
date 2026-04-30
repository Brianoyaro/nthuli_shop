/**
 * Extract and format product attributes based on product type
 * Handles all product types: SHOES, CLOTHES, FURNITURE, KITCHEN_APPLIANCE
 */
export const getProductAttributesForDisplay = (product) => {
  if (!product) return [];

  const attributes = [];
  const productType = product.type || product.categoryName;

  // Utility function to add attribute if it exists
  const addAttribute = (label, value) => {
    if (value !== null && value !== undefined && value !== '') {
      attributes.push({
        label,
        value: formatValue(value),
        category: 'general',
      });
    }
  };

  // Utility function to format enum values to readable text
  const formatValue = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    return value;
  };

  // Get base attributes for all products
  if (product.wattage !== null && product.wattage !== undefined) {
    addAttribute('Power Consumption', `${product.wattage}W`);
  }

  // Product type-specific attributes
  switch (productType?.toUpperCase()) {
    case 'SHOES':
      if (product.gender || product.attributes?.gender) {
        addAttribute('Gender', product.gender || product.attributes.gender);
      }
      if (product.material || product.attributes?.material) {
        addAttribute('Material', product.material || product.attributes.material);
      }
      break;

    case 'CLOTHES':
      if (product.clotheGender || product.gender || product.attributes?.gender) {
        addAttribute('Gender', product.clotheGender || product.gender || product.attributes?.gender);
      }
      if (product.clotheType || product.attributes?.type) {
        addAttribute('Type', product.clotheType || product.attributes?.type);
      }
      if (product.clotheMaterial || product.attributes?.material) {
        addAttribute('Material', product.clotheMaterial || product.attributes?.material);
      }
      if (product.attributes?.sizes) {
        addAttribute('Available Sizes', product.attributes.sizes.join(', '));
      }
      if (product.attributes?.colors) {
        addAttribute('Available Colors', product.attributes.colors.join(', '));
      }
      break;

    case 'FURNITURE':
      if (product.furnitureCategory || product.attributes?.furnitureCategory) {
        addAttribute('Furniture Category', product.furnitureCategory || product.attributes.furnitureCategory);
      }
      if (product.furnitureType || product.attributes?.furnitureType) {
        addAttribute('Furniture Type', product.furnitureType || product.attributes.furnitureType);
      }
      if (product.furnitureMaterial || product.attributes?.material) {
        addAttribute('Material', product.furnitureMaterial || product.attributes.material);
      }
      // Additional furniture attributes
      if (product.attributes?.dimensions) {
        addAttribute('Dimensions', product.attributes.dimensions);
      }
      if (product.attributes?.weight) {
        addAttribute('Weight', product.attributes.weight);
      }
      if (product.attributes?.color) {
        addAttribute('Color', product.attributes.color);
      }
      break;

    case 'KITCHEN_APPLIANCE':
      if (product.applianceFunction || product.attributes?.applianceFunction) {
        addAttribute('Function', product.applianceFunction || product.attributes.applianceFunction);
      }
      if (product.wattage || product.attributes?.wattage) {
        addAttribute('Power Consumption', `${product.wattage || product.attributes.wattage}W`);
      }
      if (product.attributes?.capacity) {
        addAttribute('Capacity', product.attributes.capacity);
      }
      if (product.attributes?.warranty) {
        addAttribute('Warranty', product.attributes.warranty);
      }
      break;

    default:
      // For unknown types, show all non-null attributes
      Object.entries(product).forEach(([key, value]) => {
        if (
          value &&
          typeof value !== 'object' &&
          !['id', 'name', 'description', 'price', 'images', 'categoryName'].includes(key)
        ) {
          addAttribute(formatValue(key), value);
        }
      });
  }

  return attributes;
};

/**
 * Get a descriptive label for a product attribute
 */
export const getAttributeLabel = (key) => {
  const labels = {
    gender: 'Gender',
    material: 'Material',
    clotheGender: 'Gender',
    clotheType: 'Clothing Type',
    clotheMaterial: 'Material',
    furnitureCategory: 'Furniture Category',
    furnitureType: 'Furniture Type',
    furnitureMaterial: 'Material',
    applianceFunction: 'Function',
    wattage: 'Power Consumption',
  };

  return labels[key] || key.replace(/_/g, ' ').toUpperCase();
};

/**
 * Group attributes by category for organized display
 */
export const groupAttributesByCategory = (attributes) => {
  const grouped = {
    specifications: [],
    materials: [],
    dimensions: [],
    other: [],
  };

  attributes.forEach(attr => {
    const label = attr.label.toLowerCase();

    if (label.includes('material') || label.includes('color')) {
      grouped.materials.push(attr);
    } else if (
      label.includes('dimension') ||
      label.includes('weight') ||
      label.includes('capacity') ||
      label.includes('size')
    ) {
      grouped.dimensions.push(attr);
    } else if (
      label.includes('gender') ||
      label.includes('type') ||
      label.includes('category') ||
      label.includes('function')
    ) {
      grouped.specifications.push(attr);
    } else {
      grouped.other.push(attr);
    }
  });

  // Remove empty categories
  return Object.fromEntries(
    Object.entries(grouped).filter(([_, items]) => items.length > 0)
  );
};

/**
 * Check if product has any attributes to display
 */
export const hasProductAttributes = (product) => {
  const attributes = getProductAttributesForDisplay(product);
  return attributes.length > 0;
};
