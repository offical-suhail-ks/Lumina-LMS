import api from './api';

export const notificationService = {
  async createNotification(notificationData) {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  async getNotifications(userId, userType, filters = {}) {
    const params = new URLSearchParams();
    if (filters.unreadOnly) params.append('unreadOnly', 'true');
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/notifications/${userId}/${userType}?${params}`);
    return response.data;
  },

  async getUnreadCount(userId, userType) {
    const response = await api.get(`/notifications/${userId}/${userType}/unread-count`);
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(userId, userType) {
    const response = await api.post(`/notifications/${userId}/${userType}/read-all`);
    return response.data;
  },
};

