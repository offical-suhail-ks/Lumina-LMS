import api from './api';

export const getAccountingTasks = async (filters = {}) => {
  const { data } = await api.get('/accounting/tasks', { params: filters });
  return data;
};

export const getAccountingTask = async id => {
  const { data } = await api.get(`/accounting/tasks/${id}`);
  return data;
};

export const updateAccountingTask = async (id, updateData) => {
  const { data } = await api.put(`/accounting/tasks/${id}`, updateData);
  return data;
};

export const completeAccountingTask = async (id, completedBy, feeDetails, accountingRemarks) => {
  const { data } = await api.post(`/accounting/tasks/${id}/complete`, { completedBy, feeDetails, accountingRemarks });
  return data;
};

export const sendTaskToAdmin = async (id, completedBy, feeDetails, accountingRemarks) => {
  const { data } = await api.post(`/accounting/tasks/${id}/send-to-admin`, { completedBy, feeDetails, accountingRemarks });
  return data;
};

export const reviewTask = async (id, reviewedBy, action, adminRemarks) => {
  const { data } = await api.post(`/accounting/tasks/${id}/review`, { reviewedBy, action, adminRemarks });
  return data;
};

export const createAccountingTask = async taskData => {
  const { data } = await api.post('/accounting/tasks', taskData);
  return data;
};

export const getSalaries = async (filters = {}) => {
  const { data } = await api.get('/accounting/salaries', { params: filters });
  return data;
};

export const getSalary = async id => {
  const { data } = await api.get(`/accounting/salaries/${id}`);
  return data;
};

export const createSalary = async salaryData => {
  const { data } = await api.post('/accounting/salaries', salaryData);
  return data;
};

export const updateSalary = async (id, updateData) => {
  const { data } = await api.put(`/accounting/salaries/${id}`, updateData);
  return data;
};

export const getSalaryPayments = async salaryId => {
  const { data } = await api.get(`/accounting/salaries/${salaryId}/payments`);
  return data;
};

export const createSalaryPayment = async (salaryId, paymentData) => {
  const { data } = await api.post(`/accounting/salaries/${salaryId}/payments`, paymentData);
  return data;
};

export const updateSalaryPayment = async (id, updateData) => {
  const { data } = await api.put(`/accounting/salary-payments/${id}`, updateData);
  return data;
};
