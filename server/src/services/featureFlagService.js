const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const featureFlagService = {
  // Get all feature flags
  async getAllFeatureFlags() {
    const flags = await query(
      `SELECT 
        id, feature_key, feature_name, description, is_enabled, role_restrictions,
        created_at, updated_at
       FROM feature_flags
       ORDER BY feature_name`
    );
    return flags;
  },

  // Get enabled feature flags for a specific role
  async getEnabledFlagsForRole(role) {
    const flags = await query(
      `SELECT feature_key, feature_name, role_restrictions
       FROM feature_flags
       WHERE is_enabled = TRUE`
    );

    // Filter by role restrictions if any
    return flags.filter(flag => {
      if (!flag.role_restrictions) return true; // No restrictions means all roles
      try {
        const restrictions = JSON.parse(flag.role_restrictions);
        return Array.isArray(restrictions) ? restrictions.includes(role) : true;
      } catch (e) {
        return true; // If parsing fails, allow access
      }
    });
  },

  // Check if a specific feature is enabled
  async isFeatureEnabled(featureKey, role = null) {
    const [flag] = await query(
      `SELECT is_enabled, role_restrictions
       FROM feature_flags
       WHERE feature_key = ?`,
      [featureKey]
    );

    if (!flag || !flag.is_enabled) return false;

    // Check role restrictions if role is provided
    if (role && flag.role_restrictions) {
      try {
        const restrictions = JSON.parse(flag.role_restrictions);
        if (Array.isArray(restrictions) && !restrictions.includes(role)) {
          return false;
        }
      } catch (e) {
        // If parsing fails, allow access
      }
    }

    return true;
  },

  // Toggle feature flag
  async toggleFeature(featureKey, enabled) {
    await query(
      `UPDATE feature_flags
       SET is_enabled = ?, updated_at = CURRENT_TIMESTAMP
       WHERE feature_key = ?`,
      [enabled, featureKey]
    );
    return { success: true, message: `Feature ${enabled ? 'enabled' : 'disabled'} successfully` };
  },

  // Update feature flag
  async updateFeatureFlag(id, data) {
    const { feature_name, description, is_enabled, role_restrictions } = data;
    await query(
      `UPDATE feature_flags
       SET feature_name = ?, description = ?, is_enabled = ?,
           role_restrictions = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        feature_name,
        description,
        is_enabled,
        role_restrictions ? JSON.stringify(role_restrictions) : null,
        id,
      ]
    );
    return { success: true, message: 'Feature flag updated successfully' };
  },

  // Create new feature flag
  async createFeatureFlag(data) {
    const { feature_key, feature_name, description, is_enabled, role_restrictions } = data;
    const id = uuidv4();
    await query(
      `INSERT INTO feature_flags (id, feature_key, feature_name, description, is_enabled, role_restrictions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        feature_key,
        feature_name,
        description,
        is_enabled !== undefined ? is_enabled : true,
        role_restrictions ? JSON.stringify(role_restrictions) : null,
      ]
    );
    return { success: true, message: 'Feature flag created successfully', id };
  },

  // Delete feature flag
  async deleteFeatureFlag(id) {
    await query(`DELETE FROM feature_flags WHERE id = ?`, [id]);
    return { success: true, message: 'Feature flag deleted successfully' };
  },
};

module.exports = featureFlagService;

