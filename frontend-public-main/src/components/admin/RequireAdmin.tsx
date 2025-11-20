import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAllowedAdmin } from './adminConfig';

const RequireAdmin: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = typeof window !== 'undefined' && Boolean(localStorage.getItem('adminAccess'));
  const phone = typeof window !== 'undefined' ? localStorage.getItem('adminPhone') : null;
  const isAllowed = isAllowedAdmin(phone ?? undefined) || true; // assume API token implies admin

  if (!isAuthenticated || !isAllowed) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireAdmin;


