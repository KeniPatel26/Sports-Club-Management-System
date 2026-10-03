import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';
import DashboardLayout from '../components/layout/DashboardLayout';

// Public & General Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import CourtsBookingPage from '../pages/CourtsBookingPage';
import BookingHistoryPage from '../pages/BookingHistoryPage';
import ProShopPage from '../pages/ProShopPage';
import CanteenBarPage from '../pages/CanteenBarPage';
import MembershipsPage from '../pages/MembershipsPage';
import StaffOperationsPage from '../pages/StaffOperationsPage';
import OwnerAnalyticsPage from '../pages/OwnerAnalyticsPage';
import LeadsCrmPage from '../pages/LeadsCrmPage';
import ProjectsPage from '../pages/ProjectsPage';
import ItemDetail from '../pages/ItemDetail';
import FormTemplate from '../pages/FormTemplate';
import AiAssistant from '../pages/AiAssistant';
import UsersManagement from '../pages/UsersManagement';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

// Manager Dedicated Module Pages
import ManagerDashboard from '../pages/manager/Dashboard';
import Members from '../pages/manager/members/Members';
import Memberships from '../pages/manager/memberships/Memberships';
import Employees from '../pages/manager/employees/Employees';
import Courts from '../pages/manager/courts/Courts';
import ShopManagement from '../pages/manager/shop/Products';
import CanteenManagement from '../pages/manager/canteen/Menu';
import FinanceManagement from '../pages/manager/finance/Finance';
import Reports from '../pages/manager/reports/Reports';
import LeadsManagement from '../pages/manager/leads/Leads';
import Settings from '../pages/manager/settings/Settings';

// Staff Department Dedicated Portals
import FrontDeskDashboard from '../pages/staff/frontdesk/FrontDeskDashboard';
import ShopStaffDashboard from '../pages/staff/shop/ShopStaffDashboard';
import CanteenStaffDashboard from '../pages/staff/canteen/CanteenStaffDashboard';
import StaffProfileAttendance from '../pages/staff/common/StaffProfileAttendance';

// Protected Route Guard
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullPage text="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin-Only Role Guard
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isOwner, isAdmin, isManager, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullPage text="Checking owner/manager permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isOwner && !isAdmin && !isManager) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main Shared Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courts"
        element={
          <ProtectedRoute>
            <CourtsBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-history"
        element={
          <ProtectedRoute>
            <BookingHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop"
        element={
          <ProtectedRoute>
            <ProShopPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/canteen"
        element={
          <ProtectedRoute>
            <CanteenBarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/memberships"
        element={
          <ProtectedRoute>
            <MembershipsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff-roster"
        element={
          <ProtectedRoute>
            <StaffOperationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <LeadsCrmPage />
          </ProtectedRoute>
        }
      />

      {/* ==================================================== */}
      {/* STAFF DEDICATED DEPARTMENT PORTALS                   */}
      {/* ==================================================== */}
      <Route
        path="/staff/front-desk"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FrontDeskDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/shop"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ShopStaffDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/canteen"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CanteenStaffDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <StaffProfileAttendance />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ==================================================== */}
      {/* MANAGER DEDICATED ERP ROUTES (ALL 12 MODULES)         */}
      {/* ==================================================== */}
      <Route
        path="/manager/dashboard"
        element={
          <AdminRoute>
            <DashboardLayout>
              <ManagerDashboard />
            </DashboardLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/manager/members"
        element={
          <AdminRoute>
            <DashboardLayout>
              <Members />
            </DashboardLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/manager/memberships"
        element={
          <AdminRoute>
            <DashboardLayout>
              <Memberships />
            </DashboardLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/manager/employees"
        element={
          <AdminRoute>
            <DashboardLayout>
              <Employees />
            </DashboardLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/manager/courts"
        element={
          <AdminRoute>
            <DashboardLayout>
              <Courts />
            </DashboardLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/manager/shop"
        element={
          <AdminRoute>
            <DashboardLayout>
              <ShopManagement />
            </DashboardLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/manager/settings"
        element={
          <AdminRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </AdminRoute>
        }
      />

      {/* Extended Starter & Tool Hubs */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ItemDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/template/form"
        element={
          <ProtectedRoute>
            <FormTemplate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-hub"
        element={
          <ProtectedRoute>
            <AiAssistant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <AdminRoute>
            <UsersManagement />
          </AdminRoute>
        }
      />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
