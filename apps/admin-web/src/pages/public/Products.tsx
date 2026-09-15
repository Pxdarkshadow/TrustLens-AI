import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, TextField, InputAdornment, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Pagination, Button } from '@mui/material';
import { Search as SearchIcon, Visibility as ViewIcon, Verified as VerifiedIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { productsApi } from '@services/products';
import { Loader } from '@components/ui';
import type { Product } from '../../types/product';

const statusConfig: Record<Product['status'], { color: any; label: string; icon: React.ReactElement }> = {
  active: { color: 'success', label: 'Active', icon: <VerifiedIcon /> },
  inactive: { color: 'warning', label: 'Inactive', icon: <CancelIcon /> },
  revoked: { color: 'error', label: 'Revoked', icon: <CancelIcon /> },
  sold: { color: 'info', label: 'Sold', icon: <VerifiedIcon /> },
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsApi.getAll({ page, limit: 20, search: search || undefined });
        if (response.success && response.data) {
          setProducts(response.data.items);
          setTotalPages(response.data.totalPages);
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
  }, [page, search]);

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setPage(1);
      setSearch((event.target as HTMLInputElement).value);
    }
  };

  if (loading) {
    return <Loader message="Loading products..." fullScreen />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} sx={{ mb: 1 }}>
          Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse all registered products
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Search products"
        placeholder="Search by serial number, name, or brand..."
        margin="normal"
        variant="outlined"
        onKeyDown={handleSearch}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
        }}
      />

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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const status = statusConfig[product.status] || statusConfig.inactive;
                  return (
                    <TableRow key={product.serialNumber} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{product.serialNumber}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>
                        <Chip label={status.label} color={status.color} icon={status.icon} size="small" />
                      </TableCell>
                      <TableCell>{dayjs(product.createdAt).format('MMM D, YYYY')}</TableCell>
                      <TableCell>
                        <Button size="small" startIcon={<ViewIcon />} onClick={() => navigate(`/product?serialNumber=${product.serialNumber}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
        </Box>
      )}
    </Container>
  );
};

export default ProductsPage;