import api from './api';

export const listFaculty = async () => {
  const response = await api.get('/faculty');
  return response.data;
};

export const createFaculty = async payload => {
  const response = await api.post('/faculty', payload);
  return response.data;
};

export const updateFaculty = async (facultyId, payload) => {
  const response = await api.put(`/faculty/${facultyId}`, payload);
  return response.data;
};

export const deleteFaculty = async facultyId => {
  const response = await api.delete(`/faculty/${facultyId}`);
  return response.data;
};

