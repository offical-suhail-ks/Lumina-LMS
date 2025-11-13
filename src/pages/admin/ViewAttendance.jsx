import React, { useEffect, useState } from 'react';
import { getAllAttendance } from '../../services/attendanceService';
import { listStudents } from '../../services/studentService';

const ViewAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    studentId: '',
    startDate: '',
    endDate: '',
    status: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      const data = await listStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await getAllAttendance(filters);
      setAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-700 border-green-300',
      absent: 'bg-red-100 text-red-700 border-red-300',
      late: 'bg-amber-100 text-amber-700 border-amber-300',
      excused: 'bg-blue-100 text-blue-700 border-blue-300',
    };
    return badges[status] || 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">View Attendance</h1>
          <p className="mt-1 text-sm text-slate-600">
            View and filter all student attendance records
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm font-medium text-slate-600">
            Student
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={filters.studentId}
              onChange={(e) => setFilters(prev => ({ ...prev, studentId: e.target.value }))}
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-600">
            Start Date
            <input
              type="date"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            End Date
            <input
              type="date"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </label>
          <label className="text-sm font-medium text-slate-600">
            Status
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ studentId: '', startDate: '', endDate: '', status: '' })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading attendance...</div>
        </div>
      ) : attendance.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-500">No attendance records found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Marked By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {record.firstName} {record.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{record.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-900">{record.courseTitle || 'N/A'}</p>
                      {record.department && (
                        <p className="text-xs text-slate-500">{record.department}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-900">{formatDate(record.attendanceDate)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(record.status)}`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-900">{record.facultyName || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{record.notes || '-'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAttendance;

