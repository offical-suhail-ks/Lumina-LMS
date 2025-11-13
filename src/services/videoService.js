import api from './api';

export const videoService = {
  async addVideo(videoData) {
    const response = await api.post('/videos', videoData);
    return response.data;
  },

  async getVideosByCourse(courseId) {
    const response = await api.get(`/videos/course/${courseId}`);
    return response.data;
  },

  async updateVideoProgress(videoId, progressData) {
    const response = await api.post(`/videos/${videoId}/progress`, progressData);
    return response.data;
  },

  async getVideoProgress(videoId, studentId) {
    const response = await api.get(`/videos/${videoId}/progress/${studentId}`);
    return response.data;
  },
};

