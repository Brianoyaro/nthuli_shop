import { z } from 'zod';

// Category validation schema
export const categorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be at most 100 characters')
    .trim(),
});

// Base product validation schema
const baseProductSchema = {
  name: z.string()
    .min(3, 'Product name must be at least 3 characters')
    .max(200, 'Product name must be at most 200 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters')
    .trim(),
  price: z.coerce.number()
    .positive('Price must be a positive number')
    .refine((val) => val > 0, 'Price must be greater than 0'),
  type: z.enum([
    'SHOES',
    'CLOTHES',
    'FURNITURE',
    'KITCHEN_APPLIANCE',
  ], { message: 'Invalid product type' }),
  categoryId: z.coerce.number()
    .positive('Category ID must be positive'),
};

// Type-specific product schemas
export const shoeSchema = z.object({
  ...baseProductSchema,
  type: z.literal('SHOES'),
  gender: z.enum(['MALE', 'FEMALE', 'UNISEX'], { message: 'Please select a gender' }),
  material: z.string().min(1, 'Please select a material'),
});

export const clothesSchema = z.object({
  ...baseProductSchema,
  type: z.literal('CLOTHES'),
  clotheGender: z.enum(['MALE', 'FEMALE', 'UNISEX'], { message: 'Please select a gender' }),
  clotheMaterial: z.string().min(1, 'Please select a material'),
  clotheType: z.string().min(1, 'Please select a clothe type'),
});

export const furnitureSchema = z.object({
  ...baseProductSchema,
  type: z.literal('FURNITURE'),
  furnitureMaterial: z.string().min(1, 'Please select a material'),
  furnitureType: z.string().min(1, 'Please select a furniture type'),
});

export const kitchenApplianceSchema = z.object({
  ...baseProductSchema,
  type: z.literal('KITCHEN_APPLIANCE'),
  wattage: z.coerce.number()
    .positive('Wattage must be a positive number'),
  applianceFunction: z.string().min(1, 'Please select an appliance function'),
});

// Combined product schema with discriminated union
export const productSchema = z.discriminatedUnion('type', [
  shoeSchema,
  clothesSchema,
  furnitureSchema,
  kitchenApplianceSchema,
]);

// Enum options for form dropdowns
export const PRODUCT_TYPE_OPTIONS = [
  { value: 'SHOES', label: 'Shoe' },
  { value: 'CLOTHES', label: 'Clothes' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'KITCHEN_APPLIANCE', label: 'Kitchen Appliance' },
];

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'UNISEX', label: 'Unisex' },
];

export const SHOE_MATERIAL_OPTIONS = [
  { value: 'LEATHER', label: 'Leather' },
  { value: 'CONVERSE',label: 'Converse' },
];

export const CLOTHES_MATERIAL_OPTIONS = [
  { value: 'COTTON', label: 'Cotton' },
  { value: 'POLYESTER', label: 'Polyester' },
  { value: 'WOOL', label: 'Wool' },
];

export const CLOTHES_TYPE_OPTIONS = [
  { value: 'SHIRT', label: 'Shirt' },
  { value: 'T_SHIRT', label: 'T-Shirt' },
  { value: 'SKIRT', label: 'Skirt' },
  { value: 'DRESS', label: 'Dress' },
  { value: 'JACKET', label: 'Jacket' },
  { value: 'VEST', label: 'Vest' },
  { value: 'SHORT', label: 'Short' },
  { value: 'TROUSER', label: 'Trouser' },
];

export const FURNITURE_MATERIAL_OPTIONS = [
  { value: 'WOOD', label: 'Wood' },
  { value: 'METAL', label: 'Metal' },
  { value: 'PLASTIC', label: 'Plastic' },
];

export const FURNITURE_TYPE_OPTIONS = [
  { value: 'CHAIR', label: 'Chair' },
  { value: 'TABLE', label: 'Table' },
  { value: 'STAND', label: 'Stand' },
  { value: 'BED', label: 'Bed' },];

export const KITCHEN_APPLIANCE_FUNCTION_OPTIONS = [
  { value: 'CUTTING', label: 'Cutting' },
  { value: 'SERVING', label: 'Serving' },
  { value: 'COOKING', label: 'Cooking' },
  { value: 'OTHER', label: 'Other' },
];

export const productImageSchema = z.object({
  images: z.array(z.instanceof(File))
    .min(1, 'At least one image is required')
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      'Each image must be less than 5MB'
    )
    .refine(
      (files) => files.every((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)),
      'Only JPEG, PNG, and WebP images are allowed'
    ),
});

// Helper function to get schema for a specific type
export const getProductSchemaForType = (type) => {
  switch (type) {
    case 'SHOES':
      return shoeSchema;
    case 'CLOTHES':
      return clothesSchema;
    case 'FURNITURE':
      return furnitureSchema;
    case 'KITCHEN_APPLIANCE':
      return kitchenApplianceSchema;
    default:
      return z.object(baseProductSchema);
  }
};
