import api from './api';

export const analyticsService = {
  async trackEvent(eventData) {
    const response = await api.post('/analytics/events', eventData);
    return response.data;
  },

  async getStudentPerformance(studentId) {
    const response = await api.get(`/analytics/student/${studentId}/performance`);
    return response.data;
  },

  async getCourseAnalytics(courseId) {
    const response = await api.get(`/analytics/course/${courseId}`);
    return response.data;
  },

  async getSystemAnalytics() {
    const response = await api.get('/analytics/system');
    return response.data;
  },
};

