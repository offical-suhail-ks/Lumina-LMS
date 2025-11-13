import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleTheme } from '../store/themeSlice';
import OnboardingTourButton from './OnboardingTourButton';
import {
  DashboardIcon, CoursesIcon, AssignmentsIcon, QuizIcon, ForumIcon, VideoIcon,
  AnalyticsIcon, CertificateIcon, AchievementIcon, CalendarIcon, MailIcon, ProfileIcon,
  BuilderIcon, DocumentIcon, UploadIcon, PlusIcon, CheckIcon, UsersIcon, TeacherIcon,
  MoneyIcon, EditIcon, SendIcon, ScrollIcon, SettingsIcon, ClipboardIcon, DollarIcon,
  LearningIcon, CommunicationIcon, ToolsIcon, ManagementIcon,
} from './Icons';

// Priority 1: Core Navigation (Always visible)
const coreLinks = [
  { to: '/dashboard', label: 'Overview', Icon: DashboardIcon, priority: 1 },
  { to: '/courses', label: 'Courses', Icon: CoursesIcon, priority: 1 },
  { to: '/assignments', label: 'Assignments', Icon: AssignmentsIcon, priority: 1 },
];

// Priority 2: Learning Tools (Collapsible)
const learningTools = [
  { to: '/quizzes', label: 'Quizzes & Exams', Icon: QuizIcon, priority: 2 },
  { to: '/forum', label: 'Discussion Forum', Icon: ForumIcon, priority: 2 },
  { to: '/videos', label: 'Video Library', Icon: VideoIcon, priority: 2 },
  { to: '/analytics', label: 'Analytics', Icon: AnalyticsIcon, priority: 2 },
];

// Priority 3: Achievements & Certificates (Collapsible)
const achievementsLinks = [
  { to: '/certificates', label: 'Certificates', Icon: CertificateIcon, priority: 3 },
  { to: '/achievements', label: 'Achievements', Icon: AchievementIcon, priority: 3 },
];

// Priority 4: Communication (Collapsible)
const communicationLinks = [
  { to: '/calendar', label: 'Calendar', Icon: CalendarIcon, priority: 4 },
  { to: '/mailbox', label: 'Mailbox', Icon: MailIcon, priority: 4 },
];

// Priority 5: Settings
const settingsLinks = [
  { to: '/profile', label: 'Profile', Icon: ProfileIcon, priority: 5 },
];

// Admin/Faculty specific links
const adminTools = [
  { to: '/admin/courses', label: 'Course Builder', Icon: BuilderIcon, priority: 2 },
  { to: '/admin/assignments', label: 'Assignments Studio', Icon: DocumentIcon, priority: 2 },
  { to: '/admin/quizzes', label: 'Quiz Manager', Icon: QuizIcon, priority: 2 },
  { to: '/videos/upload', label: 'Upload Videos', Icon: UploadIcon, priority: 2 },
  { to: '/forum/create', label: 'Create Forum', Icon: PlusIcon, priority: 2 },
  { to: '/quizzes/create', label: 'Create Quiz', Icon: PlusIcon, priority: 2 },
  { to: '/certificates/create', label: 'Create Certificate', Icon: CertificateIcon, priority: 3 },
];

const adminManagement = [
  { to: '/admin/review-applications', label: 'Review Applications', Icon: CheckIcon, priority: 3 },
  { to: '/admin/attendance', label: 'View Attendance', Icon: AnalyticsIcon, priority: 3 },
  { to: '/admin/analytics', label: 'System Analytics', Icon: AnalyticsIcon, priority: 3 },
  { to: '/admin/activity-logs', label: 'Activity Logs', Icon: ClipboardIcon, priority: 3 },
  { to: '/admin/feature-flags', label: 'Feature Management', Icon: SettingsIcon, priority: 3 },
];

const userManagement = [
  { to: '/admin/students', label: 'Students', Icon: UsersIcon, priority: 4 },
  { to: '/admin/faculty', label: 'Faculty', Icon: TeacherIcon, priority: 4 },
  { to: '/admin/accounting', label: 'Accounting Team', Icon: MoneyIcon, priority: 4 },
];

const facultyTools = [
  { to: '/faculty/my-courses', label: 'My Courses', Icon: CoursesIcon, priority: 2 },
  { to: '/faculty/grade-submissions', label: 'Grade Submissions', Icon: EditIcon, priority: 2 },
  { to: '/faculty/quizzes', label: 'Manage Quizzes', Icon: QuizIcon, priority: 2 },
  { to: '/videos/upload', label: 'Upload Videos', Icon: UploadIcon, priority: 2 },
  { to: '/forum/create', label: 'Create Forum', Icon: PlusIcon, priority: 2 },
  { to: '/quizzes/create', label: 'Create Quiz', Icon: PlusIcon, priority: 2 },
  { to: '/certificates/create', label: 'Create Certificate', Icon: CertificateIcon, priority: 3 },
  { to: '/faculty/attendance', label: 'Take Attendance', Icon: AnalyticsIcon, priority: 3 },
  { to: '/faculty/student-roster', label: 'Student Roster', Icon: UsersIcon, priority: 3 },
  { to: '/faculty/create-assignment', label: 'Create Assignment', Icon: DocumentIcon, priority: 3 },
];

