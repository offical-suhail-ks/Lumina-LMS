import React, { useEffect, useState } from 'react';
import { listCourses, createCourse, updateCourse, deleteCourse } from '../../services/courseService';

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

const emptyCourse = {
  id: null,
  title: '',
  description: '',
  instructor: '',
  department: '',
  startDate: '',
  endDate: '',
  totalYears: '',
  tags: '',
  capacity: 30,
};

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await listCourses();
      setCourses(data);
    } catch (error) {
      console.error(error);
      setError('Unable to load courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const resetForm = () => {
    setCourseForm(emptyCourse);
    setError(null);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!courseForm.title || !courseForm.description || !courseForm.instructor) {
      setError('Title, description, and instructor are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      title: courseForm.title,
      description: courseForm.description,
      instructor: courseForm.instructor,
      department: courseForm.department || null,
      startDate: courseForm.startDate || null,
      endDate: courseForm.endDate || null,
      totalYears: courseForm.totalYears ? Number(courseForm.totalYears) : null,
      capacity: Number(courseForm.capacity) || 30,
      tags: courseForm.tags
        ? courseForm.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
        : [],
    };

    try {
      if (courseForm.id) {
        await updateCourse(courseForm.id, payload);
      } else {
        await createCourse(payload);
      }
      await fetchCourses();
      resetForm();
    } catch (error) {
      console.error(error);
      setError('Unable to save course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = course => {
    setCourseForm({
      id: course.id,
      title: course.title ?? '',
      description: course.description ?? '',
      instructor: course.instructor ?? '',
      department: course.department ?? '',
      startDate: course.startDate ?? '',
      endDate: course.endDate ?? '',
      totalYears: course.totalYears ?? '',
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : '',
      capacity: course.capacity ?? 30,
    });
  };

  const handleDelete = async courseId => {
    if (!window.confirm('Archive this course?')) return;
    try {
      await deleteCourse(courseId);
      await fetchCourses();
    } catch (error) {
      console.error(error);
      setError('Unable to archive course. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Admin · Course architecture</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Design and iterate learning experiences</h1>
        <p className="mt-1 text-sm text-slate-500">
          Launch new courses, refine copy, and manage cohorts with a dedicated course builder panel.
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
                {courseForm.id ? 'Update course' : 'Create new course'}
              </h2>
              <p className="text-xs text-slate-500">
                Craft course narratives, define instructors, and sequence timelines.
              </p>
            </div>
            {courseForm.id ? (
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
            Course title
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={courseForm.title}
              onChange={event => setCourseForm(prev => ({ ...prev, title: event.target.value }))}
            />
          </label>

          <label className="text-sm font-medium text-slate-600">
            Description
            <textarea
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={courseForm.description}
              onChange={event => setCourseForm(prev => ({ ...prev, description: event.target.value }))}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-600">
              Instructor
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={courseForm.instructor}
                onChange={event => setCourseForm(prev => ({ ...prev, instructor: event.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Department
              <select
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={courseForm.department}
                onChange={event => setCourseForm(prev => ({ ...prev, department: event.target.value }))}
              >
                <option value="">Select department</option>
                {DEPARTMENT_OPTIONS.map(dept => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-600">
              Capacity
              <input
                type="number"
                min="1"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={courseForm.capacity}
                onChange={event => setCourseForm(prev => ({ ...prev, capacity: event.target.value }))}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium text-slate-600">
              Start date
              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={courseForm.startDate}
                onChange={event => setCourseForm(prev => ({ ...prev, startDate: event.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              End date
              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={courseForm.endDate}
                onChange={event => setCourseForm(prev => ({ ...prev, endDate: event.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Total Years
              <input
                type="number"
                min="1"
                max="10"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={courseForm.totalYears}
                onChange={event => setCourseForm(prev => ({ ...prev, totalYears: event.target.value }))}
                placeholder="e.g., 4"
              />
              <p className="mt-1 text-xs text-slate-400">Total duration of the course program</p>
            </label>
          </div>

          <label className="text-sm font-medium text-slate-600">
            Tags (comma separated)
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-offset-1 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              value={courseForm.tags}
              onChange={event => setCourseForm(prev => ({ ...prev, tags: event.target.value }))}
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
            {isSubmitting ? 'Saving...' : courseForm.id ? 'Update course' : 'Create course'}
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Courses</h2>
            <button
              type="button"
              onClick={fetchCourses}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-400"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading courses...</p>
            ) : courses.length === 0 ? (
              <p className="text-sm text-slate-500">No courses launched yet.</p>
            ) : (
              courses.map(course => (
                <article
                  key={course.id}
                  className="rounded-2xl border border-slate-200/70 bg-white/95 px-5 py-4 text-sm text-slate-600 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{course.title}</p>
                      <p className="mt-1 text-xs text-slate-500">Instructor: {course.instructor}</p>
                      {course.department && (
                        <p className="mt-1 text-xs text-purple-600">🏛️ {course.department}</p>
                      )}
                      {course.startDate ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {course.startDate} – {course.endDate ?? 'TBD'}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(course)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-500"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(course.id)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-100"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                  {Array.isArray(course.tags) && course.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase text-indigo-500">
                      {course.tags.map(tag => (
                        <span key={tag} className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-600">
                          {tag}
                        </span>
                      ))}
                    </div>
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

export default ManageCourses;

