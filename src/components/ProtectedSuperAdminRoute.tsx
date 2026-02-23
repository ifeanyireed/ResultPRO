import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedSuperAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedSuperAdminRoute: React.FC<ProtectedSuperAdminRouteProps> = ({ children }) => {
  const userJson = localStorage.getItem('user');
  const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');

  // Check if user is logged in
  if (!token || !userJson) {
    return <Navigate to="/auth/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);

    // Check if user is a super admin
    if (user.role !== 'SUPER_ADMIN') {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    // Invalid user data
    return <Navigate to="/auth/login" replace />;
  }
};

export default ProtectedSuperAdminRoute;
