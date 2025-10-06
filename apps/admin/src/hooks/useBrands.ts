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
}

export function useBrands(params: BrandSearchParams = {}) {
  const { showError } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['brands', params],
    queryFn: async () => {
      const response = await brandApi.getAllBrands(
        params.page,
        params.pageSize,
        params.searchTerm,
        params.categoryId,
        params.isActive
      );
      if (response && response.success && response.data) {
        return response.data;
      }
      // Handle fallback or error
      if (response && typeof response === 'object' && response.brands) {
        return response;
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
  
  const brands = data?.brands || [];
  const totalPages = data?.totalPages || 1;
  const totalBrands = data?.total || 0;

  return {
    brands,
    isLoading,
    totalPages,
    totalBrands,
    deleteBrand: deleteBrandMutation.mutateAsync,
    toggleBrandStatus: toggleBrandStatusMutation.mutateAsync,
  };
}
