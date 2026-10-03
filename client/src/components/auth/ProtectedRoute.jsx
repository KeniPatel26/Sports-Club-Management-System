import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, openAuthModal } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--navy)',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
        }}
      >
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    openAuthModal('login');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
