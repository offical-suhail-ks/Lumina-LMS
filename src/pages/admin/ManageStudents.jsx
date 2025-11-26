import React, { useEffect, useMemo, useState } from 'react';
import { listStudents, createStudent, updateStudent, deleteStudent } from '../../services/studentService';
import { listCourses } from '../../services/courseService';

const emptyForm = {
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  courseId: '',
  year: '',
  cohort: '',
  batchTiming: '',
  classSchedule: '',
  guardianName: '',
  guardianEmail: '',
  guardianPhone: '',
  adminRemarks: '',
};

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate'];
const PAYMENT_PLAN_OPTIONS = [
  { value: 'full', label: 'Full Payment' },
  { value: 'installment', label: 'Installment Plan' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'waived', label: 'Fee Waived' },
];

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [error, setError] = useState(null);

  const guardian = useMemo(
    () => ({
      name: form.guardianName || null,
      email: form.guardianEmail || null,
      phone: form.guardianPhone || null,
    }),
    [form.guardianEmail, form.guardianName, form.guardianPhone]
  );

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await listStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
      setError('Unable to load students. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const data = await listCourses();
      setCourses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      setError('First name, last name, and email are required.');
      return;
    }
    if (!form.id && !form.password) {
      setError('Password is required when creating a new student.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password || undefined,
      phone: form.phone || null,
      dateOfBirth: form.dateOfBirth || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      country: form.country || null,
      postalCode: form.postalCode || null,
      courseId: form.courseId || null,
      year: form.year || null,
      cohort: form.cohort || null,
      batchTiming: form.batchTiming || null,
      classSchedule: form.classSchedule || null,
      guardian,
      adminRemarks: form.adminRemarks || null,
    };

    try {
      if (form.id) {
        await updateStudent(form.id, payload);
      } else {
        await createStudent(payload);
      }
      await fetchStudents();
      resetForm();
    } catch (error) {
      console.error(error);
      // Show more specific error messages
      if (error.message) {
        setError(error.message);
      } else if (error.code === '23505') {
        setError('A student with this email or username already exists.');
      } else if (error.code === '23503') {
        if (error.message && error.message.includes('course_id')) {
          setError('The selected course does not exist. Please select a valid course or leave it empty.');
        } else {
          setError('Invalid reference. Please check your input and try again.');
        }
      } else {
        setError('Unable to save student. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = student => {
    setForm({
      id: student.id,
      firstName: student.firstName ?? '',
      lastName: student.lastName ?? '',
      email: student.email ?? '',
      phone: student.phone ?? '',
      dateOfBirth: student.dateOfBirth ?? '',
      address: student.address ?? '',
      city: student.city ?? '',
      state: student.state ?? '',
      country: student.country ?? '',
      postalCode: student.postalCode ?? '',
      courseId: student.courseId ?? '',
      year: student.year ?? '',
      cohort: student.cohort ?? '',
      batchTiming: student.batchTiming ?? '',
      classSchedule: student.classSchedule ?? '',
      guardianName: student.guardian?.name ?? '',
      guardianEmail: student.guardian?.email ?? '',
      guardianPhone: student.guardian?.phone ?? '',
      adminRemarks: '',
    });
    setError(null);
  };

  const handleDelete = async studentId => {
    if (!window.confirm('Remove this student from the workspace?')) return;
    try {
      await deleteStudent(studentId);
      await fetchStudents();
    } catch (error) {
      console.error(error);
      setError('Unable to remove student. Please try again.');
    }
  };

  const selectedCourse = courses.find(c => c.id === form.courseId);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Admin · Student management</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Create and orchestrate student access</h1>
        <p className="mt-1 text-sm text-slate-500">
          Provision student accounts, delegate guardians, and keep cohorts aligned with active programmes.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,3fr)]">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur max-h-[calc(100vh-12rem)] overflow-y-auto"
        >
          <div className="flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {form.id ? 'Update student' : 'Create new student'}
              </h2>
              <p className="text-xs text-slate-500">
                {form.id ? 'Make edits to the selected student profile.' : 'Provision a new student login instantly.'}
              </p>
            </div>
            {form.id ? (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-400"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel edit
              </button>
            ) : null}
          </div>

          {/* Personal Information */}
          <fieldset className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Personal Information</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-600 sm:col-span-2">
                First name *
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.firstName}
                  onChange={event => setForm(prev => ({ ...prev, firstName: event.target.value }))}
                  required
                />
              </label>
              <label className="text-sm font-medium text-slate-600 sm:col-span-2">
                Last name *
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.lastName}
                  onChange={event => setForm(prev => ({ ...prev, lastName: event.target.value }))}
                  required
                />
              </label>
              <label className="text-sm font-medium text-slate-600 sm:col-span-2">
                Email address *
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.email}
                  onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
                  required
                />
                <p className="mt-1 text-xs text-slate-400">This will be used as the student's username for login</p>
              </label>
              <label className="text-sm font-medium text-slate-600">
                Phone
                <input
                  type="tel"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.phone}
                  onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))}
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Date of Birth
                <input
                  type="date"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.dateOfBirth}
                  onChange={event => setForm(prev => ({ ...prev, dateOfBirth: event.target.value }))}
                />
              </label>
            </div>
          </fieldset>

          {/* Address Information */}
          <fieldset className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Address</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-600 sm:col-span-2">
                Street Address
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.address}
                  onChange={event => setForm(prev => ({ ...prev, address: event.target.value }))}
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                City
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.city}
                  onChange={event => setForm(prev => ({ ...prev, city: event.target.value }))}
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                State/Province
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.state}
                  onChange={event => setForm(prev => ({ ...prev, state: event.target.value }))}
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Country
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.country}
                  onChange={event => setForm(prev => ({ ...prev, country: event.target.value }))}
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Postal Code
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.postalCode}
                  onChange={event => setForm(prev => ({ ...prev, postalCode: event.target.value }))}
                />
              </label>
            </div>
          </fieldset>

          {/* Academic Information */}
          <fieldset className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Academic Information</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">
                Course
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.courseId}
                  onChange={event => setForm(prev => ({ ...prev, courseId: event.target.value }))}
                >
                  <option value="">Select a course</option>
                  {isLoadingCourses ? (
                    <option disabled>Loading courses...</option>
                  ) : (
                    courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title || course.name}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">
                Year
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.year}
                  onChange={event => setForm(prev => ({ ...prev, year: event.target.value }))}
                >
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600 sm:col-span-2">
                Cohort (optional)
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.cohort}
                  onChange={event => setForm(prev => ({ ...prev, cohort: event.target.value }))}
                />
              </label>
            </div>
          </fieldset>

          {/* Batch and Schedule Information */}
          <fieldset className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Batch & Schedule</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">
                Batch Timing
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.batchTiming}
                  onChange={event => setForm(prev => ({ ...prev, batchTiming: event.target.value }))}
                >
                  <option value="">Select batch timing</option>
                  <option value="morning">Morning Batch</option>
                  <option value="afternoon">Afternoon Batch</option>
                  <option value="regular">Regular Batch</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">
                Class Schedule
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.classSchedule}
                  onChange={event => setForm(prev => ({ ...prev, classSchedule: event.target.value }))}
                >
                  <option value="">Select schedule</option>
                  <option value="daily">Daily Class (Mon-Fri)</option>
                  <option value="weekend">Weekend Class (Sat-Sun)</option>
                  <option value="mwf">MWF (Monday, Wednesday, Friday)</option>
                  <option value="tts">TTS (Tuesday, Thursday, Saturday)</option>
                </select>
              </label>
            </div>
          </fieldset>

          {/* Remarks for Accounting Team */}
          {!form.id && (
            <fieldset className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Remarks for Accounting Team</legend>
              <div className="mt-2">
                <label className="text-sm font-medium text-slate-600">
                  Additional Notes (Optional)
                  <textarea
                    rows="3"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    value={form.adminRemarks}
                    onChange={event => setForm(prev => ({ ...prev, adminRemarks: event.target.value }))}
                    placeholder="Add any special instructions or notes about fee setup for the accounting team..."
                  />
                  <p className="mt-1 text-xs text-slate-400">These remarks will be sent to the accounting team along with the student application</p>
                </label>
              </div>
            </fieldset>
          )}

          {/* Login Credentials */}
          {!form.id && (
            <fieldset className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Login Credentials</legend>
              <div className="mt-2">
                <label className="text-sm font-medium text-slate-600">
                  Password *
                  <input
                    type="password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    value={form.password}
                    onChange={event => setForm(prev => ({ ...prev, password: event.target.value }))}
                    placeholder="Create a secure password"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-400">This password will be sent to the student via email</p>
                </label>
              </div>
            </fieldset>
          )}

          {/* Guardian Information */}
          <fieldset className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Guardian Information</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <input
                placeholder="Guardian name"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={form.guardianName}
                onChange={event => setForm(prev => ({ ...prev, guardianName: event.target.value }))}
              />
              <input
                placeholder="Guardian email"
                type="email"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={form.guardianEmail}
                onChange={event => setForm(prev => ({ ...prev, guardianEmail: event.target.value }))}
              />
              <input
                placeholder="Guardian phone"
                type="tel"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:col-span-2"
                value={form.guardianPhone}
                onChange={event => setForm(prev => ({ ...prev, guardianPhone: event.target.value }))}
              />
            </div>
          </fieldset>

          {error ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-500">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {isSubmitting ? (
              'Saving...'
            ) : form.id ? (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update student
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Forward to Accounting Team
              </>
            )}
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Active students</h2>
            <button
              type="button"
              onClick={fetchStudents}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          <div className="mt-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading students...</p>
            ) : students.length === 0 ? (
              <p className="text-sm text-slate-500">No students provisioned yet.</p>
            ) : (
              students.map(student => (
                <article
                  key={student.id}
                  className="rounded-2xl border border-slate-200/70 bg-white/95 px-5 py-4 text-sm text-slate-600 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(student)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-500"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(student.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-100"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {student.courseId ? (
                      <p className="flex items-center gap-1 text-xs text-indigo-600">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {courses.find(c => c.id === student.courseId)?.title || courses.find(c => c.id === student.courseId)?.name || 'Course'}
                      </p>
                    ) : null}
                    {student.year ? (
                      <p className="flex items-center gap-1 text-xs text-purple-600">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {student.year}
                      </p>
                    ) : null}
                    {student.courseFee ? (
                      <p className="flex items-center gap-1 text-xs text-emerald-600">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ${parseFloat(student.courseFee).toLocaleString()}
                      </p>
                    ) : null}
                    {student.paymentPlan ? (
                      <p className="flex items-center gap-1 text-xs text-blue-600">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {PAYMENT_PLAN_OPTIONS.find(p => p.value === student.paymentPlan)?.label || student.paymentPlan}
                      </p>
                    ) : null}
                    {student.applicationStatus && (
                      <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        student.applicationStatus === 'accepted' ? 'bg-green-100 text-green-700' :
                        student.applicationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        student.applicationStatus === 'fee_setup_pending' ? 'bg-orange-100 text-orange-700' :
                        student.applicationStatus === 'fee_setup_completed' ? 'bg-blue-100 text-blue-700' :
                        student.applicationStatus === 'under_review' ? 'bg-purple-100 text-purple-700' :
                        student.applicationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {student.applicationStatus === 'accepted' && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {student.applicationStatus === 'pending' && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {student.applicationStatus === 'under_review' && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                        {student.applicationStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    )}
                  </div>
                  {student.guardian?.email ? (
                    <p className="mt-1 text-xs text-slate-400">
                      Guardian: {student.guardian.name ?? 'N/A'} · {student.guardian.email}
                    </p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ManageStudents;
