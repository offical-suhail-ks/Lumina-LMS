import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

const baseLinks = [
  { to: '/dashboard', label: 'Overview', description: 'Live metrics and focus areas' },
  { to: '/courses', label: 'Courses', description: 'Content, progress and grades' },
  { to: '/assignments', label: 'Assignments', description: 'Deliverables and feedback' },
  { to: '/calendar', label: 'Calendar', description: 'Events and milestones' },
  { to: '/mailbox', label: 'Mailbox', description: 'Messages and announcements' },
  { to: '/profile', label: 'Profile', description: 'Personal preferences' },
];

const studentBaseLinks = [
  { to: '/dashboard', label: 'Overview', description: 'Live metrics and focus areas' },
  { to: '/courses', label: 'Courses', description: 'Content, progress and grades' },
  { to: '/assignments', label: 'Assignments', description: 'Deliverables and feedback' },
  { to: '/calendar', label: 'Calendar', description: 'Events and milestones' },
  { to: '/mailbox', label: 'Mailbox', description: 'Messages and announcements' },
  { to: '/fees', label: 'Fees', description: 'Payment and fee management' },
  { to: '/profile', label: 'Profile', description: 'Personal preferences' },
];

const adminLinks = [
  { to: '/admin/students', label: 'Students', description: 'Provision and edit accounts' },
  { to: '/admin/faculty', label: 'Faculty', description: 'Create and manage faculty users' },
  { to: '/admin/courses', label: 'Course builder', description: 'Design and refine programmes' },
  { to: '/admin/assignments', label: 'Assignments studio', description: 'Briefs, due dates, submissions' },
  { to: '/admin/fees', label: 'Fee Management', description: 'View and manage student fees' },
];

const facultyLinks = [
  { to: '/faculty/my-courses', label: 'My Courses', description: 'View your assigned courses' },
  { to: '/faculty/grade-submissions', label: 'Grade Submissions', description: 'Review and grade assignments' },
  { to: '/faculty/student-roster', label: 'Student Roster', description: 'View enrolled students' },
  { to: '/faculty/create-assignment', label: 'Create Assignment', description: 'Add new assignments' },
];

const studentLinks = [
  { to: '/students/view-grades', label: 'My Grades', description: 'View grades and feedback' },
  { to: '/students/my-submissions', label: 'My Submissions', description: 'Track assignment submissions' },
  { to: '/students/transcript', label: 'Transcript', description: 'Academic transcript' },
  { to: '/students/course-progress', label: 'Course Progress', description: 'Track course completion' },
  { to: '/students/study-schedule', label: 'Study Schedule', description: 'Weekly schedule planner' },
  { to: '/students/resources', label: 'Resources', description: 'Course materials library' },
];

const Sidebar = () => {
  const role = useSelector(state => state.auth.user?.role);

  const links = useMemo(() => {
    if (role === 'admin') {
      return [...baseLinks, { type: 'divider' }, ...adminLinks];
    }
    if (role === 'faculty') {
      return [...baseLinks, { type: 'divider' }, ...facultyLinks];
    }
    if (role === 'student') {
      return [...studentBaseLinks, { type: 'divider' }, ...studentLinks];
    }
    return baseLinks;
  }, [role]);

  return (
    <aside className="hidden w-80 flex-shrink-0 border-r border-white/10 bg-slate-950/80 px-6 py-8 backdrop-blur-2xl lg:flex">
      <div className="flex h-full w-full flex-col">
        <div className="mb-10 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold tracking-tight text-white">
            L
          </span>
          <div>
            <p className="text-lg font-semibold text-white">Lumina LMS</p>
            <p className="text-xs text-white/60">Learning intelligence, simplified</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {links.map(link =>
            link.type === 'divider' ? (
              <div key={`${role}-divider`} className="pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  {role === 'admin' ? 'Admin Console' : 
                   role === 'faculty' ? 'Faculty Tools' : 
                   role === 'student' ? 'Student Tools' : ''}
                </p>
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    'group block rounded-2xl border border-transparent px-4 py-3 transition-all duration-200',
                    isActive
                      ? 'border-white/20 bg-white/10 shadow-lg shadow-indigo-500/10'
                      : 'hover:border-white/10 hover:bg-white/5 hover:shadow-md hover:shadow-indigo-500/5',
                  ].join(' ')
                }
              >
                <p className="text-sm font-semibold text-white">{link.label}</p>
                <p className="text-xs text-white/60">{link.description}</p>
              </NavLink>
            )
          )}
        </nav>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
          <p className="mb-2 text-sm font-semibold text-white">Need a tour?</p>
          <p className="text-xs text-white/60">
            Explore interactive walkthroughs tailored for your role and get the best out of Lumina LMS.
          </p>
          <button
            type="button"
            onClick={() => {
              // Launch onboarding tour
              alert('Welcome to Lumina LMS!\n\nThis interactive tour will guide you through:\n- Dashboard overview\n- Course management\n- Assignment submissions\n- Calendar and events\n- Profile settings\n\nLet\'s get started!');
              // In a real app, this would trigger a tour library like react-joyride or intro.js
            }}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-white/15 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/25"
          >
            Launch onboarding
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

