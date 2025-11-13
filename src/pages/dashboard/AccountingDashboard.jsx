import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAccountingTasks, getSalaries } from '../../services/accountingService';
import { listStudents } from '../../services/studentService';

const AccountingDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    activeSalaries: 0,
    totalSalaries: 0,
    totalFees: 0,
    studentsWithFees: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, salariesData, studentsData] = await Promise.all([
        getAccountingTasks(),
        getSalaries({ status: 'active' }),
        listStudents(),
      ]);
      
      setTasks(tasksData);
      setSalaries(salariesData);
      setStudents(studentsData);
      
      const pendingTasks = tasksData.filter(t => t.status === 'pending').length;
      const completedTasks = tasksData.filter(t => t.status === 'completed').length;
      
      // Calculate fee statistics
      const studentsWithFees = studentsData.filter(s => s.courseFee && parseFloat(s.courseFee) > 0);
      const totalFees = studentsWithFees.reduce((sum, s) => sum + parseFloat(s.courseFee || 0), 0);
      
      setStats({
        pendingTasks,
        completedTasks,
        activeSalaries: salariesData.length,
        totalSalaries: salariesData.reduce((sum, s) => sum + parseFloat(s.netSalary || 0), 0),
        totalFees,
        studentsWithFees: studentsWithFees.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Accounting Team</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Financial Management Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage student fees, salary payments, and financial operations.
          </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Tasks</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.pendingTasks}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Student Fees</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(stats.totalFees)}</p>
              <p className="mt-1 text-xs text-slate-500">{stats.studentsWithFees} students</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completed Tasks</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats.completedTasks}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Salary Budget</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(stats.totalSalaries)}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Management Section - Prominent */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-lg shadow-indigo-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Fee Setup Tasks</h2>
              <p className="mt-1 text-sm text-slate-600">
                Manage fee setup tasks forwarded from admin. Review student applications and set up payment details.
              </p>
              {stats.pendingTasks > 0 && (
                <p className="mt-2 text-sm font-medium text-orange-600">
                  {stats.pendingTasks} {stats.pendingTasks === 1 ? 'task' : 'tasks'} pending your attention
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/accounting/tasks')}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Open Tasks
            </button>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Student Fee Management</h2>
              <p className="mt-1 text-sm text-slate-600">
                View and manage all student fees, payment plans, and payment history.
              </p>
              {stats.studentsWithFees > 0 && (
                <p className="mt-2 text-sm font-medium text-emerald-600">
                  {stats.studentsWithFees} {stats.studentsWithFees === 1 ? 'student' : 'students'} with fees configured
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/accounting/fees')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Manage Fees
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/5">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <Link
              to="/accounting/tasks"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Fee Tasks</span>
                  <p className="text-xs text-slate-500">Manage student fee setup</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/accounting/fees"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Fee Management</span>
                  <p className="text-xs text-slate-500">View and manage all student fees</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/accounting/salaries"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Salaries</span>
                  <p className="text-xs text-slate-500">Manage employee salaries</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Fee Tasks</h2>
            <Link
              to="/accounting/tasks"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
            >
              View All →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <button
                key={task.id}
                onClick={() => navigate('/accounting/tasks')}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {task.studentFirstName} {task.studentLastName} · {task.studentEmail}
                  </p>
                  {task.adminRemarks && (
                    <p className="mt-1 text-xs text-blue-600 italic">
                      Admin note: {task.adminRemarks.substring(0, 50)}...
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      task.status === 'pending'
                        ? 'bg-orange-100 text-orange-700'
                        : task.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : task.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {task.status}
                  </span>
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-2 text-sm text-slate-500">No fee tasks yet</p>
                <p className="mt-1 text-xs text-slate-400">Tasks will appear here when admin forwards student applications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;

