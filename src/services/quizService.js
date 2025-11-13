import api from './api';

export const quizService = {
  async createQuiz(quizData) {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },

  async getQuizzesByCourse(courseId) {
    const response = await api.get(`/quizzes/course/${courseId}`);
    return response.data;
  },

  async getQuizById(id) {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  async addQuestion(quizId, questionData) {
    const response = await api.post(`/quizzes/${quizId}/questions`, questionData);
    return response.data;
  },

  async addQuestionOption(questionId, optionData) {
    const response = await api.post(`/quizzes/questions/${questionId}/options`, optionData);
    return response.data;
  },

  async startAttempt(quizId, studentId) {
    const response = await api.post(`/quizzes/${quizId}/start`, { studentId });
    return response.data;
  },

  async submitAnswer(attemptId, answerData) {
    const response = await api.post(`/quizzes/attempts/${attemptId}/answers`, answerData);
    return response.data;
  },

  async submitAttempt(attemptId, timeTaken) {
    const response = await api.post(`/quizzes/attempts/${attemptId}/submit`, { timeTaken });
    return response.data;
  },

  async getAttemptResults(attemptId) {
    const response = await api.get(`/quizzes/attempts/${attemptId}/results`);
    return response.data;
  },
};

