import React from 'react';

const AuthLayout = ({ children }) => (
  <div className="relative flex min-h-screen w-full overflow-hidden bg-slate-950 text-slate-50">
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute right-[-10%] top-[-20%] h-[32rem] w-[32rem] rounded-full bg-indigo-500/40 blur-3xl" />
      <div className="absolute left-[-20%] bottom-[-10%] h-[30rem] w-[30rem] rounded-full bg-sky-400/30 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_55%)]" />
    </div>

    <div className="hidden flex-1 flex-col justify-between px-16 py-12 lg:flex">
      <div className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-bold text-white">
          L
        </span>
        <span className="text-white">Lumina LMS</span>
      </div>
      <div className="space-y-8">
        <h1 className="text-4xl font-semibold leading-tight text-white">
          Manage learning journeys with clarity and confidence.
        </h1>
        <p className="max-w-md text-lg text-slate-200">
          Personalised dashboards, collaborative tools, and actionable insights designed for modern institutions.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {['Smart dashboards', 'Collaborative learning', 'Realtime insights', 'Secure messaging'].map(item => (
            <div key={item} className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
              <p className="text-sm font-medium text-white/80">{item}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-sm text-white/60">© {new Date().getFullYear()} Lumina LMS. All rights reserved.</p>
    </div>

    <div className="flex w-full flex-1 items-center justify-center px-6 py-16 sm:px-10 lg:w-[40%]">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-10 shadow-2xl backdrop-blur-lg">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
