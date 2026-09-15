/**
 * Auth Types
 * Core authentication and user types for the TrustLens AI Admin Web Application
 */

export type UserRole = 'admin' | 'manufacturer' | 'supplier' | 'retailer';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface RegisterUserRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface RegisterUserResponse {
  user: User;
}

export interface ChangePasswordRequest {
  username: string;
  currentPassword: string;
  newPassword: string;
}

export interface AuthContextType {
  auth: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}