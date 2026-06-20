// ================================================================
// Global TypeScript Types & Interfaces
// ================================================================

export interface ApiResponse<T = unknown> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
  results?: number;
}

// ── Auth ─────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; }
export interface AuthResponse { user: User; token: string; }

// ── Services ─────────────────────────────────────────────────────
export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  capacity: number;
  location: string | null;
  image_url: string | null;
  is_active: boolean;
  avg_rating?: number;
  rating_count?: number;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  service_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name?: string;
}

export interface CreateReviewPayload {
  service_id: string;
  rating: number;
  comment?: string;
}

// ── Bookings ─────────────────────────────────────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  // Joined fields
  service_name?: string;
  location?: string;
  price?: number;
  user_name?: string;
  user_email?: string;
}

export interface CreateBookingPayload {
  service_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

// ── Admin Stats ──────────────────────────────────────────────────
export interface BookingStats {
  pending: number;
  confirmed: number;
  cancelled: number;
  total: number;
  revenue: number;
  today_bookings: number;
  upcoming: Booking[];
}
