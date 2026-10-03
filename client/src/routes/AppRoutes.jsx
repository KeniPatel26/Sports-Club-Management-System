import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import CourtsBookingPage from '../pages/CourtsBookingPage';
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
  const { isAuthenticated, isOwner, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullPage text="Checking owner permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isOwner && !isAdmin) {
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

      {/* Core Sports Club Management Pages */}
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

      {/* Owner Financial Analytics Hub */}
      <Route
        path="/finance-analytics"
        element={
          <AdminRoute>
            <OwnerAnalyticsPage />
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

      {/* Admin / Owner User Directory */}
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
