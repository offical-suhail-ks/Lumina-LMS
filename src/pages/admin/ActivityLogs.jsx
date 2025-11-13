import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { activityLogService } from '../../services/activityLogService';

const ActivityLogs = () => {
  const user = useSelector(state => state.auth.user);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    userType: '',
    action: '',
    entityType: '',
    limit: '100',
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin only.');
      setLoading(false);
      return;
    }
    fetchLogs();
  }, [user, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const activityLogs = await activityLogService.getActivityLogs(filters);
      setLogs(activityLogs);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getActionColor = (action) => {
    if (action?.toLowerCase().includes('create') || action?.toLowerCase().includes('add')) {
      return 'bg-green-100 text-green-800';
    }
    if (action?.toLowerCase().includes('update') || action?.toLowerCase().includes('edit')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (action?.toLowerCase().includes('delete') || action?.toLowerCase().includes('remove')) {
      return 'bg-red-100 text-red-800';
    }
    if (action?.toLowerCase().includes('login') || action?.toLowerCase().includes('access')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
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
        <div className="text-center text-gray-600">Loading activity logs...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Activity Logs</h1>
        <p className="text-gray-600">Monitor all system activities and user actions</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
            <select
              value={filters.userType}
              onChange={(e) => handleFilterChange('userType', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="accounting">Accounting</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <input
              type="text"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              placeholder="Filter by action"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
            <input
              type="text"
              value={filters.entityType}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
              placeholder="Filter by entity"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Entity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(log.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-black">{log.userId || 'N/A'}</div>
                      <div className="text-xs text-gray-500 capitalize">{log.userType || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}
                      >
                        {log.action || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {log.entityType || 'N/A'}
                        {log.entityId && (
                          <span className="text-xs text-gray-500 ml-1">({log.entityId})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-md truncate">
                        {log.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{log.ipAddress || 'N/A'}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {logs.length} activity log{logs.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;

