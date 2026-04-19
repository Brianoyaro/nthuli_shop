import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PRODUCT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  SHOE_MATERIAL_OPTIONS,
  CLOTHES_MATERIAL_OPTIONS,
  CLOTHES_TYPE_OPTIONS,
  FURNITURE_MATERIAL_OPTIONS,
  FURNITURE_TYPE_OPTIONS,
  KITCHEN_APPLIANCE_FUNCTION_OPTIONS,
  getProductSchemaForType,
} from '../schemas/validationSchemas';
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useApi';
import { useCategories } from '../hooks/useApi';

export default function ProductModal({
  isOpen,
  onClose,
  product = null,
  isCreating = false,
}) {
  const { data: categories = [] } = useCategories();
  const [selectedType, setSelectedType] = useState(product?.type || '');
  const [imageFiles, setImageFiles] = useState([]);

  // Use dynamic resolver based on selected type
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: selectedType ? zodResolver(getProductSchemaForType(selectedType)) : undefined,
    mode: 'onChange',
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || '',
      type: product?.type || '',
      categoryId: product?.categoryId || '',
      // Shoe fields
      gender: product?.gender || '',
      material: product?.material || '',
      // Clothes fields
      clotheGender: product?.clotheGender || '',
      clotheMaterial: product?.clotheMaterial || '',
      clotheType: product?.clotheType || '',
      // Furniture fields
      furnitureMaterial: product?.furnitureMaterial || '',
      furnitureType: product?.furnitureType || '',
      // Kitchen appliance fields
      wattage: product?.wattage || '',
      applianceFunction: product?.applianceFunction || '',
    },
  });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  // eslint-disable-next-line react-hooks/incompatible-library
  const typeValue = watch('type');

  // Update selectedType when type changes
  React.useEffect(() => {
    if (typeValue) {
      setSelectedType(typeValue);
    }
  }, [typeValue]);

  const onSubmit = async (data) => {
    try {
      if (imageFiles.length === 0 && isCreating) {
        alert('Please select at least one image');
        return;
      }

      const productData = {
        ...data,
        categoryId: parseInt(data.categoryId),
        price: parseFloat(data.price),
      };

      console.log('Product data before cleanup:', productData);

      // Remove empty fields based on type - keep ONLY fields for the selected type
      if (data.type !== 'SHOES') {
        delete productData.gender;
        delete productData.material;
      }
      if (data.type !== 'CLOTHES') {
        delete productData.clotheGender;
        delete productData.clotheMaterial;
        delete productData.clotheType;
      }
      if (data.type !== 'FURNITURE') {
        delete productData.furnitureMaterial;
        delete productData.furnitureType;
      }
      if (data.type !== 'KITCHEN_APPLIANCE') {
        delete productData.wattage;
        delete productData.applianceFunction;
      }

      console.log('Product data after cleanup:', productData);

      if (isCreating) {
        await createMutation.mutateAsync({
          productData,
          images: imageFiles,
          primaryIndex: 0,
        });
      } else {
        await updateMutation.mutateAsync({
          id: product.id,
          productData,
          images: imageFiles.length > 0 ? imageFiles : [new File([], '')],
        });
      }
      reset();
      setImageFiles([]);
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async () => {
    if (!product || isCreating) return;
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteMutation.mutateAsync(product.id);
        reset();
        setImageFiles([]);
        onClose();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl my-8">
        <h2 className="text-2xl font-bold mb-4">
          {isCreating ? 'Create Product' : 'Update Product'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Enter product name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              placeholder="Enter product description"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                {...register('price')}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Type Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                {...register('type')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              >
                <option value="">Select a type</option>
                {PRODUCT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              {...register('categoryId')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Type-Specific Fields */}
          {typeValue === 'SHOES' && (
            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-gray-700 mb-3">Shoe Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material
                  </label>
                  <select
                    {...register('material')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  >
                    <option value="">Select material</option>
                    {SHOE_MATERIAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.material && (
                    <p className="text-red-500 text-sm mt-1">{errors.material.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {typeValue === 'CLOTHES' && (
            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-gray-700 mb-3">Clothes Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    {...register('clotheGender')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.clotheGender && (
                    <p className="text-red-500 text-sm mt-1">{errors.clotheGender.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material
                  </label>
                  <select
                    {...register('clotheMaterial')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  >
                    <option value="">Select material</option>
                    {CLOTHES_MATERIAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.clotheMaterial && (
                    <p className="text-red-500 text-sm mt-1">{errors.clotheMaterial.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clothes Type
                </label>
                <select
                  {...register('clotheType')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                >
                  <option value="">Select clothes type</option>
                  {CLOTHES_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.clotheType && (
                  <p className="text-red-500 text-sm mt-1">{errors.clotheType.message}</p>
                )}
              </div>
            </div>
          )}

          {typeValue === 'FURNITURE' && (
            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-gray-700 mb-3">Furniture Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material
                  </label>
                  <select
                    {...register('furnitureMaterial')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  >
                    <option value="">Select material</option>
                    {FURNITURE_MATERIAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.furnitureMaterial && (
                    <p className="text-red-500 text-sm mt-1">{errors.furnitureMaterial.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Furniture Type
                  </label>
                  <select
                    {...register('furnitureType')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  >
                    <option value="">Select furniture type</option>
                    {FURNITURE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.furnitureType && (
                    <p className="text-red-500 text-sm mt-1">{errors.furnitureType.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {typeValue === 'KITCHEN_APPLIANCE' && (
            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-gray-700 mb-3">Kitchen Appliance Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wattage
                  </label>
                  <input
                    {...register('wattage')}
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                  {errors.wattage && (
                    <p className="text-red-500 text-sm mt-1">{errors.wattage.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Function
                  </label>
                  <select
                    {...register('applianceFunction')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  >
                    <option value="">Select function</option>
                    {KITCHEN_APPLIANCE_FUNCTION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.applianceFunction && (
                    <p className="text-red-500 text-sm mt-1">{errors.applianceFunction.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className="border-t-2 border-gray-200 pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images {!isCreating && '(Optional - leave empty to keep existing)'}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
            />
            {imageFiles.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {imageFiles.length} image(s) selected
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 border-t-2 border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancel
            </button>

            {!isCreating && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !selectedType}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading
                ? 'Saving...'
                : isCreating
                  ? 'Create'
                  : 'Update'}
            </button>
          </div>

          {/* Error Messages */}
          {(createMutation.isError ||
            updateMutation.isError ||
            deleteMutation.isError) && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {createMutation.error?.message ||
                updateMutation.error?.message ||
                deleteMutation.error?.message ||
                'An error occurred'}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
