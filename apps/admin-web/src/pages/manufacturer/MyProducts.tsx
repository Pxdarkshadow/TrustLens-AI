import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Add as AddIcon, Verified as VerifiedIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { Navigate, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '@hooks/useAuth';
import { productsApi } from '@services/products';
import { Loader } from '@components/ui';
import type { Product } from '../../types/product';

const MyProductsPage = () => {
  const navigate = useNavigate();
  const { user, isManufacturer, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isManufacturer() && user) {
      const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await productsApi.getAll({ page: 1, limit: 50, manufacturerId: user.id });
          if (response.success && response.data) {
            setProducts(response.data.items);
          } else {
            throw new Error(response.message || 'Failed to load products');
          }
        } catch (err: unknown) {
          const apiError = err as { response?: { data?: { message?: string } } };
          setError(apiError.response?.data?.message || 'Failed to load products');
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [authLoading, isManufacturer, user]);

  const statusConfig: Record<Product['status'], { color: any; label: string; icon: React.ReactElement }> = {
    active: { color: 'success', label: 'Active', icon: <VerifiedIcon /> },
    inactive: { color: 'warning', label: 'Inactive', icon: <CancelIcon /> },
    revoked: { color: 'error', label: 'Revoked', icon: <CancelIcon /> },
    sold: { color: 'info', label: 'Sold', icon: <VerifiedIcon /> },
  };

  if (authLoading || loading) {
    return <Loader message="Loading products..." fullScreen />;
  }

  if (!isManufacturer()) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} sx={{ mb: 1 }}>
            My Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your registered products
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/add-product')}>
          Add Product
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper elevation={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Serial Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No products yet. Add your first product to get started.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const status = statusConfig[product.status] || statusConfig.inactive;
                  return (
                    <TableRow
                      key={product.serialNumber}
                      hover
                      onClick={() => navigate(`/product?serialNumber=${product.serialNumber}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace' }}>{product.serialNumber}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>
                        <Chip label={status.label} color={status.color} icon={status.icon} size="small" />
                      </TableCell>
                      <TableCell>{dayjs(product.createdAt).format('MMM D, YYYY')}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default MyProductsPage;