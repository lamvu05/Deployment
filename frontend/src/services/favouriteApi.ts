import apiClient from './apiClient';
import type { ApiResponse, Service } from '../types';

export interface Favourite {
  favourite_id: string;
  favourited_at: string;
  id: string; // service id
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  capacity: number;
  location: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export const favouriteApi = {
  /**
   * Get list of favorite services for current user
   */
  getMyFavourites: async (): Promise<Favourite[]> => {
    const { data } = await apiClient.get<ApiResponse<{ favourites: Favourite[] }>>('/favourites');
    return data.data!.favourites;
  },

  /**
   * Add a service to favorites
   */
  add: async (serviceId: string): Promise<any> => {
    const { data } = await apiClient.post<ApiResponse<{ favourite: any }>>('/favourites', { service_id: serviceId });
    return data;
  },

  /**
   * Remove a service from favorites
   */
  remove: async (serviceId: string): Promise<any> => {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/favourites/${serviceId}`);
    return data;
  },

  /**
   * Check if a service is favorited
   */
  checkIsFavourite: async (serviceId: string): Promise<boolean> => {
    const { data } = await apiClient.get<ApiResponse<{ is_favourite: boolean }>>(`/favourites/check/${serviceId}`);
    return data.data!.is_favourite;
  },
};
