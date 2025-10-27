import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth';

export const StaffGuard = () => {
  const { user } = useAuth();

  if (!user?.is_staff) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};
