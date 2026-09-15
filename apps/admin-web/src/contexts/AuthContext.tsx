import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { AuthState, User, UserRole, LoginCredentials, AuthTokens, AuthContextType, ChangePasswordRequest } from '../types/auth';
import api, { tokenService } from '@services/api';
import type { ApiResponse } from '../types/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (tokenService.hasTokens()) {
          // Try to get user profile to validate tokens
          const response = await api.get<ApiResponse<User>>('/auth/me');
          if (response.data.success && response.data.data) {
            setAuth({
              user: response.data.data,
              tokens: {
                accessToken: tokenService.getAccessToken()!,
                refreshToken: tokenService.getRefreshToken()!,
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            tokenService.clearTokens();
          }
        } else {
          setAuth((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        tokenService.clearTokens();
        setAuth((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuth((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', credentials);

      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        tokenService.setTokens(tokens);
        setAuth({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError.response?.data?.message || 'Login failed. Please try again.';
      setAuth((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    tokenService.clearTokens();
    setAuth({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken });

      if (response.data.success && response.data.data) {
        const newAccessToken = response.data.data.accessToken;
        const currentRefreshToken = tokenService.getRefreshToken()!;
        tokenService.setTokens({ accessToken: newAccessToken, refreshToken: currentRefreshToken });
        setAuth((prev) => ({
          ...prev,
          tokens: { accessToken: newAccessToken, refreshToken: currentRefreshToken },
        }));
      }
    } catch (error) {
      logout();
      throw error;
    }
  }, [logout]);

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    setAuth((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.post<ApiResponse<void>>('/auth/change-password', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to change password');
      }
      setAuth((prev) => ({ ...prev, isLoading: false }));
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError.response?.data?.message || 'Failed to change password';
      setAuth((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!auth.user) return false;
    return roles.includes(auth.user.role);
  }, [auth.user]);

  const value: AuthContextType = {
    auth,
    login,
    logout,
    refreshToken,
    changePassword,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};