import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { listCourses } from '../../services/courseService';
import { listAssignments } from '../../services/assignmentService';
import { getStudentAttendanceSummary } from '../../services/attendanceService';

const DashboardOverview = () => {
  const user = useSelector(state => state.auth.user);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, assignmentsData] = await Promise.all([
          listCourses(),
          listAssignments(),
        ]);
        setCourses(coursesData);
        setAssignments(assignmentsData);
        
        // Fetch attendance summary if user is a student
        if (user?.id && user?.role === 'student') {
          try {
            const summary = await getStudentAttendanceSummary(user.id);
            console.log('Attendance summary:', summary);
            setAttendanceSummary(summary);
          } catch (error) {
            console.error('Error fetching attendance summary:', error);
            // Set default empty summary on error
            setAttendanceSummary({
              totalClasses: 0,
              present: 0,
              absent: 0,
              late: 0,
              excused: 0,
              attendancePercentage: 0,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Calculate metrics from real data
  const activeCourses = courses.filter(c => {
    if (!c.startDate || !c.endDate) return true;
    const today = new Date();
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return today >= start && today <= end;
  }).length;

  const now = new Date();
  const assignmentsDue = assignments.filter(a => {
    if (!a.dueDate) return false;
    const due = new Date(a.dueDate);
    return due >= now;
  }).length;

  const assignmentsThisWeek = assignments.filter(a => {
    if (!a.dueDate) return false;
    const due = new Date(a.dueDate);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return due >= now && due <= weekFromNow;
  }).length;

  // Calculate average grade from actual submissions
  const calculateAverageGrade = () => {
    if (!user?.id) {
      return { avg: 'N/A', trend: 'Not logged in' };
    }
    
    const gradedSubmissions = [];
    assignments.forEach(assignment => {
      if (assignment.submissions && Array.isArray(assignment.submissions)) {
        assignment.submissions.forEach(submission => {
          // Check if this submission belongs to the current student
          if (submission.studentId === user.id && submission.grade !== null && submission.grade !== undefined) {
            const grade = parseFloat(submission.grade);
            if (!isNaN(grade)) {
              gradedSubmissions.push(grade);
            }
          }
        });
      }
    });
    
    if (gradedSubmissions.length === 0) {
      return { avg: 'N/A', trend: 'No grades yet' };
    }
    
    const average = (gradedSubmissions.reduce((sum, grade) => sum + grade, 0) / gradedSubmissions.length).toFixed(1);
    return { avg: `${average}%`, trend: `${gradedSubmissions.length} graded` };
  };

  const gradeData = calculateAverageGrade();
  const avgGrade = gradeData.avg;
  const gradeTrend = gradeData.trend;

  // Learning streak (mock for now)
  const learningStreak = '12 days';
  const streakMessage = 'Keep it up!';

  // Use monthly data if available, otherwise fall back to all-time
  const monthlyData = attendanceSummary?.monthly;
  const attendanceValue = monthlyData && monthlyData.expectedClasses > 0
    ? `${monthlyData.attendancePercentage}%`
    : monthlyData && monthlyData.totalClasses > 0
    ? `${monthlyData.attendancePercentage}%`
    : attendanceSummary && attendanceSummary.totalClasses > 0
    ? `${attendanceSummary.attendancePercentage}%`
    : attendanceSummary && attendanceSummary.totalClasses === 0
    ? '0%'
    : 'N/A';
  
  const attendanceTrend = monthlyData && monthlyData.expectedClasses > 0
    ? `${monthlyData.present + monthlyData.late + monthlyData.excused}/${monthlyData.expectedClasses} this month`
    : monthlyData && monthlyData.totalClasses > 0
    ? `${monthlyData.present + monthlyData.late + monthlyData.excused}/${monthlyData.totalClasses} this month`
    : attendanceSummary && attendanceSummary.totalClasses > 0
    ? `${attendanceSummary.present}/${attendanceSummary.totalClasses} classes`
    : attendanceSummary && attendanceSummary.totalClasses === 0
    ? 'No classes yet'
    : 'No data';

  const metrics = [
    { 
      label: 'Active courses', 
      value: activeCourses, 
      trend: `+${Math.max(0, activeCourses - 4)} new`, 
      accent: 'from-indigo-500 to-indigo-400' 
    },
    { 
      label: 'Assignments due', 
      value: assignmentsDue, 
      trend: `${assignmentsThisWeek} this week`, 
      accent: 'from-sky-500 to-sky-400' 
    },
    { 
      label: 'Avg. grade', 
      value: avgGrade, 
      trend: gradeTrend, 
      accent: 'from-emerald-500 to-emerald-400' 
    },
    { 
      label: 'Attendance', 
      value: attendanceValue, 
      trend: attendanceTrend, 
      accent: 'from-purple-500 to-purple-400' 
    },
    { 
      label: 'Learning streak', 
      value: learningStreak, 
      trend: streakMessage, 
      accent: 'from-amber-500 to-orange-400' 
    },
  ];

  const upcomingAssignments = assignments
    .filter(a => {
      if (!a.dueDate) return false;
      const due = new Date(a.dueDate);
      return due >= now;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3)
    .map(a => {
      const due = new Date(a.dueDate);
      const today = new Date();
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let dueText = '';
      if (diffDays === 0) dueText = 'Today • 11:59 PM';
      else if (diffDays === 1) dueText = 'Tomorrow • 11:59 PM';
      else if (diffDays <= 7) dueText = `${due.toLocaleDateString('en-US', { weekday: 'short' })} • ${due.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      else dueText = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' • ' + due.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      return {
        label: a.title,
        due: dueText,
        status: diffDays <= 1 ? 'urgent' : diffDays <= 7 ? 'upcoming' : 'informational',
      };
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-indigo-500/5 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">Dashboard</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
              Welcome back, {user?.name?.split(' ')[0] ?? 'User'}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
              Here's a snapshot of your learning momentum. Track live progress, upcoming milestones, and the health of
              your collaborations at a glance.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Graduation Celebration Illustration */}
            <div className="hidden lg:flex items-center justify-center w-32 h-32 rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 p-4 shadow-lg">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Graduation cap person 1 */}
                <g transform="translate(20, 60)">
                  <circle cx="25" cy="25" r="20" fill="#1e293b" />
                  <rect x="5" y="45" width="40" height="50" rx="5" fill="#1e293b" />
                  <rect x="10" y="50" width="30" height="40" fill="#92400e" />
                  <path d="M25 20 L15 10 L35 10 Z" fill="#1e293b" />
                  <circle cx="25" cy="25" r="8" fill="#fbbf24" />
                </g>
                {/* Graduation cap person 2 (center) */}
                <g transform="translate(70, 40)">
                  <circle cx="30" cy="30" r="22" fill="#1e293b" />
                  <rect x="8" y="52" width="44" height="55" rx="5" fill="#1e293b" />
                  <rect x="12" y="56" width="36" height="45" fill="#92400e" />
                  <path d="M30 25 L18 10 L42 10 Z" fill="#1e293b" />
                  <circle cx="30" cy="30" r="9" fill="#fbbf24" />
                  <path d="M20 50 L30 35 L40 50" stroke="#fbbf24" strokeWidth="2" fill="none" />
                </g>
                {/* Graduation cap person 3 */}
                <g transform="translate(130, 60)">
                  <circle cx="25" cy="25" r="20" fill="#1e293b" />
                  <rect x="5" y="45" width="40" height="50" rx="5" fill="#1e293b" />
                  <rect x="10" y="50" width="30" height="40" fill="#dc2626" />
                  <path d="M25 20 L15 10 L35 10 Z" fill="#1e293b" />
                  <rect x="15" y="70" width="20" height="25" rx="2" fill="#fbbf24" />
                </g>
                {/* Confetti dots */}
                <circle cx="50" cy="30" r="3" fill="#f97316" />
                <circle cx="150" cy="40" r="3" fill="#f97316" />
                <circle cx="80" cy="20" r="3" fill="#f97316" />
                <circle cx="120" cy="25" r="3" fill="#f97316" />
              </svg>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800"
            >
              Generate weekly report
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(metric => (
            <div
              key={metric.label}
              className={`relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br ${metric.accent} p-[1px]`}
            >
              <div className="relative h-full rounded-[1.05rem] bg-white/90 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{metric.value}</p>
                <p className="mt-2 text-xs font-medium text-slate-500">{metric.trend}</p>
                {/* Decorative icon */}
                <div className="absolute bottom-4 right-4 opacity-10">
                  {metric.label === 'Active courses' && (
                    <svg className="w-16 h-16 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                  {metric.label === 'Assignments due' && (
                    <svg className="w-16 h-16 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {metric.label === 'Avg. grade' && (
                    <svg className="w-16 h-16 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  )}
                  {metric.label === 'Learning streak' && (
                    <svg className="w-16 h-16 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900">Action timeline</h2>
            <ol className="mt-4 space-y-4">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-600"
                  >
                    <span
                      className={`mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                        item.status === 'urgent'
                          ? 'bg-rose-500'
                          : item.status === 'upcoming'
                          ? 'bg-amber-400'
                          : 'bg-sky-400'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.due}</p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500">No upcoming assignments</li>
              )}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Momentum status</p>
            <p className="mt-3 text-sm text-slate-600">
              You've maintained a healthy learning cadence across all modules. Keep revisiting your weaker concepts.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-500 hover:text-indigo-400"
            >
              View detailed analytics <span aria-hidden>→</span>
            </button>
          </div>

          {/* Achievement Card with Image */}
          <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-6 shadow-xl shadow-indigo-500/20 overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">Achievement</p>
              <p className="mt-3 text-lg font-semibold text-white">Celebrate Your Progress!</p>
              <p className="mt-2 text-sm text-white/90">
                You're on track to success. Keep up the excellent work and stay motivated!
              </p>
            </div>
            {/* Decorative graduation illustration */}
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <g transform="translate(50, 50)">
                  <circle cx="50" cy="50" r="30" fill="#ffffff" />
                  <rect x="30" y="80" width="40" height="60" rx="5" fill="#ffffff" />
                  <rect x="35" y="85" width="30" height="50" fill="#fbbf24" />
                  <path d="M50 45 L35 25 L65 25 Z" fill="#ffffff" />
                  <circle cx="50" cy="50" r="12" fill="#fbbf24" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardOverview;
