// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: number;
  telegramId: string;
  username: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  city: string | null;
  isBlocked: boolean;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserOnboardingInput {
  fullName: string;
  phoneNumber: string;
  city?: string;
}

export interface UpdateUserInput {
  fullName?: string;
  phoneNumber?: string | null;
  city?: string | null;
}

export interface UserStats {
  totalRegistrations: number;
  approvedRegistrations: number;
  pendingRegistrations: number;
  rejectedRegistrations: number;
}

// ============================================
// EVENT TYPES
// ============================================

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export interface Event {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  city: string;
  address: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  price: string; // Decimal comes as string
  maxSeats: number;
  status: EventStatus;
  availableSeats?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// REGISTRATION TYPES
// ============================================

export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Registration {
  id: number;
  status: PaymentStatus;
  paymentScreenshotUrl: string | null;
  paymentScreenshotId: string | null;
  paidAmount: string | null;
  paymentNote: string | null;
  adminNote: string | null;
  reviewedAt: string | null;
  userId: number;
  eventId: number;
  event: Pick<
    Event,
    "id" | "title" | "city" | "date" | "imageUrl" | "price" | "status"
  >;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PAYMENT INFO TYPES
// ============================================

export interface PaymentInfo {
  id: number;
  cardNumber: string;
  cardHolder: string;
  bankName: string | null;
  isActive: boolean;
}

// ============================================
// TELEGRAM TYPES
// ============================================

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}
