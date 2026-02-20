import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import api from '../lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({

      user: null,
      accessToken: null,

      setAuth: (user, accessToken, refreshToken) => {

        // save tokens
        if (refreshToken)
          localStorage.setItem('refreshToken', refreshToken);

        localStorage.setItem('accessToken', accessToken);

        // save in zustand
        set({ user, accessToken });

      },

      logout: () => {

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        set({ user: null, accessToken: null });

      },

      fetchUser: async () => {

        const token = localStorage.getItem('accessToken');

        if (!token) return;

        try {

          // For demo purposes, if we have a token, we'll consider the user authenticated
          // In a real app, this would make an API call to validate the token
          if (token.startsWith('mock-access-token')) {
            // User is already authenticated via mock system
            return;
          }

          const { data } = await api.get<User>('/auth/me');

          set({

            user: data,
            accessToken: token,

          });

        } catch {

          get().logout();

        }

      },

    }),

    // ✅ FINAL FIX — REMOVE partialize
    {
      name: 'auth',
    }

  )
);
