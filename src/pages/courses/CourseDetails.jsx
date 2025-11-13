import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCourseDetails, enrollInCourse, unenrollFromCourse } from '../../services/courseService';
import { listAssignments } from '../../services/assignmentService';

const CourseDetails = () => {
  const { id } = useParams();
  const user = useSelector(state => state.auth.user);
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const timeline = useMemo(() => {
    if (!course) return [];
    const milestones = [];
    if (course.startDate) {
      milestones.push({ label: 'Programme launch', date: new Date(course.startDate).toLocaleDateString() });
    }
    if (course.endDate) {
      milestones.push({ label: 'Culmination', date: new Date(course.endDate).toLocaleDateString() });
    }
    return milestones;
  }, [course]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [courseData, assignmentData] = await Promise.all([
          getCourseDetails(id),
          listAssignments(),
        ]);
        setCourse(courseData);
        setAssignments(assignmentData.filter(item => item.courseId === id));
        
        // Check if student is enrolled
        if (user?.role === 'student' && courseData.enrolled && Array.isArray(courseData.enrolled)) {
          setIsEnrolled(courseData.enrolled.includes(user.id));
        }
      } catch (error) {
        console.error(error);
        setError('Unable to load course details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading course experience...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!course) {
    return <p className="text-sm text-slate-500">Course not found.</p>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Course overview</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{course.title}</h1>
            <p className="mt-3 text-sm text-slate-600">{course.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-600">
                Facilitated by {course.instructor}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                {course.enrolled?.length || 0} / {course.capacity} enrolled
              </span>
              {course.totalYears && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-600">
                  {course.totalYears} Year{course.totalYears > 1 ? 's' : ''} Program
                </span>
              )}
              {course.department && (
                <span className="rounded-full bg-purple-50 px-3 py-1 font-semibold text-purple-600">
                  🏛️ {course.department}
                </span>
              )}
            </div>
          </div>
          {user?.role === 'student' && (
            <div className="flex gap-2">
              {isEnrolled ? (
                <>
                  <Link
                    to={`/students/course-modules/${id}`}
                    className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    View Modules
                  </Link>
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to unenroll from this course?')) {
                        try {
                          setEnrolling(true);
                          await unenrollFromCourse(id, user.id);
                          setIsEnrolled(false);
                          // Reload course to update enrollment count
                          const courseData = await getCourseDetails(id);
                          setCourse(courseData);
                        } catch (error) {
                          console.error('Error unenrolling:', error);
                          alert('Failed to unenroll. Please try again.');
                        } finally {
                          setEnrolling(false);
                        }
                      }
                    }}
                    disabled={enrolling}
                    className="rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    {enrolling ? 'Unenrolling...' : 'Unenroll'}
                  </button>
                </>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      setEnrolling(true);
                      await enrollInCourse(id, user.id);
                      setIsEnrolled(true);
                      // Reload course to update enrollment count
                      const courseData = await getCourseDetails(id);
                      setCourse(courseData);
                    } catch (error) {
                      console.error('Error enrolling:', error);
                      const message = error.response?.data?.message || 'Failed to enroll. Please try again.';
                      alert(message);
                    } finally {
                      setEnrolling(false);
                    }
                  }}
                  disabled={enrolling}
                  className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                </button>
              )}
            </div>
          )}
        </div>
        {Array.isArray(course.tags) && course.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase text-indigo-500">
            {course.tags.map(tag => (
              <span key={tag} className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-600">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-900">Key milestones</h2>
        {timeline.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Schedule will be announced soon.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {timeline.map(item => (
              <li key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm">
                <span className="inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.date}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h2 className="text-lg font-semibold text-slate-900">Assignments & deliverables</h2>
        {assignments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No assignments launched for this course yet.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {assignments.map(assignment => (
              <li key={assignment.id} className="rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{assignment.title}</p>
                {assignment.description ? (
                  <p className="mt-1 text-xs text-slate-500">{assignment.description}</p>
                ) : null}
                {assignment.dueDate ? (
                  <p className="mt-2 text-xs font-semibold uppercase text-indigo-500">
                    Due {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default CourseDetails;
