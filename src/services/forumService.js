import api from './api';

export const forumService = {
  async createCategory(categoryData) {
    const response = await api.post('/forum/categories', categoryData);
    return response.data;
  },

  async getCategoriesByCourse(courseId) {
    const response = await api.get(`/forum/categories/course/${courseId}`);
    return response.data;
  },

  async createThread(threadData) {
    const response = await api.post('/forum/threads', threadData);
    return response.data;
  },

  async getThreadsByCategory(categoryId) {
    const response = await api.get(`/forum/threads/category/${categoryId}`);
    return response.data;
  },

  async getThreadById(id) {
    const response = await api.get(`/forum/threads/${id}`);
    return response.data;
  },

  async createReply(replyData) {
    const response = await api.post('/forum/replies', replyData);
    return response.data;
  },

  async markAsSolution(replyId) {
    const response = await api.post(`/forum/replies/${replyId}/solution`);
    return response.data;
  },
};

