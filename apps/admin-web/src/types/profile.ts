/**
 * Profile Types
 * User profile types for the TrustLens AI Admin Web Application
 */

export interface Profile {
  id: string;
  userId: string;
  username: string;
  name: string;
  description: string;
  website: string;
  location: string;
  imageUrl?: string;
  role: 'admin' | 'manufacturer' | 'supplier' | 'retailer';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileRequest {
  username: string;
  name: string;
  description: string;
  website: string;
  location: string;
  role: 'admin' | 'manufacturer' | 'supplier' | 'retailer';
  image?: File;
}

export interface UpdateProfileRequest {
  name?: string;
  description?: string;
  website?: string;
  location?: string;
  image?: File;
}

export interface ProfileFormData {
  name: string;
  description: string;
  website: string;
  location: string;
  image?: File;
}

export interface ProfileImageUploadResponse {
  imageUrl: string;
  filename: string;
}