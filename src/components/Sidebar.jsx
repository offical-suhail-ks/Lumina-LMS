import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';

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

const userCreationLinks = [
  { to: '/admin/students', label: 'Students', description: 'Provision and edit accounts' },
  { to: '/admin/faculty', label: 'Faculty', description: 'Create and manage faculty users' },
  { to: '/admin/accounting', label: 'Accounting Team', description: 'Create and manage accounting users' },
];

const adminLinks = [
  { to: '/admin/review-applications', label: 'Review Applications', description: 'Review and approve student applications' },
  { to: '/admin/attendance', label: 'View Attendance', description: 'View all student attendance records' },
  { to: '/admin/courses', label: 'Course builder', description: 'Design and refine programmes' },
  { to: '/admin/assignments', label: 'Assignments studio', description: 'Briefs, due dates, submissions' },
];

const accountingFeeLinks = [
  { to: '/accounting/tasks', label: 'View Forwarded Tasks', description: 'View and manage tasks forwarded from admin' },
  { to: '/accounting/tasks?status=pending', label: 'Pending Tasks', description: 'Tasks awaiting fee setup' },
  { to: '/accounting/tasks?status=in_progress', label: 'In Progress', description: 'Tasks currently being processed' },
];

const accountingLinks = [
  { to: '/accounting/fees', label: 'Fee Management', description: 'View and manage all student fees' },
  { to: '/accounting/salaries', label: 'Salaries', description: 'Manage employee salaries' },
];

