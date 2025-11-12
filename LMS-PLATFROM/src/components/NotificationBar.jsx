import React from 'react';

const NotificationBar = ({ notifications }) => (
  <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
      <button type="button" className="text-xs font-semibold text-indigo-500 hover:text-indigo-400">
        Mark all read
      </button>
    </div>
    <ul className="mt-4 space-y-3 text-sm text-slate-600">
      {notifications.map((note, idx) => (
        <li key={idx} className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm">
          <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-indigo-500" />
          <span>{note}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default NotificationBar;
