import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const RequireRider: React.FC = () => {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('rider_token') : null;

  if (!token) {
    return <Navigate to="/rider/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireRider;



