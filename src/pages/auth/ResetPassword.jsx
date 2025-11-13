import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import api from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await api.get(`/auth/verify-reset-token?token=${token}`);
      if (response.data.valid) {
        setValidToken(true);
      } else {
        setError(response.data.message || 'Invalid or expired reset token.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword: formData.newPassword,
      });
      
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm text-slate-500">Verifying reset token...</p>
        </div>
      </AuthLayout>
    );
  }

  if (!validToken) {
    return (
      <AuthLayout>
        <div className="mb-10 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Invalid Reset Link</h2>
          <p className="mt-2 text-sm text-slate-500 mb-6">{error || 'This password reset link is invalid or has expired.'}</p>
          <Link
            to="/forgot-password"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition"
          >
            Request New Reset Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-10 text-center">
        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Reset Password</h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-600">New Password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Enter new password"
            minLength={6}
            style={{ color: '#000000' }}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-600">Confirm Password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-black outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Confirm new password"
            minLength={6}
            style={{ color: '#000000' }}
          />
        </label>

        {message && (
          <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
            <p className="text-xs font-medium text-green-700">{message}</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-xs font-medium text-red-500">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {loading ? (
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
            </span>
          ) : null}
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors"
        >
          ← Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;

