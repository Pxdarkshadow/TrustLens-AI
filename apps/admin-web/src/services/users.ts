import api from '@services/api';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type { User, UserRole, RegisterUserRequest } from '../types/auth';

// Response types for user operations
export interface UserCreateResponse {
  success: boolean;
  data?: User;
  message?: string;
}

export interface UserUpdateResponse {
  success: boolean;
  data?: User;
  message?: string;
}

export interface UserDeleteResponse {
  success: boolean;
  message?: string;
}

export const usersApi = {
  // Get all users (admin only)
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user (admin only) - backend returns { success: true, data: User } or { success: false, message: string }
  create: async (data: RegisterUserRequest): Promise<ApiResponse<UserCreateResponse>> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Update user (admin only)
  update: async (id: string, data: Partial<RegisterUserRequest>): Promise<ApiResponse<UserUpdateResponse>> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (admin only)
  delete: async (id: string): Promise<ApiResponse<UserDeleteResponse>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Change user role (admin only)
  changeRole: async (id: string, role: UserRole): Promise<ApiResponse<UserUpdateResponse>> => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },
};

export default usersApi;