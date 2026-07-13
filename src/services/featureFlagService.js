import api from './api';

export const featureFlagService = {
  async getAllFeatureFlags() {
    const { data } = await api.get('/feature-flags');
    return data;
  },

  async getEnabledFlagsForRole(role) {
    const { data } = await api.get(`/feature-flags/enabled/${role}`);
    return data;
  },

  async isFeatureEnabled(featureKey, role = null) {
    const { data } = await api.get(`/feature-flags/check/${featureKey}`, { params: role ? { role } : {} });
    return data;
  },

  async toggleFeature(featureKey, enabled) {
    const { data } = await api.put(`/feature-flags/${featureKey}/toggle`, { enabled });
    return data;
  },

  async updateFeatureFlag(id, updateData) {
    const { data } = await api.put(`/feature-flags/${id}`, updateData);
    return data;
  },

  async createFeatureFlag(payload) {
    const { data } = await api.post('/feature-flags', payload);
    return data;
  },

  async deleteFeatureFlag(id) {
    const { data } = await api.delete(`/feature-flags/${id}`);
    return data;
  },
};
