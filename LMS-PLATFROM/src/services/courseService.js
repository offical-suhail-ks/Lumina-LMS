import api from './api';

export const listCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getCourseDetails = async (courseId) => {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

export const createCourse = async course => {
  const response = await api.post('/courses', course);
  return response.data;
};

export const updateCourse = async (courseId, course) => {
  const response = await api.put(`/courses/${courseId}`, course);
  return response.data;
};

export const deleteCourse = async courseId => {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
};