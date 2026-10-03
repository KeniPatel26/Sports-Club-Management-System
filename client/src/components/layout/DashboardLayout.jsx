import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Navbar />
        <main className="page-content-area animate-fade-in">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
