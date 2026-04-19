import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProduct, useCategories, useUpdateProduct } from '../hooks/useApi';
import { getProductSchemaForType, PRODUCT_TYPE_OPTIONS, GENDER_OPTIONS, SHOE_MATERIAL_OPTIONS, CLOTHES_MATERIAL_OPTIONS, CLOTHES_TYPE_OPTIONS, FURNITURE_MATERIAL_OPTIONS, FURNITURE_TYPE_OPTIONS, KITCHEN_APPLIANCE_FUNCTION_OPTIONS } from '../schemas/validationSchemas';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const { data: product, isLoading: productLoading } = useProduct(id);
  const { data: categories } = useCategories();
  const updateProductMutation = useUpdateProduct();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Initialize type once product loads
  const schema = selectedType ? getProductSchemaForType(selectedType) : undefined;
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onChange',
    defaultValues: product ? {
      type: product.type,
      categoryId: String(product.categoryId || ''),
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      ...(product.type === 'SHOES' && { gender: product.gender, material: product.material }),
      ...(product.type === 'CLOTHES' && { clotheGender: product.clotheGender, clotheMaterial: product.clotheMaterial, clotheType: product.clotheType }),
      ...(product.type === 'FURNITURE' && { furnitureMaterial: product.furnitureMaterial, furnitureType: product.furnitureType }),
      ...(product.type === 'KITCHEN_APPLIANCE' && { wattage: String(product.wattage || ''), applianceFunction: product.applianceFunction }),
    } : undefined,
  });

  const typeValue = watch('type');

  // Initialize when product loads
  if (product && !selectedType) {
    setSelectedType(product.type);
    setExistingImages(product.images || []);
  }

  // Image handling
  const handleImageSelect = (files) => {
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(prev => [...prev, file]);
        setPreviewUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e) => {
    handleImageSelect(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files) {
      handleImageSelect(e.dataTransfer.files);
    }
  };

  const removeNewImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return `${BACKEND_URL}${imageUrl}`;
  };

  const onSubmit = async (data) => {
    if (existingImages.length === 0 && selectedImages.length === 0) {
      alert('Product must have at least one image');
      return;
    }

    try {
      const allImages = [...existingImages, ...selectedImages];
      await updateProductMutation.mutateAsync({
        id,
        productData: data,
        images: allImages,
      });
      navigate(`/product/${id}`);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (typeValue) {
      case 'SHOES':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    {GENDER_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              />
              {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
              <Controller
                name="material"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Material</option>
                    {SHOE_MATERIAL_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              />
              {errors.material && <p className="text-red-600 text-sm mt-1">{errors.material.message}</p>}
            </div>
          </>
        );
      case 'CLOTHES':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
              <Controller
                name="clotheGender"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    {GENDER_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              />
              {errors.clotheGender && <p className="text-red-600 text-sm mt-1">{errors.clotheGender.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
              <Controller
                name="clotheMaterial"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Material</option>
                    {CLOTHES_MATERIAL_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              />
              {errors.clotheMaterial && <p className="text-red-600 text-sm mt-1">{errors.clotheMaterial.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <Controller
                name="clotheType"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {CLOTHES_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              />
              {errors.clotheType && <p className="text-red-600 text-sm mt-1">{errors.clotheType.message}</p>}
            </div>
          </>
        );
      case 'FURNITURE':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
              <Controller
                name="furnitureMaterial"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Material</option>
                    {FURNITURE_MATERIAL_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              />
              {errors.furnitureMaterial && <p className="text-red-600 text-sm mt-1">{errors.furnitureMaterial.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <Controller
                name="furnitureType"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {FURNITURE_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              />
              {errors.furnitureType && <p className="text-red-600 text-sm mt-1">{errors.furnitureType.message}</p>}
            </div>
          </>
        );
      case 'KITCHEN_APPLIANCE':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wattage *</label>
              <Controller
                name="wattage"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter wattage"
                  />
                )}
              />
              {errors.wattage && <p className="text-red-600 text-sm mt-1">{errors.wattage.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Function *</label>
              <Controller
                name="applianceFunction"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Function</option>
                    {KITCHEN_APPLIANCE_FUNCTION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              />
              {errors.applianceFunction && <p className="text-red-600 text-sm mt-1">{errors.applianceFunction.message}</p>}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-xl text-gray-600">Product not found</div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <button
            onClick={() => navigate(`/product/${id}`)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Images */}
          <div className="space-y-6">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Images ({existingImages.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {existingImages.map((img, index) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={getFullImageUrl(img.imageUrl)}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {img.primary && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          Primary
                        </div>
                      )}
                      <button
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drag and Drop Area */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
            >
              <div className="space-y-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Add more images
                  </p>
                  <p className="text-sm text-gray-600 mt-1">or</p>
                </div>
                <label className="inline-block">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <span className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition">
                    Click to select images
                  </span>
                </label>
              </div>
            </div>

            {/* New Image Preview */}
            {previewUrls.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  New Images ({previewUrls.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {previewUrls.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Product Type (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type
                </label>
                <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 font-medium">
                  {typeValue}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories?.map(cat => (
                        <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.categoryId && <p className="text-red-600 text-sm mt-1">{errors.categoryId.message}</p>}
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product name"
                    />
                  )}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter price"
                    />
                  )}
                />
                {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product description"
                    />
                  )}
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
              </div>

              {/* Type-Specific Fields */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {typeValue === 'SHOES' ? 'Shoe Details' :
                   typeValue === 'CLOTHES' ? 'Clothes Details' :
                   typeValue === 'FURNITURE' ? 'Furniture Details' :
                   'Kitchen Appliance Details'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {renderTypeSpecificFields()}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate(`/product/${id}`)}
                  className="flex-1 px-6 py-2 bg-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;
