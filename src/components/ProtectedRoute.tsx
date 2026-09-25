import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Agar token nahi hai to foran /login par bhej do aur current location save rakho
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Token maujood hai to dashboard access karne do
  return children;
};

export default ProtectedRoute;