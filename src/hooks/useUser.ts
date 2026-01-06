import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../lib/api";
import { useAppStore } from "../store/useAppStore";
import type { UserOnboardingInput, UpdateUserInput } from "../types";

// ============================================
// QUERY KEYS
// ============================================

export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
  stats: () => [...userKeys.all, "stats"] as const,
  registrations: (filters?: Record<string, unknown>) =>
    [...userKeys.all, "registrations", filters] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Fetch current user profile
 */
export const useCurrentUser = () => {
  const setUser = useAppStore(state => state.setUser);

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const user = await userApi.getMe();
      setUser(user);
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Complete user onboarding
 */
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const setUser = useAppStore(state => state.setUser);

  return useMutation({
    mutationFn: (data: UserOnboardingInput) => userApi.completeOnboarding(data),
    onSuccess: user => {
      setUser(user);
      queryClient.setQueryData(userKeys.me(), user);
    },
  });
};

/**
 * Update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAppStore(state => state.setUser);

  return useMutation({
    mutationFn: (data: UpdateUserInput) => userApi.updateProfile(data),
    onSuccess: user => {
      setUser(user);
      queryClient.setQueryData(userKeys.me(), user);
    },
  });
};

/**
 * Fetch user stats
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: userApi.getStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch user registrations
 */
export const useUserRegistrations = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: userKeys.registrations(params),
    queryFn: () => userApi.getRegistrations(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
