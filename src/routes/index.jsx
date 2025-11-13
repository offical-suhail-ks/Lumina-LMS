import React, { useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import { login as loginAction } from '../store/authSlice';
import { login as loginApi } from '../services/authService';

// Auth
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import NotFound from '../pages/NotFound';

// Dashboards
import DashboardOverview from '../pages/dashboard/DashboardOverview';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import FacultyDashboard from '../pages/dashboard/FacultyDashboard';
import ParentDashboard from '../pages/dashboard/ParentDashboard';
import AccountingDashboard from '../pages/dashboard/AccountingDashboard';
import ManageStudents from '../pages/admin/ManageStudents';
import ManageFaculty from '../pages/admin/ManageFaculty';
import ManageCourses from '../pages/admin/ManageCourses';
import ManageAssignments from '../pages/admin/ManageAssignments';
import ManageFees from '../pages/admin/ManageFees';

// Features
import CourseList from '../pages/courses/CourseList';
import CourseDetails from '../pages/courses/CourseDetails';
import AssignmentList from '../pages/assignments/AssignmentList';
import SubmitAssignment from '../pages/assignments/SubmitAssignment';
import CalendarView from '../pages/calendar/CalendarView';
import Inbox from '../pages/mailbox/Inbox';
import SendMail from '../pages/mailbox/SendMail';
import ViewFees from '../pages/fees/ViewFees';
import PayFees from '../pages/fees/PayFees';
import StudentProfile from '../pages/profile/StudentProfile';
import ParentProfile from '../pages/profile/ParentProfile';
import FacultyProfile from '../pages/profile/FacultyProfile';
import GradeSubmissions from '../pages/faculty/GradeSubmissions';
import MyCourses from '../pages/faculty/MyCourses';
import StudentRoster from '../pages/faculty/StudentRoster';
import CreateAssignment from '../pages/faculty/CreateAssignment';
import ViewGrades from '../pages/students/ViewGrades';
import MySubmissions from '../pages/students/MySubmissions';
import AcademicTranscript from '../pages/students/AcademicTranscript';
import CourseProgress from '../pages/students/CourseProgress';
import StudySchedule from '../pages/students/StudySchedule';
import ResourcesLibrary from '../pages/students/ResourcesLibrary';
import CourseModules from '../pages/students/CourseModules';
import ManageModules from '../pages/faculty/ManageModules';
import AccountingTasks from '../pages/accounting/AccountingTasks';
import AccountingSalaries from '../pages/accounting/AccountingSalaries';
import ManageAccounting from '../pages/admin/ManageAccounting';
import ReviewApplications from '../pages/admin/ReviewApplications';
import ViewAttendance from '../pages/admin/ViewAttendance';
import ActivityLogs from '../pages/admin/ActivityLogs';
import ManageFeatureFlags from '../pages/admin/ManageFeatureFlags';
import TakeAttendance from '../pages/faculty/TakeAttendance';
import QuizList from '../pages/quizzes/QuizList';
import QuizDetail from '../pages/quizzes/QuizDetail';
import ForumList from '../pages/forum/ForumList';
import AnalyticsDashboard from '../pages/analytics/AnalyticsDashboard';
import CertificateList from '../pages/certificates/CertificateList';
import VideoLibrary from '../pages/videos/VideoLibrary';
import UploadVideo from '../pages/videos/UploadVideo';
import AchievementList from '../pages/achievements/AchievementList';
import CreateForum from '../pages/forum/CreateForum';
import CreateQuiz from '../pages/quizzes/CreateQuiz';
import CreateCertificate from '../pages/certificates/CreateCertificate';

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const dashboardElement = useMemo(() => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'faculty':
        return <FacultyDashboard />;
      case 'parent':
        return <ParentDashboard />;
      case 'accounting':
        return <AccountingDashboard />;
      default:
        return <DashboardOverview />;
    }
  }, [user?.role]);

  const handleLogin = async credentials => {
    try {
      const response = await loginApi(credentials.username, credentials.password);
          dispatch(
            loginAction({
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              role: response.user.role,
              department: response.user.department || null,
              token: response.token,
            })
          );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={dashboardElement} />
        <Route path="courses" element={<CourseList />} />
        <Route path="courses/:id" element={<CourseDetails />} />
        <Route path="assignments" element={<AssignmentList />} />
        <Route path="assignments/submit" element={<SubmitAssignment />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="mailbox" element={<Inbox />} />
        <Route path="mailbox/send" element={<SendMail />} />
        <Route path="fees" element={<ViewFees />} />
        <Route path="fees/pay" element={<PayFees />} />
        <Route path="profile" element={user?.role === 'faculty' ? <FacultyProfile /> : user?.role === 'parent' ? <ParentProfile /> : <StudentProfile />} />
        <Route path="profile/parent" element={<ParentProfile />} />
        <Route path="profile/faculty" element={<FacultyProfile />} />
        <Route
          path="faculty/grade-submissions"
          element={user?.role === 'faculty' ? <GradeSubmissions /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="faculty/my-courses"
          element={user?.role === 'faculty' ? <MyCourses /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="faculty/student-roster"
          element={user?.role === 'faculty' ? <StudentRoster /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="faculty/create-assignment"
          element={user?.role === 'faculty' ? <CreateAssignment /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="students/view-grades"
          element={user?.role === 'student' ? <ViewGrades /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="students/my-submissions"
          element={user?.role === 'student' ? <MySubmissions /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="students/transcript"
          element={user?.role === 'student' ? <AcademicTranscript /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="students/course-progress"
          element={user?.role === 'student' ? <CourseProgress /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="students/study-schedule"
          element={user?.role === 'student' ? <StudySchedule /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="students/resources"
          element={user?.role === 'student' ? <ResourcesLibrary /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="students/course-modules/:courseId"
          element={user?.role === 'student' ? <CourseModules /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="faculty/manage-modules/:courseId"
          element={user?.role === 'faculty' ? <ManageModules /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="admin/students"
          element={user?.role === 'admin' ? <ManageStudents /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="admin/faculty"
          element={user?.role === 'admin' ? <ManageFaculty /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="admin/courses"
          element={user?.role === 'admin' ? <ManageCourses /> : <Navigate to="/dashboard" replace />}
        />
            <Route
              path="admin/assignments"
              element={user?.role === 'admin' ? <ManageAssignments /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="admin/fees"
              element={user?.role === 'admin' ? <ManageFees /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="admin/accounting"
              element={user?.role === 'admin' ? <ManageAccounting /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="admin/review-applications"
              element={user?.role === 'admin' ? <ReviewApplications /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="admin/attendance"
              element={user?.role === 'admin' ? <ViewAttendance /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="admin/activity-logs"
              element={user?.role === 'admin' ? <ActivityLogs /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="admin/feature-flags"
              element={user?.role === 'admin' ? <ManageFeatureFlags /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="faculty/attendance"
              element={user?.role === 'faculty' ? <TakeAttendance /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="accounting/tasks"
              element={user?.role === 'accounting' ? <AccountingTasks /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="accounting/salaries"
              element={user?.role === 'accounting' ? <AccountingSalaries /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="accounting/fees"
              element={user?.role === 'accounting' ? <ManageFees /> : <Navigate to="/dashboard" replace />}
            />
            <Route path="quizzes" element={<QuizList />} />
            <Route path="quizzes/:id" element={<QuizDetail />} />
            <Route path="forum" element={<ForumList />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="certificates" element={<CertificateList />} />
            <Route path="videos" element={<VideoLibrary />} />
            <Route
              path="videos/upload"
              element={(user?.role === 'admin' || user?.role === 'faculty') ? <UploadVideo /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="achievements"
              element={user?.role === 'student' ? <AchievementList /> : <Navigate to="/dashboard" replace />}
            />
            <Route path="forum/create" element={<CreateForum />} />
            <Route
              path="quizzes/create"
              element={(user?.role === 'admin' || user?.role === 'faculty') ? <CreateQuiz /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="certificates/create"
              element={(user?.role === 'admin' || user?.role === 'faculty') ? <CreateCertificate /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="admin/quizzes"
              element={user?.role === 'admin' ? <QuizList /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="admin/analytics"
              element={user?.role === 'admin' ? <AnalyticsDashboard /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="faculty/quizzes"
              element={user?.role === 'faculty' ? <QuizList /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="faculty/forum"
              element={user?.role === 'faculty' ? <ForumList /> : <Navigate to="/dashboard" replace />}
            />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
