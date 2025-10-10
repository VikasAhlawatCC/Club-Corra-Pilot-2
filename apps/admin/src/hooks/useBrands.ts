import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandApi } from '@/lib/api';
import { useToast } from '@/components/common';
import type { Brand } from '@/types';

interface BrandSearchParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export function useBrands(params: BrandSearchParams = {}) {
  const { showError } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['brands', params],
    queryFn: async () => {
      const response = await brandApi.getAllBrands(
        params.page,
        params.pageSize,
        params.searchTerm,
        params.categoryId,
        params.isActive,
        params.sortBy,
        params.sortOrder
      );
      
      // The backend returns the data directly in the format { brands, total, page, limit, totalPages }
      if (response && typeof response === 'object' && response.brands) {
        return response;
      }
      
      // Handle wrapped response format if it exists
      if (response && response.success && response.data) {
        return response.data;
      }
      
      throw new Error('Invalid response from server');
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (brandId: string) => brandApi.deleteBrand(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error) => {
      console.error('Failed to delete brand:', error);
      showError('Failed to delete brand');
    },
  });

  const toggleBrandStatusMutation = useMutation({
    mutationFn: (brandId: string) => brandApi.toggleBrandStatus(brandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error) => {
      console.error('Failed to update brand status:', error);
      showError('Failed to update brand status');
    },
  });

  // Create a fetchBrands function that updates the query parameters and refetches
  const fetchBrands = async (newParams: BrandSearchParams) => {
    // Update the query key to trigger a refetch with new parameters
    await queryClient.invalidateQueries({ queryKey: ['brands'] });
    // The query will automatically refetch with the new params when they change
  };
  
  const brands = data?.brands || [];
  const totalPages = data?.totalPages || 1;
  const totalBrands = data?.total || 0;

  return {
    brands,
    isLoading,
    totalPages,
    totalBrands,
    fetchBrands,
    refetch,
    deleteBrand: deleteBrandMutation.mutateAsync,
    toggleBrandStatus: toggleBrandStatusMutation.mutateAsync,
  };
}
