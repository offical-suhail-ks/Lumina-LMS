import api from './api';

export const listAccountingUsers = async () => {
  const response = await api.get('/accounting-users');
  return response.data;
};

export const createAccountingUser = async payload => {
  const response = await api.post('/accounting-users', payload);
  return response.data;
};

export const updateAccountingUser = async (userId, payload) => {
  const response = await api.put(`/accounting-users/${userId}`, payload);
  return response.data;
};

export const deleteAccountingUser = async userId => {
  const response = await api.delete(`/accounting-users/${userId}`);
  return response.data;
};

