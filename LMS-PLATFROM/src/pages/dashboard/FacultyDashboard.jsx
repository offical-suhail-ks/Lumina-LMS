import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listCourses } from '../../services/courseService';
import { listAssignments } from '../../services/assignmentService';

const FacultyDashboard = () => {
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
      
      // Debug logging
      console.log('Faculty user:', user);
      console.log('Faculty department:', user?.department);
      console.log('All courses:', coursesData);
      console.log('Courses with departments:', coursesData.map(c => ({ id: c.id, title: c.title, department: c.department })));
      
      // Filter courses by department (show all courses from faculty's department)
      // If faculty has no department set, show all courses (fallback)
      const departmentCourses = user?.department
        ? coursesData.filter(c => 
            c.department && 
            c.department.toLowerCase() === user.department.toLowerCase()
          )
        : coursesData; // Show all courses if department not set
      
      console.log('Filtered department courses:', departmentCourses);
      
      // Get assignments for department courses
      const departmentCourseIds = departmentCourses.map(c => c.id);
      const myAssignments = assignmentsData.filter(a => departmentCourseIds.includes(a.courseId));
      
      setCourses(departmentCourses);
      setAssignments(myAssignments);
    } catch (error) {
      console.error('Error fetching faculty data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pending submissions
  const pendingSubmissions = assignments.reduce((total, assignment) => {
    return total + (assignment.submissions?.length || 0);
  }, 0);

  // Get upcoming assignments
  const upcomingAssignments = assignments
    .filter(a => {
      if (!a.dueDate) return false;
      const due = new Date(a.dueDate);
      return due >= new Date();
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-indigo-500/5 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Faculty Dashboard</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Welcome, {user?.name?.split(' ')[0] ?? 'Faculty'}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
              Guide learning moments with precision. Surface cohorts that need your attention, review submissions, and orchestrate meaningful feedback loops.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Teaching illustration */}
            <div className="hidden lg:flex items-center justify-center w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500 p-4 shadow-lg">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <g transform="translate(60, 40)">
                  <circle cx="40" cy="40" r="35" fill="#ffffff" />
                  <rect x="15" y="75" width="50" height="70" rx="5" fill="#ffffff" />
                  <rect x="20" y="80" width="40" height="60" fill="#fbbf24" />
                  <path d="M40 35 L25 15 L55 15 Z" fill="#ffffff" />
                  <circle cx="40" cy="40" r="15" fill="#fbbf24" />
                  <path d="M20 100 L40 80 L60 100" stroke="#fbbf24" strokeWidth="3" fill="none" />
                </g>
                <circle cx="30" cy="30" r="4" fill="#ffffff" opacity="0.8" />
                <circle cx="170" cy="50" r="4" fill="#ffffff" opacity="0.8" />
                <circle cx="50" cy="170" r="4" fill="#ffffff" opacity="0.8" />
              </svg>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-indigo-500 to-indigo-400 p-[1px]">
            <div className="relative h-full rounded-[1.05rem] bg-white/90 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">My Courses</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{courses.length}</p>
              <p className="mt-2 text-xs font-medium text-slate-500">Active courses</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-sky-500 to-sky-400 p-[1px]">
            <div className="relative h-full rounded-[1.05rem] bg-white/90 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Reviews</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{pendingSubmissions}</p>
              <p className="mt-2 text-xs font-medium text-slate-500">Submissions to grade</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-emerald-500 to-emerald-400 p-[1px]">
            <div className="relative h-full rounded-[1.05rem] bg-white/90 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assignments</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{assignments.length}</p>
              <p className="mt-2 text-xs font-medium text-slate-500">Total assignments</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-amber-500 to-orange-400 p-[1px]">
            <div className="relative h-full rounded-[1.05rem] bg-white/90 p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Students</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">
                {courses.reduce((total, course) => total + (course.enrolled?.length || 0), 0)}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500">Total enrolled</p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Submission Queue</h2>
              <Link
                to="/faculty/grade-submissions"
                className="text-sm font-medium text-indigo-500 hover:text-indigo-400"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {assignments.length > 0 ? (
                assignments
                  .filter(a => a.submissions && a.submissions.length > 0)
                  .slice(0, 5)
                  .map(assignment => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{assignment.title}</p>
                        <p className="text-xs text-slate-500">
                          {assignment.submissions?.length || 0} submission{assignment.submissions?.length !== 1 ? 's' : ''} pending
                        </p>
                      </div>
                      <Link
                        to={`/faculty/grade-submissions?assignment=${assignment.id}`}
                        className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        Review
                      </Link>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-slate-500">No pending submissions</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900">My Courses</h2>
            <div className="mt-4 space-y-3">
              {courses.length > 0 ? (
                courses.slice(0, 3).map(course => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 hover:shadow-md transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                      <p className="text-xs text-slate-500">
                        {course.enrolled?.length || 0} students enrolled
                      </p>
                    </div>
                    <span className="text-xs text-indigo-500">View →</span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500">No courses assigned</p>
              )}
            </div>
            {courses.length > 3 && (
              <Link
                to="/faculty/my-courses"
                className="mt-4 inline-block text-sm font-medium text-indigo-500 hover:text-indigo-400"
              >
                View all courses →
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Quick Actions</p>
            <div className="mt-4 space-y-2">
              <Link
                to="/faculty/create-assignment"
                className="block w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 text-center"
              >
                Create Assignment
              </Link>
              <Link
                to="/faculty/student-roster"
                className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 text-center"
              >
                View Student Roster
              </Link>
              <Link
                to="/mailbox/send"
                className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 text-center"
              >
                Send Announcement
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 p-[1px] shadow-xl shadow-indigo-500/20">
            <div className="rounded-[1.45rem] bg-slate-900 p-6 text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">Teaching Excellence</p>
              <p className="mt-3 text-lg font-semibold">Keep inspiring!</p>
              <p className="mt-2 text-sm text-indigo-100">
                Your dedication to student success makes a real difference. Continue providing meaningful feedback and guidance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FacultyDashboard;
