import { useAuth as useAuthContext } from '@contexts/AuthContext';
import { useCallback } from 'react';
import type { UserRole } from '../types/auth';

export const useAuth = () => {
  const { auth, login, logout, refreshToken, changePassword, hasRole } = useAuthContext();

  const isLoading = auth.isLoading;
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  const error = auth.error;

  const checkAuth = useCallback(() => isAuthenticated, [isAuthenticated]);

  const checkRole = useCallback(
    (roles: UserRole[]) => hasRole(roles),
    [hasRole]
  );

  const isAdmin = useCallback(() => hasRole(['admin']), [hasRole]);
  const isManufacturer = useCallback(() => hasRole(['manufacturer']), [hasRole]);
  const isSupplier = useCallback(() => hasRole(['supplier']), [hasRole]);
  const isRetailer = useCallback(() => hasRole(['retailer']), [hasRole]);
  const isBusinessUser = useCallback(
    () => hasRole(['manufacturer', 'supplier', 'retailer']),
    [hasRole]
  );

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    error,
    // Actions
    login,
    logout,
    refreshToken,
    changePassword,
    // Role checks
    hasRole: checkRole,
    isAdmin,
    isManufacturer,
    isSupplier,
    isRetailer,
    isBusinessUser,
    checkAuth,
  };
};

export default useAuth;