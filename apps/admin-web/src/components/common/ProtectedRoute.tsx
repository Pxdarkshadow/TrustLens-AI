import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Loader } from '@components/ui';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();

  if (isLoading) {
    return <Loader message="Verifying permissions..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(allowedRoles)) {
    // Redirect to appropriate dashboard based on user's role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'manufacturer') {
      return <Navigate to="/manufacturer" replace />;
    } else if (user?.role === 'supplier') {
      return <Navigate to="/supplier" replace />;
    } else if (user?.role === 'retailer') {
      return <Navigate to="/retailer" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message="Checking authentication..." fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const RoleBasedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated || !hasRole(allowedRoles)) {
    return null;
  }

  return children ? <>{children}</> : <Outlet />;
};