const studentTools = [
  { to: '/students/view-grades', label: 'My Grades', Icon: AnalyticsIcon, priority: 3 },
  { to: '/students/my-submissions', label: 'My Submissions', Icon: SendIcon, priority: 3 },
  { to: '/students/transcript', label: 'Transcript', Icon: ScrollIcon, priority: 3 },
  { to: '/students/course-progress', label: 'Course Progress', Icon: AnalyticsIcon, priority: 3 },
  { to: '/students/study-schedule', label: 'Study Schedule', Icon: CalendarIcon, priority: 4 },
  { to: '/students/resources', label: 'Resources', Icon: CoursesIcon, priority: 4 },
  { to: '/fees', label: 'Fees', Icon: MoneyIcon, priority: 4 },
];

const accountingTools = [
  { to: '/accounting/fees', label: 'Fee Management', Icon: MoneyIcon, priority: 2 },
  { to: '/accounting/salaries', label: 'Salaries', Icon: DollarIcon, priority: 2 },
  { to: '/accounting/tasks', label: 'View Tasks', Icon: ClipboardIcon, priority: 2 },
];

const Sidebar = ({ onLaunchTour }) => {
  const dispatch = useDispatch();
  const role = useSelector(state => state.auth.user?.role);
  const theme = useSelector(state => state.theme.mode);
  const location = useLocation();
  
  const [openSections, setOpenSections] = useState({
    learning: true,
    achievements: false,
    communication: false,
    adminTools: false,
    adminManagement: false,
    userManagement: false,
    facultyTools: false,
    studentTools: false,
    accountingTools: false,
  });

  useEffect(() => {
    // Initialize theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const CollapsibleSection = ({ title, items, sectionKey, Icon }) => {
    const isOpen = openSections[sectionKey];
    const hasActiveItem = items.some(item => location.pathname === item.to || location.pathname.startsWith(item.to));

    return (
      <div className="mb-2">
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
            hasActiveItem || isOpen
              ? 'bg-white/10 border border-white/20'
              : 'hover:bg-white/5 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-white" />}
            <span className="text-sm font-semibold text-white">{title}</span>
          </div>
          <svg
            className={`h-4 w-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="mt-2 ml-4 space-y-1 border-l-2 border-white/10 pl-4">
            {items.map(item => {
              const ItemIcon = item.Icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm transition ${
                      isActive
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {ItemIcon && <ItemIcon className="h-4 w-4 mr-2" />}
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderLinks = () => {
    const links = [];

    // Core links (always visible)
    coreLinks.forEach(link => {
      const LinkIcon = link.Icon;
      links.push(
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-xl mb-2 transition ${
              isActive
                ? 'bg-white/10 border border-white/20 text-white'
                : 'hover:bg-white/5 border border-transparent text-white/80'
            }`
          }
        >
          {LinkIcon && <LinkIcon className="h-5 w-5 mr-2" />}
          <span className="text-sm font-semibold">{link.label}</span>
        </NavLink>
      );
    });

    // Learning Tools (collapsible)
    if (role === 'student' || role === 'admin' || role === 'faculty') {
      links.push(
        <CollapsibleSection
          key="learning"
          title="Learning Tools"
          items={learningTools}
          sectionKey="learning"
          Icon={LearningIcon}
        />
      );
    }

    // Role-specific tools
    if (role === 'admin') {
      links.push(
        <CollapsibleSection
          key="adminTools"
          title="Content Management"
          items={adminTools}
          sectionKey="adminTools"
          Icon={ToolsIcon}
        />
      );
      links.push(
        <CollapsibleSection
          key="adminManagement"
          title="Administration"
          items={adminManagement}
          sectionKey="adminManagement"
          Icon={ManagementIcon}
        />
      );
      links.push(
        <CollapsibleSection
          key="userManagement"
          title="User Management"
          items={userManagement}
          sectionKey="userManagement"
          Icon={UsersIcon}
        />
      );
    }

    if (role === 'faculty') {
      links.push(
        <CollapsibleSection
          key="facultyTools"
          title="Faculty Tools"
          items={facultyTools}
          sectionKey="facultyTools"
          Icon={TeacherIcon}
        />
      );
    }

    if (role === 'student') {
      links.push(
        <CollapsibleSection
          key="achievements"
          title="Achievements"
          items={achievementsLinks}
          sectionKey="achievements"
          Icon={AchievementIcon}
        />
      );
      links.push(
        <CollapsibleSection
          key="studentTools"
          title="Student Tools"
          items={studentTools}
          sectionKey="studentTools"
          Icon={CoursesIcon}
        />
      );
    }

    if (role === 'accounting') {
      links.push(
        <CollapsibleSection
          key="accountingTools"
          title="Accounting Tools"
          items={accountingTools}
          sectionKey="accountingTools"
          Icon={MoneyIcon}
        />
      );
    }

    // Communication (collapsible)
    links.push(
      <CollapsibleSection
        key="communication"
        title="Communication"
        items={communicationLinks}
        sectionKey="communication"
        Icon={CommunicationIcon}
      />
    );

    // Settings (always visible)
    settingsLinks.forEach(link => {
      const LinkIcon = link.Icon;
      links.push(
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-xl mb-2 transition ${
              isActive
                ? 'bg-white/10 border border-white/20 text-white'
                : 'hover:bg-white/5 border border-transparent text-white/80'
            }`
          }
        >
          {LinkIcon && <LinkIcon className="h-5 w-5 mr-2" />}
          <span className="text-sm font-semibold">{link.label}</span>
        </NavLink>
      );
    });

    return links;
  };

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
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-white transition hover:bg-white/20"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {renderLinks()}
        </nav>

        <OnboardingTourButton onLaunchTour={onLaunchTour} />
      </div>
    </aside>
  );
};

export default Sidebar;
