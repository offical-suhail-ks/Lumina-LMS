import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccountingTasks } from '../../services/accountingService';

const adminMetrics = [
  { label: 'Active students', value: '1,284', change: '+7.3%' },
  { label: 'Faculty engagement', value: '86%', change: '+2.8%' },
  { label: 'Course health', value: '92%', change: 'stable' },
  { label: 'Support tickets', value: 18, change: '-5.2%' },
];

const governanceQueue = [
  { title: 'Approve Data Science pathway updates', owner: 'Curriculum Council', status: 'Awaiting review' },
  { title: 'Launch parent engagement analytics', owner: 'Insights Team', status: 'In QA' },
  { title: 'Renew vendor integrations', owner: 'Operations', status: 'Pending signature' },
];

const pulseHighlights = [
  {
    title: 'Engagement momentum',
    body: 'Student interactions increased 12% week-over-week with peak activity in the evening cohorts.',
  },
  {
    title: 'Wellbeing check-ins',
    body: '86% of cohorts completed wellness surveys. Flagged responses routed to mentors within 45 minutes.',
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const [forwardedTasks, setForwardedTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Fetch forwarded applications from accounting
  useEffect(() => {
    const fetchForwardedTasks = async () => {
      try {
        const allTasks = await getAccountingTasks();
        const forwarded = allTasks.filter(t => 
          t.applicationStatus === 'under_review' || 
          t.status === 'in_progress'
        );
        setForwardedTasks(forwarded.slice(0, 5)); // Show latest 5
      } catch (error) {
        console.error('Error fetching forwarded tasks:', error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchForwardedTasks();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Administrative control</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Orchestrate institutional excellence</h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor health indicators, streamline governance workflows, and empower every team with timely insights.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-500"
          >
            Export analytics
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
            >
              Create User
              <svg
                className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/admin/students');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Create Student</p>
                        <p className="text-xs text-slate-500">Add new student account</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin/faculty');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Create Faculty</p>
                        <p className="text-xs text-slate-500">Add new faculty member</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin/accounting');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Create Accounting User</p>
                        <p className="text-xs text-slate-500">Add accounting team member</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {adminMetrics.map(metric => (
        <div
          key={metric.label}
          className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/5 backdrop-blur"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{metric.label}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{metric.value}</p>
          <p className="mt-2 text-xs font-medium text-emerald-500">{metric.change}</p>
        </div>
      ))}
    </section>

    {/* Forwarded Applications Section */}
    <section className="rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-lg shadow-purple-500/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Forwarded Applications</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review student applications forwarded from accounting team
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/review-applications')}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-500"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Review All
        </button>
      </div>
      {loadingTasks ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : forwardedTasks.length > 0 ? (
        <div className="mt-4 space-y-3">
          {forwardedTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => navigate('/admin/review-applications')}
              className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 transition hover:border-purple-200 hover:bg-purple-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {task.studentFirstName} {task.studentLastName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{task.studentEmail}</p>
                  {task.feeDetails?.courseFee && (
                    <p className="mt-1 text-xs text-indigo-600">
                      Fee: ${parseFloat(task.feeDetails.courseFee).toLocaleString()}
                      {task.feeDetails.paymentPlan && ` · ${task.feeDetails.paymentPlan}`}
                    </p>
                  )}
                  {task.accountingRemarks && (
                    <p className="mt-1 text-xs text-green-600 italic">
                      Accounting: {task.accountingRemarks.substring(0, 60)}...
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                    Under Review
                  </span>
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm text-slate-500">No applications pending review</p>
          <p className="mt-1 text-xs text-slate-400">Applications will appear here when accounting team forwards them</p>
        </div>
      )}
    </section>

    <section className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/5 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Governance queue</h2>
            <button type="button" className="text-sm font-medium text-indigo-500 hover:text-indigo-400">
              View full log
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {governanceQueue.map(item => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200/70 bg-white/90 px-5 py-4 text-sm text-slate-600 shadow-sm"
              >
                <p className="text-base font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.owner}</p>
                <p className="mt-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                  {item.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {pulseHighlights.map(highlight => (
          <article
            key={highlight.title}
            className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-lg shadow-indigo-500/10 backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">{highlight.title}</p>
            <p className="mt-3 text-sm text-slate-600">{highlight.body}</p>
          </article>
        ))}

        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-[1px] shadow-xl shadow-slate-900/30">
          <div className="rounded-[1.45rem] bg-slate-900 p-6 text-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">System health</p>
            <p className="mt-3 text-lg font-semibold">All services nominal</p>
            <p className="mt-2 text-sm text-indigo-100">
              Realtime monitoring indicates 99.98% uptime and zero latency spikes across all modules.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Open observability
            </button>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
};

export default AdminDashboard;
