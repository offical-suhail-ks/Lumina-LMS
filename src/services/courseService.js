import api from './api';

export const listCourses = async () => {
  const { data } = await api.get('/courses');
  return data;
};

export const courseExists = async courseId => {
  if (!courseId) return false;
  try {
    await api.get(`/courses/${courseId}`);
    return true;
  } catch (error) {
    if (error.response?.status === 404) return false;
    throw error;
  }
};

export const getCourseDetails = async courseId => {
  try {
    const { data } = await api.get(`/courses/${courseId}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const createCourse = async course => {
  const { data } = await api.post('/courses', course);
  return data;
};

export const updateCourse = async (courseId, course) => {
  const { data } = await api.put(`/courses/${courseId}`, course);
  return data;
};

export const deleteCourse = async courseId => {
  await api.delete(`/courses/${courseId}`);
  return { success: true };
};

export const enrollInCourse = async (courseId, studentId) => {
  const { data } = await api.post(`/courses/${courseId}/enroll`, { studentId });
  return data;
};

export const unenrollFromCourse = async (courseId, studentId) => {
  await api.delete(`/courses/${courseId}/enroll/${studentId}`);
  return { success: true };
};

export const getStudentCourses = async studentId => {
  const { data } = await api.get(`/students/${studentId}/courses`);
  return data;
};
