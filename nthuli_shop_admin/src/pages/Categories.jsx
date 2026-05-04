import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { categoryAPI } from '../services/apiService';
import toast from 'react-hot-toast';

export const Categories = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch categories
  const { data: categoriesResponse = [], isLoading, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        return Array.isArray(response.data) ? response.data : response.data.categories || [];
      } catch (err) {
        toast.error('Failed to load categories');
        throw err;
      }
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => categoryAPI.createCategory(data),
    onSuccess: () => {
      toast.success('Category created');
      refetch();
      setShowModal(false);
      setFormData({ name: '', description: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create category');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryAPI.updateCategory(id, data),
    onSuccess: () => {
      toast.success('Category updated');
      refetch();
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', description: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update category');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => categoryAPI.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted');
      refetch();
      setDeleteConfirm(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">Manage product categories</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ Add Category
          </button>
        </div>

        {/* Categories List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : categoriesResponse.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No categories yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create your first category
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              {categoriesResponse.map((category) => (
                <div key={category.id} className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="px-4 py-2 text-sm bg-blue-100 text-blue-900 rounded hover:bg-blue-200 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category.id)}
                      className="px-4 py-2 text-sm bg-red-100 text-red-900 rounded hover:bg-red-200 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingId ? 'Edit Category' : 'Add Category'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Electronics"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Category?</h2>
              <p className="text-gray-600 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
