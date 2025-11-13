import api from './api';

export const certificateService = {
  async createCertificate(certificateData) {
    const response = await api.post('/certificates', certificateData);
    return response.data;
  },

  async getCertificatesByStudent(studentId) {
    const response = await api.get(`/certificates/student/${studentId}`);
    return response.data;
  },

  async verifyCertificate(verificationCode) {
    const response = await api.get(`/certificates/verify/${verificationCode}`);
    return response.data;
  },
};

