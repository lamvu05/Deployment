import apiClient from './apiClient';
import type { ApiResponse, Booking, BookingStats, CreateBookingPayload, TimeSlot, Service } from '../types';

export const bookingApi = {
  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    const { data } = await apiClient.post<ApiResponse<{ booking: Booking }>>('/bookings', payload);
    return data.data!.booking;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const { data } = await apiClient.get<ApiResponse<{ bookings: Booking[] }>>('/bookings/my');
    return data.data!.bookings;
  },

  getById: async (id: string): Promise<Booking> => {
    const { data } = await apiClient.get<ApiResponse<{ booking: Booking }>>(`/bookings/${id}`);
    return data.data!.booking;
  },

  cancel: async (id: string): Promise<Booking> => {
    const { data } = await apiClient.patch<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/cancel`);
    return data.data!.booking;
  },

  // Admin
  getAll: async (params?: { status?: string; date?: string; page?: number }): Promise<{ rows: Booking[]; total: number }> => {
    const { data } = await apiClient.get('/bookings', { params });
    return { rows: data.rows, total: data.total };
  },

  confirm: async (id: string): Promise<Booking> => {
    const { data } = await apiClient.patch<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/confirm`);
    return data.data!.booking;
  },

  getStats: async (): Promise<BookingStats> => {
    const { data } = await apiClient.get<ApiResponse<{ stats: BookingStats }>>('/bookings/stats');
    return data.data!.stats;
  },

  getSlots: async (service_id: string, date: string): Promise<{ service: Service; slots: TimeSlot[] }> => {
    const { data } = await apiClient.get('/bookings/slots', { params: { service_id, date } });
    return data.data;
  },
};
