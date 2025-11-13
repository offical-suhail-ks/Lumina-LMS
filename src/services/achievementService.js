import api from './api';

export const achievementService = {
  async createAchievement(achievementData) {
    const response = await api.post('/achievements', achievementData);
    return response.data;
  },

  async getAllAchievements() {
    const response = await api.get('/achievements');
    return response.data;
  },

  async getStudentAchievements(studentId) {
    const response = await api.get(`/achievements/student/${studentId}`);
    return response.data;
  },

  async awardAchievement(achievementId, studentId) {
    const response = await api.post(`/achievements/${achievementId}/award/${studentId}`);
    return response.data;
  },
};

