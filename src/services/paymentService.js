import api from './api';

export const getPaymentSummary = async (studentId) => {
  const response = await api.get(`/students/${studentId}/payments`);
  return response.data;
};

export const processPayment = async (paymentData) => {
  const response = await api.post('/payments', paymentData);
  return response.data;
};

export const sendPaymentReminder = async (studentId) => {
  const response = await api.post(`/students/${studentId}/send-payment-reminder`);
  return response.data;
};

export const sendBulkReminders = async (daysBefore = 7) => {
  const response = await api.post('/payments/send-reminders', { daysBefore });
  return response.data;
};

