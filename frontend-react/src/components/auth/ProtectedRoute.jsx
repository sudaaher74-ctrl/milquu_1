import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const location = useLocation();

  // Get users from localStorage based on role requested
  // We check different storage keys since currently auth might be split
  let user = null;
  
  if (allowedRole === 'admin') {
    const adminData = localStorage.getItem('adminToken');
    if (adminData) {
      user = { role: 'admin' };
    }
  } else if (allowedRole === 'delivery') {
    const deliveryData = localStorage.getItem('deliveryStaff');
    if (deliveryData) {
      const parsedData = JSON.parse(deliveryData);
      user = { ...parsedData, role: 'delivery' };
    }
  }

  // If no user found, redirect to respective login
  if (!user) {
    if (allowedRole === 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (allowedRole === 'delivery') {
      return <Navigate to="/delivery/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user found but wrong role, redirect to home
  if (user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
