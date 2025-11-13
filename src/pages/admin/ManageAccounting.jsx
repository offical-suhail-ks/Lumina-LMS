import React, { useEffect, useState } from 'react';
import { listAccountingUsers, createAccountingUser, updateAccountingUser, deleteAccountingUser } from '../../services/accountingUserService';

const emptyForm = {
  id: null,
  name: '',
  email: '',
  username: '',
  password: '',
};

const ManageAccounting = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await listAccountingUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setError('Unable to load accounting users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!form.name || !form.email || !form.username) {
      setError('Name, email, and username are required.');
      return;
    }
    if (!form.id && !form.password) {
      setError('Password is required when creating a new accounting user.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: form.name,
      email: form.email,
      username: form.username,
      password: form.password || undefined,
    };

    try {
      if (form.id) {
        await updateAccountingUser(form.id, payload);
      } else {
        await createAccountingUser(payload);
      }
      await fetchUsers();
      resetForm();
    } catch (error) {
      console.error(error);
      setError('Unable to save accounting user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = user => {
    setForm({
      id: user.id,
      name: user.name ?? '',
      email: user.email ?? '',
      username: user.username ?? '',
      password: '',
    });
    setError(null);
  };

  const handleDelete = async userId => {
    if (!window.confirm('Remove this accounting user from the system?')) return;
    try {
      await deleteAccountingUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error(error);
      setError('Unable to remove accounting user. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Manage Accounting Team</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create and manage accounting team accounts for fee and salary management.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {form.id ? 'Edit Accounting User' : 'Create New Accounting User'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password {!form.id && '*'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                required={!form.id}
                placeholder={form.id ? 'Leave blank to keep current password' : ''}
              />
              {form.id && (
                <p className="mt-1 text-xs text-slate-500">Leave blank to keep current password</p>
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : form.id ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update User
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create User
                  </>
                )}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* List */}
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Accounting Team Members</h2>
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-500">No accounting users yet. Create one to get started.</p>
          ) : (
            <ul className="space-y-3">
              {users.map(user => (
                <li
                  key={user.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <p className="text-xs text-indigo-500 mt-1">@{user.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManageAccounting;

