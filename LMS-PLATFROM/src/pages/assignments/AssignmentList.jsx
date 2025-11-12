import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { listAssignments } from '../../services/assignmentService';
import { listCourses } from '../../services/courseService';

const AssignmentList = () => {
  const user = useSelector(state => state.auth.user);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Hide submit button for admin and faculty
  const showSubmitButton = user?.role === 'student';

  const courseLookup = useMemo(
    () =>
      courses.reduce((accumulator, course) => {
        accumulator[course.id] = course;
        return accumulator;
      }, {}),
    [courses]
  );

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const [assignmentData, courseData] = await Promise.all([listAssignments(), listCourses()]);
        setAssignments(assignmentData);
        setCourses(courseData);
      } catch (error) {
        console.error(error);
        setError('Unable to load assignments.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Assignments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track deliverables, due dates, and submission momentum across your courses.
          </p>
        </div>
        <div className="flex gap-3">
          {user?.role === 'faculty' && (
            <Link
              to="/faculty/create-assignment"
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              Create Assignment
            </Link>
          )}
          {showSubmitButton && (
            <Link
              to="/assignments/submit"
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              Submit assignment
            </Link>
          )}
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading assignments...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-slate-500">No assignments available yet.</p>
        ) : (
          <ul className="space-y-4">
            {assignments.map(assignment => (
              <li
                key={assignment.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="text-base font-semibold text-slate-900">{assignment.title}</p>
                  <p className="mt-1 text-xs text-indigo-500">
                    {courseLookup[assignment.courseId]?.title ?? 'Unknown course'}
                  </p>
                  {assignment.description ? (
                    <p className="mt-2 text-sm text-slate-600">{assignment.description}</p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2 text-sm">
                  {assignment.dueDate ? (
                    <span className="rounded-xl bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-600">
                      Due {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                      Rolling submission
                    </span>
                  )}
                  <span className="text-[11px] font-semibold uppercase text-emerald-500">
                    {assignment.submissions?.length ?? 0} submission
                    {(assignment.submissions?.length ?? 0) === 1 ? '' : 's'}
                  </span>
                  {user?.role === 'faculty' && assignment.submissions && assignment.submissions.length > 0 && (
                    <Link
                      to={`/faculty/grade-submissions?assignment=${assignment.id}`}
                      className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Grade ({assignment.submissions.length})
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AssignmentList;
