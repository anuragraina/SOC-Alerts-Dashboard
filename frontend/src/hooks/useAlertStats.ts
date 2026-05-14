import { useQuery } from '@tanstack/react-query';
import { getAlertStats } from '../api/client';

export function useAlertStats() {
  return useQuery({
    queryKey: ['alert-stats'],
    queryFn: getAlertStats,
  });
}
