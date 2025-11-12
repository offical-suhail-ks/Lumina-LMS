import React from 'react';

const childProgress = [
  { subject: 'Applied Physics', completion: '87%', status: 'On track' },
  { subject: 'Creative Writing', completion: '92%', status: 'Exceeding' },
  { subject: 'Modern History', completion: '78%', status: 'Support recommended' },
];

const wellbeingSignals = [
  { label: 'Attendance', value: '96%', tone: 'positive' },
  { label: 'Engagement', value: 'High', tone: 'positive' },
  { label: 'Sleep insights', value: 'Consistent', tone: 'neutral' },
];

const ParentDashboard = () => (
  <div className="space-y-8">
    <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Family portal</p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900">See the full picture, stay effortlessly aligned</h1>
      <p className="mt-2 text-sm text-slate-500">
        Track learning progress, upcoming milestones, and wellbeing signals in real time. Step in with confidence,
        exactly when you’re needed.
      </p>
    </header>

    <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Learning progress</h2>
            <button type="button" className="text-sm font-medium text-indigo-500 hover:text-indigo-400">
              View detailed report
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {childProgress.map(item => (
              <div
                key={item.subject}
                className="rounded-2xl border border-slate-200/70 bg-white/95 px-5 py-4 text-sm text-slate-600 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-900">{item.subject}</p>
                  <span className="text-xs font-semibold text-indigo-500">{item.completion}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{item.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900">Fees snapshot</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Tuition balance', value: '$420', note: 'Due Nov 18', color: 'text-rose-500' },
              { label: 'Paid this term', value: '$3,780', note: 'Fully reconciled', color: 'text-emerald-500' },
              { label: 'Scholarship', value: 'Applied', note: 'Awaiting response', color: 'text-sky-500' },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-4 text-sm text-slate-600 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className={`mt-2 text-lg font-semibold ${item.color}`}>{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900">Wellbeing signals</h2>
          <ul className="mt-4 space-y-4 text-sm text-slate-600">
            {wellbeingSignals.map(signal => (
              <li
                key={signal.label}
                className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3"
              >
                <span>{signal.label}</span>
                <span
                  className={`text-xs font-semibold ${
                    signal.tone === 'positive' ? 'text-emerald-500' : signal.tone === 'neutral' ? 'text-slate-500' : 'text-rose-500'
                  }`}
                >
                  {signal.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 p-[1px] shadow-xl shadow-indigo-500/20">
          <div className="rounded-[1.45rem] bg-slate-900 p-6 text-slate-100">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">Conversation starter</p>
            <p className="mt-3 text-lg font-semibold">Celebrate the wins</p>
            <p className="mt-2 text-sm text-indigo-100">
              Share personalised weekly highlights to encourage positive habits and motivation at home.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
            >
              Send highlight recap
            </button>
          </div>
        </div>
      </aside>
    </section>
  </div>
);

export default ParentDashboard;
