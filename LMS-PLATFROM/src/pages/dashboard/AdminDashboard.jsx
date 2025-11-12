import React from 'react';

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

const AdminDashboard = () => (
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
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
        >
          New announcement
        </button>
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

export default AdminDashboard;
