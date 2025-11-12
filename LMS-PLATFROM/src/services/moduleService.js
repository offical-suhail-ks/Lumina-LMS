import api from './api';

export const getModulesByCourse = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/modules`);
  return response.data;
};

export const createModule = async (courseId, moduleData) => {
  const formData = new FormData();
  formData.append('title', moduleData.title);
  if (moduleData.description) formData.append('description', moduleData.description);
  if (moduleData.durationHours) formData.append('durationHours', moduleData.durationHours);
  if (moduleData.orderIndex) formData.append('orderIndex', moduleData.orderIndex);

  const response = await api.post(`/courses/${courseId}/modules`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateModule = async (moduleId, moduleData) => {
  const response = await api.put(`/modules/${moduleId}`, moduleData);
  return response.data;
};

export const deleteModule = async (moduleId) => {
  const response = await api.delete(`/modules/${moduleId}`);
  return response.data;
};

export const addModuleMaterial = async (moduleId, materialData) => {
  const formData = new FormData();
  formData.append('title', materialData.title);
  if (materialData.file) formData.append('file', materialData.file);
  if (materialData.uploadedBy) formData.append('uploadedBy', materialData.uploadedBy);

  const response = await api.post(`/modules/${moduleId}/materials`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteModuleMaterial = async (materialId) => {
  const response = await api.delete(`/modules/materials/${materialId}`);
  return response.data;
};
