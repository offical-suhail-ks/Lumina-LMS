import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = () => (
  <div className="relative flex min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
    <div className="absolute inset-0 -z-10">
      <div className="absolute left-[-15%] top-[-20%] h-[26rem] w-[26rem] rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute right-[-10%] bottom-[-10%] h-[24rem] w-[24rem] rounded-full bg-cyan-500/20 blur-3xl" />
    </div>

    <Sidebar />
    <div className="flex flex-1 flex-col">
      <Topbar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/95 text-slate-900 backdrop-blur">
        <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);

export default DashboardLayout;
