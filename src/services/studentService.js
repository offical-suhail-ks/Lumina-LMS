import api from './api';

export const listStudents = async () => {
  const { data } = await api.get('/students');
  return data;
};

export const createStudent = async payload => {
  const { data } = await api.post('/students', payload);
  return data;
};

export const updateStudent = async (studentId, payload) => {
  const { data } = await api.put(`/students/${studentId}`, payload);
  return data;
};

export const deleteStudent = async studentId => {
  await api.delete(`/students/${studentId}`);
  return { success: true };
};
