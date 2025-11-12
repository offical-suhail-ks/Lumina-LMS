import React, { useEffect, useMemo, useState } from 'react';
import { listAssignments, createAssignment, updateAssignment } from '../../services/assignmentService';
import { listCourses } from '../../services/courseService';

const emptyAssignment = {
  id: null,
  title: '',
  courseId: '',
  dueDate: '',
  description: '',
};

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyAssignment);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const courseLookup = useMemo(
    () =>
      courses.reduce((accumulator, course) => {
        accumulator[course.id] = course;
        return accumulator;
      }, {}),
    [courses]
  );

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const [assignmentsData, coursesData] = await Promise.all([listAssignments(), listCourses()]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (error) {
      console.error(error);
      setError('Unable to load assignments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const resetForm = () => {
    setForm(emptyAssignment);
    setError(null);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!form.title || !form.courseId) {
      setError('Assignment name and course are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      title: form.title,
      courseId: form.courseId,
      dueDate: form.dueDate || null,
      description: form.description ?? '',
    };

    try {
      if (form.id) {
        await updateAssignment(form.id, payload);
      } else {
        await createAssignment(payload);
      }
      await fetchCollections();
      resetForm();
    } catch (error) {
      console.error(error);
      setError('Unable to save assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = assignment => {
    setForm({
      id: assignment.id,
      title: assignment.title ?? '',
      courseId: assignment.courseId ?? '',
      dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : '',
      description: assignment.description ?? '',
    });
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Admin · Assignment studio</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Craft project briefs and submission flows</h1>
        <p className="mt-1 text-sm text-slate-500">
          Publish new assignment briefs, tune due dates, and monitor submissions with clarity.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,3fr)]">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {form.id ? 'Update assignment' : 'Launch new assignment'}
              </h2>
              <p className="text-xs text-slate-500">
                Dimension briefs, align to courses, and set clear due windows for your learners.
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

          <label className="text-sm font-medium text-slate-600">
            Assignment title
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={form.title}
              onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))}
            />
          </label>

          <label className="text-sm font-medium text-slate-600">
            Course
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={form.courseId}
              onChange={event => setForm(prev => ({ ...prev, courseId: event.target.value }))}
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-600">
              Due date
              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={form.dueDate}
                onChange={event => setForm(prev => ({ ...prev, dueDate: event.target.value }))}
              />
            </label>
          </div>

          <label className="text-sm font-medium text-slate-600">
            Description / brief
            <textarea
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={form.description}
              onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))}
            />
          </label>

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
            {isSubmitting ? 'Saving...' : form.id ? 'Update assignment' : 'Create assignment'}
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Live assignments</h2>
            <button
              type="button"
              onClick={fetchCollections}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-400"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-slate-500">No assignments published yet.</p>
            ) : (
              assignments.map(assignment => (
                <article
                  key={assignment.id}
                  className="rounded-2xl border border-slate-200/70 bg-white/95 px-5 py-4 text-sm text-slate-600 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{assignment.title}</p>
                      <p className="text-xs text-indigo-500">
                        {courseLookup[assignment.courseId]?.title ?? 'Unknown course'}
                      </p>
                      {assignment.dueDate ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Due {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEdit(assignment)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-500"
                    >
                      Edit
                    </button>
                  </div>
                  {Array.isArray(assignment.submissions) && assignment.submissions.length > 0 ? (
                    <p className="mt-3 text-[11px] font-semibold uppercase text-emerald-500">
                      {assignment.submissions.length} submission{assignment.submissions.length === 1 ? '' : 's'}
                    </p>
                  ) : (
                    <p className="mt-3 text-[11px] font-semibold uppercase text-slate-400">No submissions yet</p>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ManageAssignments;

