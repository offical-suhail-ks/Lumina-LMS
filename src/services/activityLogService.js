import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const activityLogService = {
  // Get activity logs with filters
  async getActivityLogs(filters = {}) {
    // Ensure limit is a number if provided
    const params = { ...filters };
    if (params.limit) {
      params.limit = parseInt(params.limit, 10);
    }
    const response = await axios.get(`${API_URL}/activity-logs`, { params });
    return response.data;
  },

  // Log an activity
  async logActivity(activityData) {
    const response = await axios.post(`${API_URL}/activity-logs`, activityData);
    return response.data;
  },
};

