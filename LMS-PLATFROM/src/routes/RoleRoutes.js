import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Dashboards
import StudentDashboard from '../pages/dashboard/StudentDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import FacultyDashboard from '../pages/dashboard/FacultyDashboard';
import ParentDashboard from '../pages/dashboard/ParentDashboard';

const RoleRoutes = ({ role }) => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          role === 'admin' ? (
            <AdminDashboard />
          ) : role === 'faculty' ? (
            <FacultyDashboard />
          ) : role === 'parent' ? (
            <ParentDashboard />
          ) : (
            <StudentDashboard />
          )
        }
      />
    </Routes>
  );
};

export default RoleRoutes;
