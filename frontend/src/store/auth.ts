import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth_token',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
