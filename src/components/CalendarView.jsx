import React from 'react';

const events = [
  { date: 'Nov 12, 2025', title: 'Systems Thinking workshop', tag: 'Experience' },
  { date: 'Nov 13, 2025', title: 'AI Ethics roundtable', tag: 'Collaboration' },
  { date: 'Nov 15, 2025', title: 'Design critique sprint', tag: 'Studio' },
];

const CalendarView = () => (
  <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Events calendar</h2>
        <p className="mt-1 text-xs text-slate-500">Stay aligned with important sessions arriving this week.</p>
      </div>
      <button type="button" className="text-xs font-medium text-indigo-500 hover:text-indigo-400">
        View full calendar
      </button>
    </div>
    <ul className="mt-4 space-y-4 text-sm text-slate-600">
      {events.map(event => (
        <li
          key={event.title}
          className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">{event.title}</p>
            <p className="text-xs text-slate-500">{event.date}</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">{event.tag}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default CalendarView;
