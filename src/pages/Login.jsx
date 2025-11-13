import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin',
};

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!onLogin) return;
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const success = await Promise.resolve(
        onLogin({
          username: username.trim(),
          password,
        })
      );

      if (!success) {
        setError('Invalid credentials. If forgot password reset.');
      }
    } catch (error) {
      console.error(error);
      setError('Unable to sign you in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-500">Access to LMS platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Username</span>
          <input
            type="text"
            autoComplete="username"
            placeholder="Enter your username"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ color: '#000000' }}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ color: '#000000' }}
          />
        </label>

        {error && (
          <div className="space-y-3">
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-500">{error}</p>
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
                style={{ textDecoration: 'underline', color: '#2563eb' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Forgot Password?
              </Link>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {isSubmitting ? (
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
          ) : null}
          {isSubmitting ? 'Signing you in...' : 'Sign in'}
        </button>
      </form>

      {!error && (
        <div className="mt-6 text-center">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
            style={{ textDecoration: 'underline', color: '#2563eb' }}
          >
            Forgot your password?
          </Link>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        Use the default administrator credentials to access the dashboard experience. Additional roles will be enabled
        soon.
      </p>
    </AuthLayout>
  );
};

export default Login;
