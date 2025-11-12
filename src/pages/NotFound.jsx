import React from 'react';
import AuthLayout from '../layouts/AuthLayout';

const NotFound = () => (
  <AuthLayout>
    <h2 className="text-3xl font-bold mb-2">404 - Not Found</h2>
    <p>The page you requested does not exist.</p>
  </AuthLayout>
);

export default NotFound;
