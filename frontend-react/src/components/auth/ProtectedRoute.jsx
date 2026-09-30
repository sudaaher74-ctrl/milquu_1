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
    if (deliveryData && deliveryData !== 'undefined') {
      try {
        const parsedData = JSON.parse(deliveryData);
        if (parsedData.token) {
          user = { role: 'delivery' };
        }
      } catch (e) {
        console.error(e);
        localStorage.removeItem('deliveryStaff');
      }
    }
  } else if (allowedRole === 'chatbot') {
    const chatbotData = localStorage.getItem('chatbotToken');
    const adminData = localStorage.getItem('adminToken');
    const authData = chatbotData || adminData;
    if (authData && authData !== 'undefined') {
      try {
        const parsedData = typeof authData === 'string' ? JSON.parse(authData) : authData;
        if (parsedData && (parsedData.token || typeof parsedData === 'string')) {
          user = { role: 'chatbot' };
        }
      } catch (e) {
        // If it is a raw JWT string (not JSON)
        if (typeof authData === 'string' && authData.length > 20) {
          user = { role: 'chatbot' };
        } else {
          console.error('Invalid chatbot auth data', e);
          localStorage.removeItem('chatbotToken');
        }
      }
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
    if (allowedRole === 'chatbot') {
      return <Navigate to="/chatbot/login" state={{ from: location }} replace />;
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
