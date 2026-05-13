import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAlert, updateAlert } from '../api/client';
import type { Alert, AlertPatch, PaginatedResponse } from '../types';

export function useAlert(id: string | undefined) {
  const query = useQuery({
    queryKey: ['alert', id],
    queryFn: () => getAlert(id as string),
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      // Don't retry 404s — alert genuinely doesn't exist.
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useUpdateAlert(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: AlertPatch) => updateAlert(id, patch),
    // Optimistic update: patch the detail cache and any matching row in list caches
    // so the UI reflects the change immediately. Rolled back from `context` on error.
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ['alert', id] });
      await queryClient.cancelQueries({ queryKey: ['alerts'] });

      const previousAlert = queryClient.getQueryData<Alert>(['alert', id]);
      const previousLists = queryClient.getQueriesData<PaginatedResponse<Alert>>(
        { queryKey: ['alerts'] },
      );

      if (previousAlert) {
        queryClient.setQueryData<Alert>(['alert', id], {
          ...previousAlert,
          ...patch,
        });
      }

      for (const [key, list] of previousLists) {
        if (!list) continue;
        queryClient.setQueryData<PaginatedResponse<Alert>>(key, {
          ...list,
          data: list.data.map((row) =>
            row.id === id ? { ...row, ...patch } : row,
          ),
        });
      }

      return { previousAlert, previousLists };
    },
    onError: (_error, _patch, context) => {
      if (context?.previousAlert) {
        queryClient.setQueryData(['alert', id], context.previousAlert);
      }
      if (context?.previousLists) {
        for (const [key, list] of context.previousLists) {
          queryClient.setQueryData(key, list);
        }
      }
      toast.error('Failed to update alert');
    },
    onSuccess: (updated) => {
      // Reconcile with the server's authoritative copy (e.g. updated_at).
      queryClient.setQueryData(['alert', id], updated);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
