import api from '@services/api';
import type { ApiResponse } from '../types/api';
import type { Profile, CreateProfileRequest, UpdateProfileRequest, ProfileImageUploadResponse } from '../types/profile';

// Response types for profile operations
export interface ProfileCreateResponse {
  success: boolean;
  data?: Profile;
  message?: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  data?: Profile;
  message?: string;
}

export interface ProfileImageUploadApiResponse {
  success: boolean;
  data?: ProfileImageUploadResponse;
  message?: string;
}

export const profilesApi = {
  // Get current user's profile
  getMe: async (): Promise<ApiResponse<Profile>> => {
    const response = await api.get('/profiles/me');
    return response.data;
  },

  // Get profile by username
  getByUsername: async (username: string): Promise<ApiResponse<Profile>> => {
    const response = await api.get(`/profiles/${username}`);
    return response.data;
  },

  // Get all profiles (admin only)
  getAll: async (): Promise<ApiResponse<Profile[]>> => {
    const response = await api.get('/profiles');
    return response.data;
  },

  // Create profile (admin only)
  create: async (data: CreateProfileRequest): Promise<ApiResponse<ProfileCreateResponse>> => {
    const response = await api.post('/profiles', data);
    return response.data;
  },

  // Update current user's profile
  updateMe: async (data: UpdateProfileRequest): Promise<ApiResponse<ProfileUpdateResponse>> => {
    const response = await api.patch('/profiles/me', data);
    return response.data;
  },

  // Upload profile image
  uploadImage: async (file: File): Promise<ApiResponse<ProfileImageUploadApiResponse>> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/profiles/me/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get profile image URL
  getImageUrl: (filename: string): string => {
    return `${api.defaults.baseURL}/profiles/image/${filename}`;
  },
};

export default profilesApi;