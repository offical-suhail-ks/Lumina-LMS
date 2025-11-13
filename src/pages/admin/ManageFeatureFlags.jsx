import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { featureFlagService } from '../../services/featureFlagService';

const ManageFeatureFlags = () => {
  const user = useSelector(state => state.auth.user);
  const [featureFlags, setFeatureFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin only.');
      setLoading(false);
      return;
    }
    fetchFeatureFlags();
  }, [user]);

  const fetchFeatureFlags = async () => {
    try {
      setLoading(true);
      const flags = await featureFlagService.getAllFeatureFlags();
      setFeatureFlags(flags);
      setError(null);
    } catch (err) {
      console.error('Error fetching feature flags:', err);
      setError('Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (featureKey, currentEnabled) => {
    try {
      setSuccess(null);
      setError(null);
      await featureFlagService.toggleFeature(featureKey, !currentEnabled);
      setSuccess(`Feature ${!currentEnabled ? 'enabled' : 'disabled'} successfully`);
      await fetchFeatureFlags();
    } catch (err) {
      console.error('Error toggling feature:', err);
      setError('Failed to toggle feature');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Access denied. Admin only.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-600">Loading feature flags...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Feature Management</h1>
        <p className="text-gray-600">Enable or disable features across the platform</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {featureFlags.map((flag) => (
                <tr key={flag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-black">{flag.feature_name}</div>
                    <div className="text-xs text-gray-500 mt-1">{flag.feature_key}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{flag.description || 'No description'}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        flag.is_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {flag.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle(flag.feature_key, flag.is_enabled)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        flag.is_enabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {flag.is_enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {featureFlags.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No feature flags found</p>
        </div>
      )}
    </div>
  );
};

export default ManageFeatureFlags;

