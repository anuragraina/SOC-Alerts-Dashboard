import axios from 'axios';
import { useAuthStore } from '../store/auth';
import type {
  Alert,
  AlertFilters,
  AlertPatch,
  AlertStats,
  PaginatedResponse,
  User,
} from '../types';

export const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

function filtersToParams(filters: AlertFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.page !== undefined) params.page = String(filters.page);
  if (filters.pageSize !== undefined)
    params.pageSize = String(filters.pageSize);
  if (filters.severity?.length) params.severity = filters.severity.join(',');
  if (filters.status?.length) params.status = filters.status.join(',');
  if (filters.category?.length) params.category = filters.category.join(',');
  if (filters.source) params.source = filters.source;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.search) params.search = filters.search;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortDir) params.sortDir = filters.sortDir;
  return params;
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  const res = await apiClient.post<{ data: { token: string; user: User } }>(
    '/auth/login',
    { email, password },
  );
  return res.data.data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    useAuthStore.getState().logout();
  }
}

export async function getAlerts(
  filters: AlertFilters,
): Promise<PaginatedResponse<Alert>> {
  const res = await apiClient.get<PaginatedResponse<Alert>>('/alerts', {
    params: filtersToParams(filters),
  });
  return res.data;
}

export async function getAlert(id: string): Promise<Alert> {
  const res = await apiClient.get<{ data: Alert }>(`/alerts/${id}`);
  return res.data.data;
}

export async function updateAlert(
  id: string,
  patch: AlertPatch,
): Promise<Alert> {
  const res = await apiClient.patch<{ data: Alert }>(`/alerts/${id}`, patch);
  return res.data.data;
}

export async function getAlertStats(): Promise<AlertStats> {
  const res = await apiClient.get<{ data: AlertStats }>('/alerts/stats');
  return res.data.data;
}
