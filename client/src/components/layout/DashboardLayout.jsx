import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Navbar onToggleSidebar={() => setMobileOpen(!mobileOpen)} />
        <main className="page-content-area animate-fade-in">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
