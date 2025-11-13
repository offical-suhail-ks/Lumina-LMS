import api from './api';

export const getInbox = async (userId, userRole) => {
  const response = await api.get(`/mailbox/inbox?userId=${userId}&userRole=${userRole}`);
  return response.data;
};

export const getMessage = async (messageId, userId) => {
  const response = await api.get(`/mailbox/messages/${messageId}?userId=${userId}`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await api.post('/mailbox/send', messageData);
  return response.data;
};

export const markAsRead = async (messageId, userId) => {
  const response = await api.post(`/mailbox/messages/${messageId}/read`, { userId });
  return response.data;
};

export const markAllAsRead = async (userId) => {
  const response = await api.post('/mailbox/mark-all-read', { userId });
  return response.data;
};

export const deleteMessage = async (messageId, userId) => {
  const response = await api.delete(`/mailbox/messages/${messageId}?userId=${userId}`);
  return response.data;
};

export const getSentMessages = async (userId) => {
  const response = await api.get(`/mailbox/sent?userId=${userId}`);
  return response.data;
};

export const getUnreadCount = async (userId, userRole) => {
  const response = await api.get(`/mailbox/unread-count?userId=${userId}&userRole=${userRole}`);
  return response.data;
};

