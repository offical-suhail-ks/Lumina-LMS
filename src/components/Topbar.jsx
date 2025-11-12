import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

const Topbar = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  return (
    <header className="sticky top-0 z-50 flex h-16 flex-shrink-0 items-center gap-4 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md shadow-sm sm:px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="hidden lg:flex">
          <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Today • {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div className="relative flex w-full max-w-xl items-center">
          <input
            type="search"
            placeholder="Search courses, students, or actions..."
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 pl-10 text-sm text-slate-600 shadow-inner outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <span className="absolute left-3 text-slate-400">⌕</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-semibold text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-500"
        >
          ☰
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-[10px] font-semibold text-white shadow-lg">
            3
          </span>
        </button>

        <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm sm:flex">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-base font-semibold text-white shadow-inner">
            <div className="flex h-full items-center justify-center">
              {(user?.name ?? 'Ava Daniels')
                .split(' ')
                .map(part => part[0])
                .join('')
                .slice(0, 2)}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{user?.name ?? 'Ava Daniels'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role ?? 'student'}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
