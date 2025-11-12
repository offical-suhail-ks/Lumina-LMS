import React, { useEffect, useState } from 'react';
import { listFaculty, createFaculty, updateFaculty, deleteFaculty } from '../../services/facultyService';

const DEPARTMENT_OPTIONS = [
  { value: 'Computing', label: 'Computing' },
  { value: 'Business', label: 'Business' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Science', label: 'Science' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Law', label: 'Law' },
  { value: 'Education', label: 'Education' },
  { value: 'Other', label: 'Other' },
];

const emptyForm = {
  id: null,
  name: '',
  email: '',
  username: '',
  password: '',
  phone: '',
  department: '',
  office: '',
  officeHours: '',
  specialization: '',
};

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFaculty = async () => {
    try {
      setIsLoading(true);
      const data = await listFaculty();
      setFaculty(data);
    } catch (error) {
      console.error(error);
      setError('Unable to load faculty. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
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
      setError('Password is required when creating a new faculty member.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: form.name,
      email: form.email,
      username: form.username,
      password: form.password || undefined,
      phone: form.phone || null,
      department: form.department || null,
      office: form.office || null,
      officeHours: form.officeHours || null,
      specialization: form.specialization || null,
    };

    try {
      if (form.id) {
        await updateFaculty(form.id, payload);
      } else {
        await createFaculty(payload);
      }
      await fetchFaculty();
      resetForm();
    } catch (error) {
      console.error(error);
      setError('Unable to save faculty member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = facultyMember => {
    setForm({
      id: facultyMember.id,
      name: facultyMember.name ?? '',
      email: facultyMember.email ?? '',
      username: facultyMember.username ?? '',
      phone: facultyMember.phone ?? '',
      department: facultyMember.department ?? '',
      office: facultyMember.office ?? '',
      officeHours: facultyMember.officeHours ?? '',
      specialization: facultyMember.specialization ?? '',
    });
    setError(null);
  };

  const handleDelete = async facultyId => {
    if (!window.confirm('Remove this faculty member from the system?')) return;
    try {
      await deleteFaculty(facultyId);
      await fetchFaculty();
    } catch (error) {
      console.error(error);
      setError('Unable to remove faculty member. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Manage Faculty</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create and manage faculty accounts for course instructors.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {form.id ? 'Edit Faculty Member' : 'Create New Faculty Member'}
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

            {!form.id && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  required={!form.id}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
              <select
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                required
              >
                <option value="">Select department</option>
                {DEPARTMENT_OPTIONS.map(dept => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Office</label>
              <input
                type="text"
                value={form.office}
                onChange={e => setForm({ ...form, office: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g., Room 205"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Office Hours</label>
              <input
                type="text"
                value={form.officeHours}
                onChange={e => setForm({ ...form, officeHours: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g., Mon-Wed 2:00 PM - 4:00 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                value={form.specialization}
                onChange={e => setForm({ ...form, specialization: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g., Machine Learning, Data Science"
              />
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
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : form.id ? 'Update Faculty' : 'Create Faculty'}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* List */}
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Faculty Members</h2>
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading faculty...</p>
          ) : faculty.length === 0 ? (
            <p className="text-sm text-slate-500">No faculty members yet. Create one to get started.</p>
          ) : (
            <ul className="space-y-3">
              {faculty.map(member => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                    {member.department && (
                      <p className="text-xs text-indigo-500 mt-1">{member.department}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
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

export default ManageFaculty;

