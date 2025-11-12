import React from 'react';

const FeeCard = ({ due, paid }) => (
  <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Financial health</p>
    <h3 className="mt-3 text-lg font-semibold text-slate-900">Tuition overview</h3>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-4 text-sm text-slate-600 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Amount due</p>
        <p className="mt-2 text-2xl font-semibold text-rose-500">{due}</p>
      </div>
      <div className="rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-4 text-sm text-slate-600 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Amount paid</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-500">{paid}</p>
      </div>
    </div>
    <button
      type="button"
      className="mt-5 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-slate-900/20 transition hover:bg-slate-800"
    >
      View payment history
    </button>
  </div>
);

export default FeeCard;
