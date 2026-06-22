import apiClient from './apiClient';
import type { ApiResponse } from '../types';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const notificationApi = {
  /**
   * Get all notifications for current user
   */
  getMyNotifications: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get<ApiResponse<{ notifications: Notification[] }>>('/notifications');
    return data.data!.notifications;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<ApiResponse<{ unread_count: number }>>('/notifications/unread-count');
    return data.data!.unread_count;
  },

  /**
   * Mark all notifications as read
   */
  markAllRead: async (): Promise<number> => {
    const { data } = await apiClient.get<ApiResponse<{ updated_count: number }>>('/notifications/mark-all-read');
    return data.data!.updated_count;
  },

  /**
   * Mark a specific notification as read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    const { data } = await apiClient.get<ApiResponse<{ notification: Notification }>>(`/notifications/${id}/read`);
    // Wait, the backend route for markAsRead is:
    // router.patch('/:id/read', ctrl.markAsRead);
    // Let's use patch in the axios request to match the backend router.
    return notificationApi.patchMarkAsRead(id);
  },

  patchMarkAsRead: async (id: string): Promise<Notification> => {
    const { data } = await apiClient.patch<ApiResponse<{ notification: Notification }>>(`/notifications/${id}/read`);
    return data.data!.notification;
  },

  /**
   * Delete a specific notification
   */
  delete: async (id: string): Promise<any> => {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/notifications/${id}`);
    return data;
  },

  /**
   * Create a demo notification for testing
   */
  createDemoNotification: async (title: string, message: string): Promise<Notification> => {
    const { data } = await apiClient.post<ApiResponse<{ notification: Notification }>>('/notifications/demo', {
      title,
      message,
    });
    return data.data!.notification;
  },
};
