import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

// ============================================
// APP STORE
// ============================================

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// Use `as never` to bypass complex middleware type inference issues in zustand v5
// This is a known workaround for TypeScript + zustand persist middleware
export const useAppStore = create<AppState>()(
  persist(
    set => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: (user: User | null) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "events-app-store",
    }
  ) as never
);

// ============================================
// SELECTORS
// ============================================

export const useUser = () => useAppStore(state => state.user);
export const useIsAuthenticated = () =>
  useAppStore(state => state.isAuthenticated);
export const useIsLoading = () => useAppStore(state => state.isLoading);
export const useIsOnboarded = () =>
  useAppStore(state => state.user?.isOnboarded ?? false);
