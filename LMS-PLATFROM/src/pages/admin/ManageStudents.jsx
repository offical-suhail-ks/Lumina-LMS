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
  courseFee: '',
  paymentPlan: '',
  numberOfInstallments: '',
  paymentPlanDetails: '',
  feeDueDate: '',
  sendReminder: true,
  guardianName: '',
  guardianEmail: '',
  guardianPhone: '',
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
  const [sendOfferLetter, setSendOfferLetter] = useState(true);

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
    setSendOfferLetter(true);
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
      courseFee: form.courseFee ? parseFloat(form.courseFee) : null,
      paymentPlan: form.paymentPlan || null,
      paymentPlanDetails: form.paymentPlanDetails || null,
      numberOfInstallments: form.numberOfInstallments || null,
      feeDueDate: form.feeDueDate || null,
      sendReminder: form.sendReminder !== undefined ? form.sendReminder : true,
      guardian,
      sendOfferLetter: !form.id && sendOfferLetter,
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
      setError('Unable to save student. Please try again.');
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
      courseFee: student.courseFee != null && student.courseFee !== undefined ? (student.courseFee === 0 ? '0' : String(student.courseFee)) : '',
      paymentPlan: student.paymentPlan ?? '',
      paymentPlanDetails: student.paymentPlanDetails ?? '',
      numberOfInstallments: '',
      feeDueDate: student.feeDueDate ?? '',
      sendReminder: student.sendReminder !== undefined ? student.sendReminder : true,
      guardianName: student.guardian?.name ?? '',
      guardianEmail: student.guardian?.email ?? '',
      guardianPhone: student.guardian?.phone ?? '',
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
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-400"
              >
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

          {/* Fee Information */}
          <fieldset className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Fee Information</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">
                Course Fee *
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-slate-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    value={form.courseFee ?? ''}
                    onChange={event => {
                      const fee = event.target.value;
                      setForm(prev => {
                        let details = prev.paymentPlanDetails;
                        // Recalculate installment details if payment plan is installment
                        if (prev.paymentPlan === 'installment' && fee && prev.numberOfInstallments) {
                          const feeNum = parseFloat(fee);
                          const numInstallments = parseInt(prev.numberOfInstallments, 10);
                          if (!isNaN(feeNum) && !isNaN(numInstallments) && numInstallments > 0) {
                            const installmentAmount = (feeNum / numInstallments).toFixed(2);
                            details = `${numInstallments} installments of $${installmentAmount} each, due monthly`;
                          }
                        }
                        return { ...prev, courseFee: fee, paymentPlanDetails: details };
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">Always visible for editing student fee information</p>
              </label>
              <label className="text-sm font-medium text-slate-600">
                Payment Plan
                <select
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={form.paymentPlan}
                  onChange={event => setForm(prev => ({ ...prev, paymentPlan: event.target.value }))}
                >
                  <option value="">Select payment plan</option>
                  {PAYMENT_PLAN_OPTIONS.map(plan => (
                    <option key={plan.value} value={plan.value}>
                      {plan.label}
                    </option>
                  ))}
                </select>
              </label>
              {form.paymentPlan === 'installment' && (
                <>
                  <label className="text-sm font-medium text-slate-600">
                    Number of Installments
                    <input
                      type="number"
                      min="2"
                      max="12"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      value={form.numberOfInstallments}
                      onChange={event => {
                        const installments = event.target.value;
                        setForm(prev => {
                          let details = '';
                          if (installments && prev.courseFee) {
                            const fee = parseFloat(prev.courseFee);
                            const numInstallments = parseInt(installments, 10);
                            if (!isNaN(fee) && !isNaN(numInstallments) && numInstallments > 0) {
                              const installmentAmount = (fee / numInstallments).toFixed(2);
                              details = `${numInstallments} installments of $${installmentAmount} each, due monthly`;
                            }
                          }
                          return { ...prev, numberOfInstallments: installments, paymentPlanDetails: details };
                        });
                      }}
                      placeholder="e.g., 4"
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Installment Details (Auto-calculated)
                    <textarea
                      rows="3"
                      readOnly
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-offset-1"
                      value={form.paymentPlanDetails}
                      placeholder="Will be calculated automatically based on fee and number of installments"
                    />
                  </label>
                </>
              )}
              {form.paymentPlan === 'scholarship' && (
                <label className="text-sm font-medium text-slate-600 sm:col-span-2">
                  Scholarship Details
                  <textarea
                    rows="3"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    value={form.paymentPlanDetails}
                    onChange={event => setForm(prev => ({ ...prev, paymentPlanDetails: event.target.value }))}
                    placeholder="e.g., Merit Scholarship - 50% tuition waiver"
                  />
                </label>
              )}
            </div>
          </fieldset>

          {/* Fee Due Date */}
          {form.courseFee && parseFloat(form.courseFee) > 0 && (
            <fieldset className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Payment Due Date</legend>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">
                  Fee Payment Due Date
                  <input
                    type="date"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    value={form.feeDueDate}
                    onChange={event => setForm(prev => ({ ...prev, feeDueDate: event.target.value }))}
                  />
                  <p className="mt-1 text-xs text-slate-400">Set the deadline for fee payment</p>
                </label>
                <label className="flex items-start gap-3 text-sm font-medium text-slate-600">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={form.sendReminder}
                    onChange={event => setForm(prev => ({ ...prev, sendReminder: event.target.checked }))}
                  />
                  <div>
                    <span>Send payment reminders</span>
                    <p className="mt-1 text-xs text-slate-400">Automatically send reminder emails before due date</p>
                  </div>
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
                <label className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sendOfferLetter}
                    onChange={e => setSendOfferLetter(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-600">Send offer letter with login credentials via email</span>
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
            {isSubmitting ? 'Saving...' : form.id ? 'Update student' : 'Create student & send offer letter'}
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Active students</h2>
            <button
              type="button"
              onClick={fetchStudents}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-400"
            >
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
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-500"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(student.id)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {student.courseId ? (
                      <p className="text-xs text-indigo-600">
                        📚 {courses.find(c => c.id === student.courseId)?.title || courses.find(c => c.id === student.courseId)?.name || 'Course'}
                      </p>
                    ) : null}
                    {student.year ? (
                      <p className="text-xs text-purple-600">
                        📅 {student.year}
                      </p>
                    ) : null}
                    {student.courseFee ? (
                      <p className="text-xs text-emerald-600">
                        💰 ${parseFloat(student.courseFee).toLocaleString()}
                      </p>
                    ) : null}
                    {student.paymentPlan ? (
                      <p className="text-xs text-blue-600">
                        💳 {PAYMENT_PLAN_OPTIONS.find(p => p.value === student.paymentPlan)?.label || student.paymentPlan}
                      </p>
                    ) : null}
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