const facultyLinks = [
  { to: '/faculty/my-courses', label: 'My Courses', description: 'View your assigned courses' },
  { to: '/faculty/grade-submissions', label: 'Grade Submissions', description: 'Review and grade assignments' },
  { to: '/faculty/attendance', label: 'Take Attendance', description: 'Mark student attendance' },
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
  const location = useLocation();
  const [isUserCreationOpen, setIsUserCreationOpen] = useState(() => {
    // Check if current path is one of the user creation links
    return userCreationLinks.some(link => location.pathname === link.to);
  });
  const [isFeeManagementOpen, setIsFeeManagementOpen] = useState(() => {
    // Check if current path is one of the fee management links
    return accountingFeeLinks.some(link => {
      const path = link.to.split('?')[0]; // Remove query params for comparison
      return location.pathname === path || location.pathname.startsWith(path);
    });
  });
  const [openAll, setOpenAll] = useState(false);

  // Auto-open dropdown when on a user creation page
  useEffect(() => {
    if (role === 'admin' && userCreationLinks.some(link => location.pathname === link.to)) {
      setIsUserCreationOpen(true);
    }
    if (role === 'accounting') {
      const isOnFeePage = accountingFeeLinks.some(link => {
        const path = link.to.split('?')[0];
        return location.pathname === path || location.pathname.startsWith(path);
      });
      if (isOnFeePage) {
        setIsFeeManagementOpen(true);
      }
    }
  }, [location.pathname, role]);

  // When "open all" is enabled, keep all sections open
  useEffect(() => {
    if (openAll) {
      if (role === 'admin') {
        setIsUserCreationOpen(true);
      }
      if (role === 'accounting') {
        setIsFeeManagementOpen(true);
      }
    } else {
      if (role === 'admin') {
        // When disabling "open all", check if we're on a user creation page
        const isOnUserCreationPage = userCreationLinks.some(link => location.pathname === link.to);
        if (!isOnUserCreationPage) {
          setIsUserCreationOpen(false);
        }
      }
      if (role === 'accounting') {
        // When disabling "open all", check if we're on a fee management page
        const isOnFeePage = accountingFeeLinks.some(link => {
          const path = link.to.split('?')[0];
          return location.pathname === path || location.pathname.startsWith(path);
        });
        if (!isOnFeePage) {
          setIsFeeManagementOpen(false);
        }
      }
    }
  }, [openAll, role, location.pathname]);

  const links = useMemo(() => {
    if (role === 'admin') {
      return [...baseLinks, { type: 'divider' }, ...adminLinks];
    }
    if (role === 'accounting') {
      return [...baseLinks, { type: 'divider' }, ...accountingLinks];
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
          <div className="flex-1">
            <p className="text-lg font-semibold text-white">Lumina LMS</p>
            <p className="text-xs text-white/60">Learning intelligence, simplified</p>
          </div>
          {(role === 'admin' || role === 'accounting') && (
            <button
              type="button"
              onClick={() => {
                setOpenAll(!openAll);
                if (!openAll) {
                  if (role === 'admin') {
                    setIsUserCreationOpen(true);
                  }
                  if (role === 'accounting') {
                    setIsFeeManagementOpen(true);
                  }
                }
              }}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
              title={openAll ? 'Collapse all sections' : 'Expand all sections'}
            >
              {openAll ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-3">
          {links.map(link =>
            link.type === 'divider' ? (
              <div key={`${role}-divider`} className="pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  {role === 'admin' ? 'Admin Console' : 
                   role === 'accounting' ? 'Accounting Tools' :
                   role === 'faculty' ? 'Faculty Tools' : 
                   role === 'student' ? 'Student Tools' : ''}
                </p>
                {role === 'accounting' && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!openAll) {
                          setIsFeeManagementOpen(!isFeeManagementOpen);
                        }
                      }}
                      disabled={openAll}
                      className={`group w-full rounded-2xl border border-transparent px-4 py-3 transition-all duration-200 ${
                        (isFeeManagementOpen || openAll || accountingFeeLinks.some(l => {
                          const path = l.to.split('?')[0];
                          return location.pathname === path || location.pathname.startsWith(path);
                        }))
                          ? 'border-white/20 bg-white/10 shadow-lg shadow-indigo-500/10'
                          : 'hover:border-white/10 hover:bg-white/5 hover:shadow-md hover:shadow-indigo-500/5'
                      } ${openAll ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white">Fee Management</p>
                          <p className="text-xs text-white/60">View and manage forwarded tasks</p>
                        </div>
                        <svg
                          className={`h-4 w-4 text-white/60 transition-transform ${(isFeeManagementOpen || openAll) ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {(isFeeManagementOpen || openAll) && (
                      <div className="mt-2 ml-4 space-y-2 border-l-2 border-white/10 pl-4">
                        {accountingFeeLinks.map(feeLink => (
                          <NavLink
                            key={feeLink.to}
                            to={feeLink.to}
                            className={({ isActive }) =>
                              [
                                'group block rounded-xl border border-transparent px-3 py-2 transition-all duration-200',
                                isActive
                                  ? 'border-white/20 bg-white/10 shadow-md shadow-indigo-500/10'
                                  : 'hover:border-white/10 hover:bg-white/5',
                              ].join(' ')
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <p className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>
                                  {feeLink.label}
                                </p>
                                <p className="text-xs text-white/50">{feeLink.description}</p>
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {role === 'admin' && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!openAll) {
                          setIsUserCreationOpen(!isUserCreationOpen);
                        }
                      }}
                      disabled={openAll}
                      className={`group w-full rounded-2xl border border-transparent px-4 py-3 transition-all duration-200 ${
                        (isUserCreationOpen || openAll || userCreationLinks.some(l => location.pathname === l.to))
                          ? 'border-white/20 bg-white/10 shadow-lg shadow-indigo-500/10'
                          : 'hover:border-white/10 hover:bg-white/5 hover:shadow-md hover:shadow-indigo-500/5'
                      } ${openAll ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white">User Creation</p>
                          <p className="text-xs text-white/60">Manage users and accounts</p>
                        </div>
                        <svg
                          className={`h-4 w-4 text-white/60 transition-transform ${(isUserCreationOpen || openAll) ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {(isUserCreationOpen || openAll) && (
                      <div className="mt-2 ml-4 space-y-2 border-l-2 border-white/10 pl-4">
                        {userCreationLinks.map(userLink => (
                          <NavLink
                            key={userLink.to}
                            to={userLink.to}
                            className={({ isActive }) =>
                              [
                                'group block rounded-xl border border-transparent px-3 py-2 transition-all duration-200',
                                isActive
                                  ? 'border-white/20 bg-white/10 shadow-md shadow-indigo-500/10'
                                  : 'hover:border-white/10 hover:bg-white/5',
                              ].join(' ')
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <p className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>
                                  {userLink.label}
                                </p>
                                <p className="text-xs text-white/50">{userLink.description}</p>
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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

