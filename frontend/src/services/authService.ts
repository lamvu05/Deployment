import apiClient from './apiClient';
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, User } from '../types';

/**
 * Auth API calls
 */
export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return data.data!;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return data.data!;
  },

  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/google', { idToken });
    return data.data!;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return data.data!.user;
  },

  logout: (): void => {
    localStorage.removeItem('token');
  },
};
