import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const mails = [
  { id: 1, from: 'Prof. Smith', subject: 'Project update', received: '2025-11-10', read: false },
  { id: 2, from: 'Admin', subject: 'Fee reminder', received: '2025-11-09', read: true },
  { id: 3, from: 'Dr. Harper', subject: 'Assignment feedback', received: '2025-11-08', read: false },
];

const Inbox = () => {
  const [mailsList, setMailsList] = useState(mails);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Mailbox</h1>
            <p className="mt-2 text-sm text-slate-500">
              View and manage your messages and announcements.
            </p>
          </div>
          <Link
            to="/mailbox/send"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Mail
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Inbox</h2>
          <span className="text-sm text-slate-500">
            {mailsList.filter(m => !m.read).length} unread
          </span>
        </div>
        <ul className="space-y-3">
          {mailsList.length > 0 ? (
            mailsList.map((mail) => (
              <li
                key={mail.id}
                className={`flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/95 px-5 py-4 shadow-sm transition hover:shadow-md ${
                  !mail.read ? 'bg-indigo-50/50 border-indigo-200' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {!mail.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    )}
                    <p className={`text-base font-semibold ${!mail.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {mail.from}
                    </p>
                  </div>
                  <p className={`mt-1 text-sm ${!mail.read ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                    {mail.subject}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Received: {new Date(mail.received).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <button
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  View
                </button>
              </li>
            ))
          ) : (
            <li className="text-center py-8 text-slate-500">
              <p>No messages in your inbox</p>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
};

export default Inbox;
