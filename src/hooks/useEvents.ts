import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "../lib/api";

// ============================================
// QUERY KEYS
// ============================================

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: number) => [...eventKeys.details(), id] as const,
};

// ============================================
// HOOKS
// ============================================

/**
 * Fetch all events (published only for users)
 */
export const useEvents = (params?: {
  city?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventsApi.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch single event by ID
 */
export const useEvent = (id: number) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsApi.getById(id),
    staleTime: 2 * 60 * 1000,
    enabled: !!id,
  });
};

/**
 * Register for an event
 */
export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      paymentNote,
    }: {
      eventId: number;
      paymentNote?: string;
    }) => eventsApi.register(eventId, { paymentNote }),
    onSuccess: () => {
      // Invalidate events and user registrations
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: ["user", "registrations"] });
    },
  });
};

/**
 * Upload payment screenshot
 */
export const useUploadScreenshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      registrationId,
      file,
    }: {
      registrationId: number;
      file: File;
    }) => eventsApi.uploadScreenshot(registrationId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "registrations"] });
    },
  });
};
