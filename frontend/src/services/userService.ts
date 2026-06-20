import apiClient from './apiClient';
import type { ApiResponse, User } from '../types';

/**
 * User management API calls
 */
export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await apiClient.get<ApiResponse<{ users: User[] }>>('/users');
    return data.data!.users;
  },

  getUserById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return data.data!.user;
  },

  updateUser: async (id: string, fields: Partial<Pick<User, 'name' | 'is_active'>>): Promise<User> => {
    const { data } = await apiClient.patch<ApiResponse<{ user: User }>>(`/users/${id}`, fields);
    return data.data!.user;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
