import apiClient from './apiClient';
import type { ApiResponse, Service } from '../types';

export const serviceApi = {
  getAll: async (): Promise<Service[]> => {
    const { data } = await apiClient.get<ApiResponse<{ services: Service[] }>>('/services');
    return data.data!.services;
  },
  getById: async (id: string): Promise<Service> => {
    const { data } = await apiClient.get<ApiResponse<{ service: Service }>>(`/services/${id}`);
    return data.data!.service;
  },
};
