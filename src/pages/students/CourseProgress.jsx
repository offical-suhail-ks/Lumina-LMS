import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listCourses } from '../../services/courseService';
import { listAssignments } from '../../services/assignmentService';

const CourseProgress = () => {
  const user = useSelector(state => state.auth.user);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesData, assignmentsData] = await Promise.all([
        listCourses(),
        listAssignments(),
      ]);
      setCourses(coursesData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseProgress = (course) => {
    const courseAssignments = assignments.filter(a => a.courseId === course.id);
    const totalAssignments = courseAssignments.length;
    
    if (totalAssignments === 0) {
      return { progress: 0, completed: 0, total: 0, submitted: 0 };
    }

    const submitted = courseAssignments.filter(assignment => {
      if (!assignment.submissions) return false;
      return assignment.submissions.some(s => s.studentId === user?.id);
    }).length;

    const completed = courseAssignments.filter(assignment => {
      if (!assignment.submissions) return false;
      const mySubmission = assignment.submissions.find(s => s.studentId === user?.id);
      return mySubmission && mySubmission.grade !== null && mySubmission.grade !== undefined;
    }).length;

    const progress = totalAssignments > 0 ? Math.round((completed / totalAssignments) * 100) : 0;

    return { progress, completed, total: totalAssignments, submitted };
  };

  const getDaysRemaining = (course) => {
    if (!course.endDate) return null;
    const end = new Date(course.endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Course Progress</h1>
        <p className="mt-2 text-sm text-slate-500">
          Track your progress and completion status for each course.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => {
          const progress = getCourseProgress(course);
          const daysRemaining = getDaysRemaining(course);
          
          return (
            <div
              key={course.id}
              className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{course.instructor}</p>
                </div>
                <Link
                  to={`/courses/${course.id}`}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Progress</span>
                  <span className="text-sm font-semibold text-indigo-600">{progress.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-lg font-semibold text-slate-900">{progress.total}</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600">Submitted</p>
                  <p className="text-lg font-semibold text-blue-700">{progress.submitted}</p>
                </div>
                <div className="text-center p-2 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-600">Graded</p>
                  <p className="text-lg font-semibold text-emerald-700">{progress.completed}</p>
                </div>
              </div>

              {/* Course Dates */}
              {course.startDate && course.endDate && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Start: {new Date(course.startDate).toLocaleDateString()}</span>
                    <span>End: {new Date(course.endDate).toLocaleDateString()}</span>
                  </div>
                  {daysRemaining !== null && (
                    <p className={`text-xs font-semibold mt-2 ${
                      daysRemaining < 0 ? 'text-rose-600' :
                      daysRemaining <= 7 ? 'text-amber-600' :
                      'text-slate-600'
                    }`}>
                      {daysRemaining < 0 
                        ? `Ended ${Math.abs(daysRemaining)} days ago`
                        : `${daysRemaining} days remaining`
                      }
                    </p>
                  )}
                </div>
              )}

              {/* Action Button */}
              {progress.total > 0 && progress.completed < progress.total && (
                <Link
                  to={`/courses/${course.id}`}
                  className="mt-4 block w-full text-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Continue Learning
                </Link>
              )}
            </div>
          );
        })}
      </section>

      {courses.length === 0 && (
        <div className="text-center py-12 rounded-3xl border border-slate-200/80 bg-white/80">
          <p className="text-slate-500">No courses enrolled yet.</p>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;

