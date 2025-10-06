import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export const StaffGuard = () => {
  const { user } = useAuth();

  if (!user?.is_staff) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
