import api from './api';

export const getAccountingTasks = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
  if (filters.taskType) params.append('taskType', filters.taskType);
  
  const response = await api.get(`/accounting/tasks?${params.toString()}`);
  return response.data;
};

export const getAccountingTask = async (id) => {
  const response = await api.get(`/accounting/tasks/${id}`);
  return response.data;
};

export const updateAccountingTask = async (id, data) => {
  const response = await api.put(`/accounting/tasks/${id}`, data);
  return response.data;
};

export const completeAccountingTask = async (id, completedBy, feeDetails, accountingRemarks) => {
  const response = await api.post(`/accounting/tasks/${id}/complete`, {
    completedBy,
    feeDetails,
    accountingRemarks,
  });
  return response.data;
};

export const sendTaskToAdmin = async (id, completedBy, feeDetails, accountingRemarks) => {
  const response = await api.post(`/accounting/tasks/${id}/send-to-admin`, {
    completedBy,
    feeDetails,
    accountingRemarks,
  });
  return response.data;
};

export const reviewTask = async (id, reviewedBy, action, adminRemarks) => {
  const response = await api.post(`/accounting/tasks/${id}/review`, {
    reviewedBy,
    action,
    adminRemarks,
  });
  return response.data;
};

export const getSalaries = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.employeeId) params.append('employeeId', filters.employeeId);
  if (filters.status) params.append('status', filters.status);
  if (filters.employeeType) params.append('employeeType', filters.employeeType);
  
  const response = await api.get(`/accounting/salaries?${params.toString()}`);
  return response.data;
};

export const getSalary = async (id) => {
  const response = await api.get(`/accounting/salaries/${id}`);
  return response.data;
};

export const createSalary = async (data) => {
  const response = await api.post('/accounting/salaries', data);
  return response.data;
};

export const updateSalary = async (id, data) => {
  const response = await api.put(`/accounting/salaries/${id}`, data);
  return response.data;
};

export const getSalaryPayments = async (salaryId) => {
  const response = await api.get(`/accounting/salaries/${salaryId}/payments`);
  return response.data;
};

export const createSalaryPayment = async (salaryId, data) => {
  const response = await api.post(`/accounting/salaries/${salaryId}/payments`, data);
  return response.data;
};

export const updateSalaryPayment = async (id, data) => {
  const response = await api.put(`/accounting/salary-payments/${id}`, data);
  return response.data;
};

