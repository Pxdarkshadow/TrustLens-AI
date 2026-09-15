import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Layout } from '@components/layout';
import { ProtectedRoute, PublicRoute } from '@components/common/ProtectedRoute';
import { Loader } from '@components/ui';
import { Box, Container, Typography, Button } from '@mui/material';
import { useAuth } from '@hooks/useAuth';
import { Suspense } from 'react';

// Public pages
import { LoginPage } from '@pages/public/Login';
import { ScannerPage } from '@pages/public/Scanner';
import { ProductViewPage } from '@pages/public/ProductView';
import { AuthenticProductPage } from '@pages/public/AuthenticProduct';
import { FakeProductPage } from '@pages/public/FakeProduct';
import { ProfilePage } from '@pages/public/Profile';
import ProductsPage from '@pages/public/Products';

// Admin pages
import { AdminDashboard } from '@pages/admin/AdminDashboard';
import { AddAccountPage } from '@pages/admin/AddAccount';
import { ManageAccountsPage } from '@pages/admin/ManageAccounts';

// Manufacturer pages
import { ManufacturerDashboard } from '@pages/manufacturer/ManufacturerDashboard';
import { AddProductPage } from '@pages/manufacturer/AddProduct';
import MyProductsPage from '@pages/manufacturer/MyProducts';

// Supplier pages
import { SupplierDashboard } from '@pages/supplier/SupplierDashboard';
import UpdateProductPage from '@pages/supplier/UpdateProduct';

// Retailer pages
import { RetailerDashboard } from '@pages/retailer/RetailerDashboard';

// Home/Landing page
const roleMap: Record<string, string> = {
  admin: '/admin',
  manufacturer: '/manufacturer',
  supplier: '/supplier',
  retailer: '/retailer',
};

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user ? <Navigate to={roleMap[user.role] || '/'} replace /> : (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f5f5 0%, #e8ecf1 100%)' }}>
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" fontFamily='"Gambetta", serif' fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
          TrustLens AI
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Anti-Counterfeit Product Verification System
        </Typography>
        <Button variant="contained" size="large" component={Link} to="/login">
          Get Started
        </Button>
      </Container>
    </Box>
  );
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader message="Loading application..." fullScreen />}>
      <Layout>
        <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/scanner"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manufacturer', 'supplier', 'retailer']}>
            <ScannerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/product"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manufacturer', 'supplier', 'retailer']}>
            <ProductViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authentic-product"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manufacturer', 'supplier', 'retailer']}>
            <AuthenticProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fake-product"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manufacturer', 'supplier', 'retailer']}>
            <FakeProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manufacturer', 'supplier', 'retailer']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manufacturer', 'supplier', 'retailer']}>
            <ProductsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-account"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AddAccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-accounts"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageAccountsPage />
          </ProtectedRoute>
        }
      />

      {/* Manufacturer routes */}
      <Route
        path="/manufacturer"
        element={
          <ProtectedRoute allowedRoles={['manufacturer']}>
            <ManufacturerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-product"
        element={
          <ProtectedRoute allowedRoles={['manufacturer']}>
            <AddProductPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-products"
        element={
          <ProtectedRoute allowedRoles={['manufacturer']}>
            <MyProductsPage />
          </ProtectedRoute>
        }
      />

      {/* Supplier routes */}
      <Route
        path="/supplier"
        element={
          <ProtectedRoute allowedRoles={['supplier']}>
            <SupplierDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/update-product"
        element={
          <ProtectedRoute allowedRoles={['supplier', 'retailer']}>
            <UpdateProductPage />
          </ProtectedRoute>
        }
      />

      {/* Retailer routes */}
      <Route
        path="/retailer"
        element={
          <ProtectedRoute allowedRoles={['retailer']}>
            <RetailerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Landing page */}
      <Route path="/" element={<HomePage />} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
      </Layout>
    </Suspense>
  );
};

export default AppRoutes;