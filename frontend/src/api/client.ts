import axios from 'axios';
import { useAuthStore } from '../store/auth';
import type { User } from '../types';

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
