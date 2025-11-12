import React from 'react';

const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-100 flex flex-col">
    {children}
  </div>
);

export default MainLayout;
