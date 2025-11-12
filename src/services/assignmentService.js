import api from './api';

export const listAssignments = async () => {
  const response = await api.get('/assignments');
  return response.data;
};

export const createAssignment = async payload => {
  const response = await api.post('/assignments', payload);
  return response.data;
};

export const updateAssignment = async (assignmentId, payload) => {
  const response = await api.put(`/assignments/${assignmentId}`, payload);
  return response.data;
};

export const submitAssignment = async (assignmentId, { file, studentId, notes }) => {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  if (studentId) {
    formData.append('studentId', studentId);
  }
  if (notes) {
    formData.append('notes', notes);
  }
  const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const gradeSubmission = async (submissionId, { grade, feedback, gradedBy }) => {
  const response = await api.post(`/assignments/submissions/${submissionId}/grade`, {
    grade,
    feedback,
    gradedBy,
  });
  return response.data;
};
