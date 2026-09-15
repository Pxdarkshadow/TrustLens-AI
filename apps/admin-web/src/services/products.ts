import api from '@services/api';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type { Product, CreateProductRequest, UpdateProductRequest, AddSupplyChainEventRequest, ProductVerificationResult, GenerateQRCodeResponse, ProductListParams, ProductImage } from '../types/product';

export const productsApi = {
  // Get all products with pagination and filters
  getAll: async (params?: ProductListParams): Promise<ApiResponse<PaginatedResponse<Product>>> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get product by serial number
  getBySerialNumber: async (serialNumber: string): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/products/${serialNumber}`);
    return response.data;
  },

  // Create product (manufacturer only)
  create: async (data: CreateProductRequest): Promise<ApiResponse<Product>> => {
    const formData = new FormData();
    formData.append('serialNumber', data.serialNumber);
    formData.append('name', data.name);
    formData.append('brand', data.brand);
    formData.append('description', data.description);
    formData.append('manufacturerName', data.manufacturerName);
    formData.append('manufacturerLocation', data.manufacturerLocation);
    formData.append('manufactureDate', data.manufactureDate);
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product (manufacturer only)
  update: async (serialNumber: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.brand) formData.append('brand', data.brand);
    if (data.description) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);

    const response = await api.patch(`/products/${serialNumber}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Add supply chain event (supplier/retailer)
  addSupplyChainEvent: async (serialNumber: string, data: AddSupplyChainEventRequest): Promise<ApiResponse<Product>> => {
    const response = await api.post(`/products/${serialNumber}/history`, data);
    return response.data;
  },

  // Get product provenance/history
  getHistory: async (serialNumber: string): Promise<ApiResponse<Product['supplyChainHistory']>> => {
    const response = await api.get(`/products/${serialNumber}/history`);
    return response.data;
  },

  // Verify product (consumer)
  verify: async (serialNumber: string): Promise<ApiResponse<ProductVerificationResult>> => {
    const response = await api.post(`/products/${serialNumber}/verify`);
    return response.data;
  },

  // Generate QR code
  generateQR: async (serialNumber: string): Promise<ApiResponse<GenerateQRCodeResponse>> => {
    const response = await api.post(`/products/${serialNumber}/qr`);
    return response.data;
  },

  // Get product image URL
  getImageUrl: (filename: string): string => {
    return `${api.defaults.baseURL}/products/image/${filename}`;
  },

  // Download QR code image
  downloadQR: async (serialNumber: string): Promise<Blob> => {
    const response = await api.get(`/products/${serialNumber}/qr/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Upload product image
  uploadImage: async (serialNumber: string, file: File): Promise<ApiResponse<ProductImage>> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post(`/products/${serialNumber}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product image
  deleteImage: async (serialNumber: string, imageId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/products/${serialNumber}/images/${imageId}`);
    return response.data;
  },

  // Revoke/deactivate product
  revoke: async (serialNumber: string): Promise<ApiResponse<Product>> => {
    const response = await api.post(`/products/${serialNumber}/revoke`);
    return response.data;
  },

  // Activate product
  activate: async (serialNumber: string): Promise<ApiResponse<Product>> => {
    const response = await api.post(`/products/${serialNumber}/activate`);
    return response.data;
  },
};

export default productsApi;