import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct, useDeleteProduct } from '../hooks/useApi';
import ImageCarousel from '../components/ImageCarousel';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: product, isLoading } = useProduct(id);
  const deleteMutation = useDeleteProduct();

  if (isLoading) {
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleEdit = () => {
    navigate(`/product/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(product.id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const getTypeSpecificFields = (type) => {
    switch (type) {
      case 'SHOES':
        return {
          title: 'Shoe Details',
          fields: [
            { label: 'Gender', value: product.gender },
            { label: 'Material', value: product.material },
          ],
        };
      case 'CLOTHES':
        return {
          title: 'Clothes Details',
          fields: [
            { label: 'Gender', value: product.clotheGender },
            { label: 'Material', value: product.clotheMaterial },
            { label: 'Type', value: product.clotheType },
          ],
        };
      case 'FURNITURE':
        return {
          title: 'Furniture Details',
          fields: [
            { label: 'Material', value: product.furnitureMaterial },
            { label: 'Type', value: product.furnitureType },
          ],
        };
      case 'KITCHEN_APPLIANCE':
        return {
          title: 'Kitchen Appliance Details',
          fields: [
            { label: 'Wattage', value: `${product.wattage}W` },
            { label: 'Function', value: product.applianceFunction },
          ],
        };
      default:
        return null;
    }
  };

  const typeDetails = getTypeSpecificFields(product.type);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          {/*Action Buttons*/}
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Edit Product
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
            >
              Delete Product
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Image Carousel */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Product Images</h2>
            <ImageCarousel images={product.images} productName={product.name} />
          </div>

          {/* Right: Product Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <p className="text-lg text-gray-900 font-semibold">{product.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <p className="text-gray-900">{product.categoryName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
                    {product.type}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-gray-700 text-justify leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Type-Specific Details */}
            {typeDetails && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{typeDetails.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {typeDetails.fields.map((field, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <p className="text-gray-900 font-semibold text-sm">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Count */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Images</h2>
              <p className="text-gray-700">
                <span className="font-semibold text-2xl text-blue-600">{product.images?.length || 0}</span>
                <span className="text-gray-600"> image{product.images?.length !== 1 ? 's' : ''}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Product</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
