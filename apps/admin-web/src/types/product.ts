/**
 * Product Types
 * Core product and supply chain types for the TrustLens AI Admin Web Application
 */

export interface ProductImage {
  id: string;
  productSerialNumber: string;
  filename: string;
  url: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface SupplyChainEvent {
  id: string;
  productSerialNumber: string;
  actor: string;
  role: 'manufacturer' | 'supplier' | 'retailer';
  location: string;
  timestamp: string;
  isSold: boolean;
  transactionHash?: string;
  blockNumber?: number;
  createdAt: string;
}

export interface Product {
  serialNumber: string;
  name: string;
  brand: string;
  description: string;
  manufacturerName: string;
  manufacturerLocation: string;
  manufactureDate: string;
  status: 'active' | 'inactive' | 'revoked' | 'sold';
  images: ProductImage[];
  primaryImage?: ProductImage;
  supplyChainHistory: SupplyChainEvent[];
  createdAt: string;
  updatedAt: string;
  blockchainTxHash?: string;
  blockchainBlockNumber?: number;
}

export interface CreateProductRequest {
  serialNumber: string;
  name: string;
  brand: string;
  description: string;
  manufacturerName: string;
  manufacturerLocation: string;
  manufactureDate: string; // ISO string
  image?: File;
}

export interface UpdateProductRequest {
  name?: string;
  brand?: string;
  description?: string;
  image?: File;
}

export interface AddSupplyChainEventRequest {
  actor: string;
  role: 'supplier' | 'retailer';
  location: string;
  timestamp: string; // ISO string
  isSold: boolean;
}

export interface ProductVerificationResult {
  isAuthentic: boolean;
  product?: Product;
  message: string;
  verificationId: string;
  verifiedAt: string;
}

export interface QRCodeData {
  productId: string;
  verificationUrl: string;
  timestamp: string;
}

export interface GenerateQRCodeResponse {
  qrCodeData: QRCodeData;
  qrCodeImageUrl: string;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: Product['status'];
  manufacturerId?: string;
  sortBy?: 'createdAt' | 'name' | 'serialNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  search: string;
  status: Product['status'] | 'all';
  dateFrom?: string;
  dateTo?: string;
}