import axios from "axios";
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  UserOnboardingInput,
  UpdateUserInput,
  UserStats,
  Event,
  Registration,
  PaymentInfo,
} from "../types";
import { logApiError } from "../components/debug/ErrorOverlay";

// ============================================
// AXIOS INSTANCE
// ============================================

const api = axios.create({
  baseURL:
    (import.meta.env.VITE_API_BASE_URL as string) ??
    "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ============================================
// AUTH HEADER INTERCEPTOR
// ============================================

let initData: string | null = null;

export const setInitData = (data: string) => {
  initData = data;
};

api.interceptors.request.use(config => {
  if (initData) {
    config.headers.Authorization = `tma ${initData}`;
  }
  return config;
});

// ============================================
// ERROR RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const message = error.response?.data?.message || error.message || "Unknown error";
    const details = JSON.stringify(error.response?.data, null, 2);

    logApiError(
      `${method} ${url}: ${message}`,
      status,
      `${error.config?.baseURL}${url}`,
      details
    );

    return Promise.reject(error);
  }
);

// ============================================
// USER API
// ============================================

export const userApi = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>("/users/me");
    return data.data;
  },

  completeOnboarding: async (input: UserOnboardingInput): Promise<User> => {
    const { data } = await api.post<ApiResponse<User>>(
      "/users/onboarding",
      input
    );
    return data.data;
  },

  updateProfile: async (input: UpdateUserInput): Promise<User> => {
    const { data } = await api.patch<ApiResponse<User>>("/users/me", input);
    return data.data;
  },

  getStats: async (): Promise<UserStats> => {
    const { data } = await api.get<ApiResponse<UserStats>>("/users/me/stats");
    return data.data;
  },

  getRegistrations: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Registration>> => {
    const { data } = await api.get<PaginatedResponse<Registration>>(
      "/users/me/registrations",
      { params }
    );
    return data;
  },
};

// ============================================
// EVENTS API
// ============================================

export const eventsApi = {
  getAll: async (params?: {
    city?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Event>> => {
    const { data } = await api.get<PaginatedResponse<Event>>("/events", {
      params,
    });
    return data;
  },

  getById: async (id: number): Promise<Event> => {
    const { data } = await api.get<ApiResponse<Event>>(`/events/${id}`);
    return data.data;
  },

  register: async (
    eventId: number,
    input: { paymentNote?: string }
  ): Promise<Registration> => {
    const { data } = await api.post<ApiResponse<Registration>>(
      `/events/${eventId}/register`,
      input
    );
    return data.data;
  },

  uploadScreenshot: async (
    registrationId: number,
    file: File
  ): Promise<Registration> => {
    const formData = new FormData();
    formData.append("screenshot", file);

    const { data } = await api.post<ApiResponse<Registration>>(
      `/registrations/${registrationId}/screenshot`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data.data;
  },
};

// ============================================
// PAYMENT INFO API
// ============================================

export const paymentApi = {
  getActive: async (): Promise<PaymentInfo> => {
    const { data } = await api.get<ApiResponse<PaymentInfo>>(
      "/payment-info/active"
    );
    return data.data;
  },
};

export default api;
