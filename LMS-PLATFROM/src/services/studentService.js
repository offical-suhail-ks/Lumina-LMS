import api from './api';

export const listStudents = async () => {
  const response = await api.get('/students');
  return response.data;
};

export const createStudent = async payload => {
  const response = await api.post('/students', payload);
  return response.data;
};

export const updateStudent = async (studentId, payload) => {
  const response = await api.put(`/students/${studentId}`, payload);
  return response.data;
};

export const deleteStudent = async studentId => {
  const response = await api.delete(`/students/${studentId}`);
  return response.data;
};

