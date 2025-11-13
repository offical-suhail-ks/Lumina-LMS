import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const featureFlagService = {
  // Get all feature flags
  async getAllFeatureFlags() {
    const response = await axios.get(`${API_URL}/feature-flags`);
    return response.data;
  },

  // Get enabled flags for a role
  async getEnabledFlagsForRole(role) {
    const response = await axios.get(`${API_URL}/feature-flags/enabled/${role}`);
    return response.data;
  },

  // Check if a feature is enabled
  async isFeatureEnabled(featureKey, role = null) {
    const params = role ? { role } : {};
    const response = await axios.get(`${API_URL}/feature-flags/check/${featureKey}`, { params });
    return response.data.enabled;
  },

  // Toggle feature flag
  async toggleFeature(featureKey, enabled) {
    const response = await axios.put(`${API_URL}/feature-flags/${featureKey}/toggle`, { enabled });
    return response.data;
  },

  // Update feature flag
  async updateFeatureFlag(id, data) {
    const response = await axios.put(`${API_URL}/feature-flags/${id}`, data);
    return response.data;
  },

  // Create feature flag
  async createFeatureFlag(data) {
    const response = await axios.post(`${API_URL}/feature-flags`, data);
    return response.data;
  },

  // Delete feature flag
  async deleteFeatureFlag(id) {
    const response = await axios.delete(`${API_URL}/feature-flags/${id}`);
    return response.data;
  },
};

