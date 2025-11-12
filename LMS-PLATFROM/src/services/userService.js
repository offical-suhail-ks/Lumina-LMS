import api from './api';

export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId, profile) => {
  const response = await api.put(`/users/${userId}`, profile);
  return response.data;
};
