import apiClient from './apiClient';
import type { ApiResponse, Review, CreateReviewPayload } from '../types';

export const reviewApi = {
  create: async (payload: CreateReviewPayload): Promise<Review> => {
    const { data } = await apiClient.post<ApiResponse<{ review: Review }>>('/reviews', payload);
    return data.data!.review;
  },

  getByService: async (serviceId: string): Promise<Review[]> => {
    const { data } = await apiClient.get<ApiResponse<{ reviews: Review[] }>>(`/reviews/service/${serviceId}`);
    return data.data!.reviews;
  },
};
