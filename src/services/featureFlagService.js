import { supabase } from '../lib/supabase';

export const featureFlagService = {
  // Get all feature flags
  async getAllFeatureFlags() {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('feature_name');
    
    if (error) throw error;
    return data || [];
  },

  // Get enabled flags for a role
  async getEnabledFlagsForRole(role) {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('feature_key, feature_name, role_restrictions')
      .eq('is_enabled', true);
    
    if (error) throw error;
    
    // Filter by role restrictions
    return (data || []).filter(flag => {
      if (!flag.role_restrictions) return true;
      try {
        const restrictions = typeof flag.role_restrictions === 'string' 
          ? JSON.parse(flag.role_restrictions) 
          : flag.role_restrictions;
        return Array.isArray(restrictions) ? restrictions.includes(role) : true;
      } catch (e) {
        return true;
      }
    });
  },

  // Check if a feature is enabled
  async isFeatureEnabled(featureKey, role = null) {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('is_enabled, role_restrictions')
      .eq('feature_key', featureKey)
      .single();
    
    if (error || !data || !data.is_enabled) return false;
    
    // Check role restrictions if role is provided
    if (role && data.role_restrictions) {
      try {
        const restrictions = typeof data.role_restrictions === 'string'
          ? JSON.parse(data.role_restrictions)
          : data.role_restrictions;
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
    const { data, error } = await supabase
      .from('feature_flags')
      .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('feature_key', featureKey)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, message: `Feature ${enabled ? 'enabled' : 'disabled'} successfully`, data };
  },

  // Update feature flag
  async updateFeatureFlag(id, updateData) {
    const { feature_name, description, is_enabled, role_restrictions } = updateData;
    const updatePayload = {
      feature_name,
      description,
      is_enabled,
      role_restrictions: role_restrictions ? JSON.stringify(role_restrictions) : null,
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('feature_flags')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, message: 'Feature flag updated successfully', data };
  },

  // Create feature flag
  async createFeatureFlag(data) {
    const { feature_key, feature_name, description, is_enabled, role_restrictions } = data;
    const insertData = {
      id: crypto.randomUUID(),
      feature_key,
      feature_name,
      description,
      is_enabled: is_enabled !== undefined ? is_enabled : true,
      role_restrictions: role_restrictions ? JSON.stringify(role_restrictions) : null,
    };
    
    const { data: result, error } = await supabase
      .from('feature_flags')
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw error;
    return { success: true, message: 'Feature flag created successfully', id: result.id, data: result };
  },

  // Delete feature flag
  async deleteFeatureFlag(id) {
    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true, message: 'Feature flag deleted successfully' };
  },
};

