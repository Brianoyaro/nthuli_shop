import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryAPI, productAPI } from '../services/apiService';

// CATEGORY HOOKS
export const useCategories = () => useQuery({
  queryKey: ['categories'],
  queryFn: async () => {
    const { data } = await categoryAPI.getAllCategories();
    return data;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
});

export const useCategory = (id) => useQuery({
  queryKey: ['category', id],
  queryFn: async () => {
    const { data } = await categoryAPI.getCategory(id);
    return data;
  },
  enabled: !!id,
  staleTime: 1000 * 60 * 5,
});

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryData) => categoryAPI.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoryAPI.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => categoryAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// PRODUCT HOOKS
export const useProducts = () => useQuery({
  queryKey: ['products'],
  queryFn: async () => {
    const { data } = await productAPI.getAllProducts();
    return data;
  },
  staleTime: 1000 * 60 * 5,
});

export const useProduct = (id) => useQuery({
  queryKey: ['product', id],
  queryFn: async () => {
    const { data } = await productAPI.getProduct(id);
    return data;
  },
  enabled: !!id,
  staleTime: 1000 * 60 * 5,
});

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productData, images, primaryIndex }) =>
      productAPI.createProduct(productData, images, primaryIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, productData, images }) =>
      productAPI.updateProduct(id, productData, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => productAPI.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
