import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  DashboardIcon, CoursesIcon, AssignmentsIcon, QuizIcon, ForumIcon, VideoIcon,
  AnalyticsIcon, CertificateIcon, AchievementIcon, CalendarIcon, MailIcon, ProfileIcon,
  BuilderIcon, DocumentIcon, UploadIcon, UsersIcon, TeacherIcon, MoneyIcon,
} from './Icons';

const OnboardingTour = ({ isOpen, onClose }) => {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const getAllFeatures = () => {
    return [
      // STUDENT FEATURES
      {
        title: 'Student Dashboard',
        description: 'Track your courses, assignments, grades, and learning progress in one place.',
        icon: DashboardIcon,
        path: '/dashboard',
        role: 'student',
        preview: {
          type: 'dashboard',
          content: {
            stats: [
              { label: 'Active Courses', value: '5', color: 'indigo' },
              { label: 'Assignments', value: '12', color: 'blue' },
              { label: 'Quizzes', value: '8', color: 'purple' },
              { label: 'Messages', value: '3', color: 'green' },
            ],
            upcoming: [
              { title: 'Math Assignment', due: 'Tomorrow', course: 'Mathematics' },
              { title: 'Science Quiz', due: 'In 2 days', course: 'Science' },
            ],
          },
        },
      },
      {
        title: 'Student Courses',
        description: 'Access all your enrolled courses, view modules, track progress, and download resources.',
        icon: CoursesIcon,
        path: '/courses',
        role: 'student',
        preview: {
          type: 'courses',
          content: {
            courses: [
              { name: 'Mathematics 101', progress: 75, instructor: 'Dr. Smith' },
              { name: 'Computer Science', progress: 60, instructor: 'Prof. Johnson' },
              { name: 'English Literature', progress: 90, instructor: 'Ms. Williams' },
            ],
          },
        },
      },
      {
        title: 'Student Assignments',
        description: 'Submit assignments, view feedback, and track your submission history.',
        icon: AssignmentsIcon,
        path: '/assignments',
        role: 'student',
        preview: {
          type: 'assignments',
          content: {
            items: [
              { title: 'Project Report', status: 'Submitted', grade: 'A', due: 'Completed' },
              { title: 'Research Paper', status: 'Pending', grade: '-', due: '2 days left' },
            ],
          },
        },
      },
      {
        title: 'Student Certificates',
        description: 'View and download your earned certificates and achievements.',
        icon: CertificateIcon,
        path: '/certificates',
        role: 'student',
        preview: {
          type: 'certificates',
          content: {
            certificates: [
              { title: 'Course Completion', date: '2024-01-15', verified: true },
              { title: 'Excellence Award', date: '2024-02-20', verified: true },
            ],
          },
        },
      },
      {
        title: 'Student Achievements',
        description: 'Track your badges, achievements, and learning milestones.',
        icon: AchievementIcon,
        path: '/achievements',
        role: 'student',
        preview: {
          type: 'achievements',
          content: {
            achievements: [
              { name: 'Perfect Score', icon: '⭐', earned: '2024-01-10' },
              { name: 'Early Bird', icon: '🏆', earned: '2024-02-05' },
            ],
          },
        },
      },
      // FACULTY FEATURES
      {
        title: 'Faculty Dashboard',
        description: 'Manage your courses, view student progress, grade submissions, and track attendance.',
        icon: DashboardIcon,
        path: '/dashboard',
        role: 'faculty',
        preview: {
          type: 'dashboard',
          content: {
            stats: [
              { label: 'My Courses', value: '8', color: 'indigo' },
              { label: 'Pending Grades', value: '24', color: 'orange' },
              { label: 'Students', value: '156', color: 'blue' },
              { label: 'Announcements', value: '5', color: 'green' },
            ],
            upcoming: [
              { title: 'Grade Math Quiz', due: 'Today', course: 'Mathematics' },
              { title: 'Take Attendance', due: 'Tomorrow', course: 'Science' },
            ],
          },
        },
      },
      {
        title: 'Faculty Course Builder',
        description: 'Create and manage courses, upload materials, organize modules, and set up course structure.',
        icon: BuilderIcon,
        path: '/admin/courses',
        role: 'faculty',
        preview: {
          type: 'courses',
          content: {
            courses: [
              { name: 'Advanced Mathematics', progress: 100, instructor: 'You' },
              { name: 'Data Science 101', progress: 85, instructor: 'You' },
              { name: 'Web Development', progress: 100, instructor: 'You' },
            ],
          },
        },
      },
      {
        title: 'Faculty Grade Submissions',
        description: 'Review and grade student assignments, provide feedback, and track grading progress.',
        icon: DocumentIcon,
        path: '/faculty/grade-submissions',
        role: 'faculty',
        preview: {
          type: 'assignments',
          content: {
            items: [
              { title: 'Project Report - John', status: 'Graded', grade: 'A+', due: 'Graded' },
              { title: 'Research Paper - Sarah', status: 'Pending', grade: '-', due: 'Needs Review' },
            ],
          },
        },
      },
      {
        title: 'Faculty Quiz Manager',
        description: 'Create quizzes with AI-powered question generation, manage exam settings, and view results.',
        icon: QuizIcon,
        path: '/admin/quizzes',
        role: 'faculty',
        preview: {
          type: 'quizzes',
          content: {
            quizzes: [
              { title: 'Math Midterm', score: '156 students', status: 'Active' },
              { title: 'Science Quiz 2', score: '89 students', status: 'Completed' },
            ],
          },
        },
      },
      {
        title: 'Faculty Video Upload',
        description: 'Upload course videos, lectures, and multimedia content organized by course and module.',
        icon: UploadIcon,
        path: '/videos/upload',
        role: 'faculty',
        preview: {
          type: 'videos',
          content: {
            videos: [
              { title: 'Introduction to Calculus', duration: '45 min', watched: true },
              { title: 'Data Structures Basics', duration: '30 min', watched: false },
            ],
          },
        },
      },
      {
        title: 'Faculty Attendance',
        description: 'Take and manage student attendance, view attendance reports, and track student presence.',
        icon: AnalyticsIcon,
        path: '/faculty/attendance',
        role: 'faculty',
        preview: {
          type: 'analytics',
          content: {
            metrics: [
              { label: 'Present Today', value: '142', trend: 'up' },
              { label: 'Absent', value: '14', trend: 'down' },
              { label: 'Total Students', value: '156', trend: 'up' },
            ],
          },
        },
      },
      // ADMIN FEATURES
      {
        title: 'Admin Dashboard',
        description: 'System-wide overview, manage users, courses, monitor analytics, and control platform settings.',
        icon: DashboardIcon,
        path: '/dashboard',
        role: 'admin',
        preview: {
          type: 'dashboard',
          content: {
            stats: [
              { label: 'Total Students', value: '1,245', color: 'indigo' },
              { label: 'Total Courses', value: '48', color: 'blue' },
              { label: 'Active Faculty', value: '32', color: 'purple' },
              { label: 'System Health', value: '98%', color: 'green' },
            ],
            upcoming: [
              { title: 'Review Applications', due: 'Today', course: 'System' },
              { title: 'System Backup', due: 'Tomorrow', course: 'Maintenance' },
            ],
          },
        },
      },
      {
        title: 'Admin User Management',
        description: 'Manage students, faculty, and accounting team members. Add, edit, and control user access.',
        icon: UsersIcon,
        path: '/admin/students',
        role: 'admin',
        preview: {
          type: 'courses',
          content: {
            courses: [
              { name: 'Total Students', progress: 1245, instructor: 'Active' },
              { name: 'Faculty Members', progress: 32, instructor: 'Active' },
              { name: 'Accounting Team', progress: 8, instructor: 'Active' },
            ],
          },
        },
      },
      {
        title: 'Admin Course Management',
        description: 'Create and manage all courses, assign faculty, set up course structure, and control enrollment.',
        icon: BuilderIcon,
        path: '/admin/courses',
        role: 'admin',
        preview: {
          type: 'courses',
          content: {
            courses: [
              { name: 'Mathematics Department', progress: 100, instructor: '12 Courses' },
              { name: 'Science Department', progress: 95, instructor: '15 Courses' },
              { name: 'Arts Department', progress: 100, instructor: '21 Courses' },
            ],
          },
        },
      },
      {
        title: 'Admin System Analytics',
        description: 'View comprehensive system analytics, performance metrics, and platform-wide insights.',
        icon: AnalyticsIcon,
        path: '/admin/analytics',
        role: 'admin',
        preview: {
          type: 'analytics',
          content: {
            metrics: [
              { label: 'Platform Usage', value: '94%', trend: 'up' },
              { label: 'Course Completion', value: '87%', trend: 'up' },
              { label: 'User Satisfaction', value: '92%', trend: 'up' },
            ],
          },
        },
      },
      {
        title: 'Admin Review Applications',
        description: 'Review and approve student applications, manage enrollments, and process admissions.',
        icon: DocumentIcon,
        path: '/admin/review-applications',
        role: 'admin',
        preview: {
          type: 'assignments',
          content: {
            items: [
              { title: 'New Application - John Doe', status: 'Pending', grade: 'Review', due: '2 days ago' },
              { title: 'Application - Jane Smith', status: 'Approved', grade: '✓', due: 'Completed' },
            ],
          },
        },
      },
      {
        title: 'Admin Activity Logs',
        description: 'Monitor all system activities, track user actions, and maintain security audit logs.',
        icon: AnalyticsIcon,
        path: '/admin/activity-logs',
        role: 'admin',
        preview: {
          type: 'forum',
          content: {
            threads: [
              { title: 'User Login - Admin', replies: '2 min ago', author: 'System' },
              { title: 'Course Created - Math 101', replies: '1 hour ago', author: 'Admin' },
            ],
          },
        },
      },
      // ACCOUNTING FEATURES
      {
        title: 'Accounting Dashboard',
        description: 'Manage fees, salaries, financial transactions, and track all accounting operations.',
        icon: DashboardIcon,
        path: '/dashboard',
        role: 'accounting',
        preview: {
          type: 'dashboard',
          content: {
            stats: [
              { label: 'Pending Fees', value: '$24K', color: 'orange' },
              { label: 'Paid Fees', value: '$185K', color: 'green' },
              { label: 'Salaries Due', value: '$52K', color: 'blue' },
              { label: 'Total Revenue', value: '$209K', color: 'indigo' },
            ],
            upcoming: [
              { title: 'Process Salaries', due: 'Today', course: 'Payroll' },
              { title: 'Fee Collection', due: 'Tomorrow', course: 'Fees' },
            ],
          },
        },
      },
      {
        title: 'Accounting Fee Management',
        description: 'Manage student fees, process payments, generate invoices, and track fee collections.',
        icon: MoneyIcon,
        path: '/accounting/fees',
        role: 'accounting',
        preview: {
          type: 'assignments',
          content: {
            items: [
              { title: 'Fee Payment - Student 001', status: 'Paid', grade: '$2,500', due: 'Completed' },
              { title: 'Fee Payment - Student 002', status: 'Pending', grade: '$2,500', due: 'Due Soon' },
            ],
          },
        },
      },
      {
        title: 'Accounting Salary Management',
        description: 'Process faculty and staff salaries, manage payroll, and track salary payments.',
        icon: MoneyIcon,
        path: '/accounting/salaries',
        role: 'accounting',
        preview: {
          type: 'assignments',
          content: {
            items: [
              { title: 'Salary - Dr. Smith', status: 'Processed', grade: '$8,500', due: 'Paid' },
              { title: 'Salary - Prof. Johnson', status: 'Pending', grade: '$7,500', due: 'Due' },
            ],
          },
        },
      },
      // SHARED FEATURES
      {
        title: 'Quizzes & Exams',
        description: 'Take quizzes with AI-powered question generation, view results, and track performance.',
        icon: QuizIcon,
        path: '/quizzes',
        role: 'shared',
        preview: {
          type: 'quizzes',
          content: {
            quizzes: [
              { title: 'Math Quiz 1', score: 95, status: 'Completed' },
              { title: 'Science Test', score: '-', status: 'Available' },
            ],
          },
        },
      },
      {
        title: 'Discussion Forum',
        description: 'Engage in course discussions, ask questions, and collaborate with peers and instructors.',
        icon: ForumIcon,
        path: '/forum',
        role: 'shared',
        preview: {
          type: 'forum',
          content: {
            threads: [
              { title: 'Question about Assignment', replies: 5, author: 'John Doe' },
              { title: 'Course Material Discussion', replies: 12, author: 'Jane Smith' },
            ],
          },
        },
      },
      {
        title: 'Video Library',
        description: 'Access course videos, lectures, and multimedia content organized by course and module.',
        icon: VideoIcon,
        path: '/videos',
        role: 'shared',
        preview: {
          type: 'videos',
          content: {
            videos: [
              { title: 'Introduction to Calculus', duration: '45 min', watched: true },
              { title: 'Data Structures Basics', duration: '30 min', watched: false },
            ],
          },
        },
      },
      {
        title: 'Analytics',
        description: 'View detailed performance analytics, grades, and learning insights.',
        icon: AnalyticsIcon,
        path: '/analytics',
        role: 'shared',
        preview: {
          type: 'analytics',
          content: {
            metrics: [
              { label: 'Assignment Avg', value: '87%', trend: 'up' },
              { label: 'Quiz Avg', value: '92%', trend: 'up' },
              { label: 'Overall', value: '89%', trend: 'up' },
            ],
          },
        },
      },
      {
        title: 'Calendar',
        description: 'Stay organized with events, deadlines, and important dates.',
        icon: CalendarIcon,
        path: '/calendar',
        role: 'shared',
        preview: {
          type: 'dashboard',
          content: {
            stats: [
              { label: 'Today Events', value: '3', color: 'indigo' },
              { label: 'This Week', value: '12', color: 'blue' },
              { label: 'Upcoming', value: '8', color: 'purple' },
            ],
            upcoming: [
              { title: 'Faculty Meeting', due: 'Today 2 PM', course: 'Meeting' },
              { title: 'Course Deadline', due: 'Tomorrow', course: 'Assignment' },
            ],
          },
        },
      },
      {
        title: 'Mailbox',
        description: 'Communicate with instructors, receive announcements, and manage messages.',
        icon: MailIcon,
        path: '/mailbox',
        role: 'shared',
        preview: {
          type: 'forum',
          content: {
            threads: [
              { title: 'Welcome Message', replies: 'Unread', author: 'Admin' },
              { title: 'Course Announcement', replies: 'Read', author: 'Faculty' },
            ],
          },
        },
      },
    ];
  };

  const features = getAllFeatures();
  const totalSteps = features.length;
  const currentFeature = features[currentStep];
  const FeatureIcon = currentFeature.icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExplore = () => {
    navigate(currentFeature.path);
    onClose();
  };

  const renderPreview = () => {
    const { preview } = currentFeature;
    if (!preview) return null;

    switch (preview.type) {
      case 'dashboard':
        return (
          <div className="bg-white rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {preview.content.stats.map((stat, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-black">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">Upcoming</p>
              {preview.content.upcoming.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-xs font-medium text-black">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.course}</p>
                  </div>
                  <span className="text-xs text-gray-600">{item.due}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'courses':
        return (
          <div className="bg-white rounded-lg p-4 space-y-3">
            {preview.content.courses.map((course, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-black">{course.name}</p>
                  <span className="text-xs text-gray-500">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${Math.min(course.progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{course.instructor}</p>
              </div>
            ))}
          </div>
        );

      case 'assignments':
        return (
          <div className="bg-white rounded-lg p-4 space-y-3">
            {preview.content.items.map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-black">{item.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.status === 'Submitted' || item.status === 'Graded' || item.status === 'Paid' || item.status === 'Processed' || item.status === 'Approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{item.grade}</span>
                  <span>{item.due}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'quizzes':
        return (
          <div className="bg-white rounded-lg p-4 space-y-3">
            {preview.content.quizzes.map((quiz, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-black">{quiz.title}</p>
                  {quiz.score !== '-' && (
                    <span className="text-sm font-bold text-indigo-600">{quiz.score}</span>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  quiz.status === 'Completed' || quiz.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {quiz.status}
                </span>
              </div>
            ))}
          </div>
        );

      case 'forum':
        return (
          <div className="bg-white rounded-lg p-4 space-y-3">
            {preview.content.threads.map((thread, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-black mb-1">{thread.title}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>By {thread.author}</span>
                  <span>{thread.replies}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'videos':
        return (
          <div className="bg-white rounded-lg p-4 space-y-3">
            {preview.content.videos.map((video, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-10 bg-gray-300 rounded flex items-center justify-center">
                    <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-black">{video.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{video.duration}</span>
                      {video.watched && (
                        <span className="text-xs text-green-600">✓ Watched</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'analytics':
        return (
          <div className="bg-white rounded-lg p-4">
            <div className="grid grid-cols-3 gap-3">
              {preview.content.metrics.map((metric, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
                  <p className="text-xl font-bold text-black">{metric.value}</p>
                  <div className="flex items-center justify-center mt-1">
                    <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certificates':
        return (
          <div className="bg-white rounded-lg p-4 space-y-3">
            {preview.content.certificates.map((cert, idx) => (
              <div key={idx} className="border-2 border-indigo-200 rounded-lg p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-black">{cert.title}</p>
                  {cert.verified && (
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-gray-600">Issued: {cert.date}</p>
              </div>
            ))}
          </div>
        );

      case 'achievements':
        return (
          <div className="bg-white rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              {preview.content.achievements.map((achievement, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <p className="text-xs font-semibold text-black">{achievement.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Earned: {achievement.earned}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-700';
      case 'faculty': return 'bg-purple-100 text-purple-700';
      case 'admin': return 'bg-red-100 text-red-700';
      case 'accounting': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Tablet Frame */}
      <div className="relative w-full max-w-5xl">
        {/* Tablet Bezel */}
        <div className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
          {/* Tablet Screen */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-inner">
            {/* Status Bar */}
            <div className="bg-gray-50 px-6 py-2 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
              <div className="text-xs font-medium text-gray-700">Lumina LMS</div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.076 13.308-5.076 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[600px]">
              {/* Left Sidebar Preview */}
              <div className="w-64 bg-slate-950/80 border-r border-white/10 p-4">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                    <div>
                      <p className="text-xs font-semibold text-white">Lumina LMS</p>
                    </div>
                  </div>
                </div>
                <nav className="space-y-1">
                  {features.slice(0, 5).map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          idx === currentStep ? 'bg-white/10 text-white' : 'text-white/70'
                        }`}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span className="text-xs">{feature.title.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Main Preview Area */}
              <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    {FeatureIcon && (
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <FeatureIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-black">{currentFeature.title}</h2>
                        {currentFeature.role && (
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${getRoleBadgeColor(currentFeature.role)}`}>
                            {currentFeature.role.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{currentFeature.description}</p>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 min-h-[300px]">
                  {renderPreview()}
                </div>

                {/* Feature Info */}
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-sm text-gray-700">
                    <strong className="text-indigo-900">Live Preview:</strong> This is how the {currentFeature.title} feature looks in the actual application.
                    {currentFeature.role && ` Available for ${currentFeature.role} role.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {features.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStep(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentStep
                          ? 'bg-indigo-600 w-6'
                          : idx < currentStep
                          ? 'bg-indigo-300'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    onClick={handleExplore}
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    Explore
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OnboardingTour;
