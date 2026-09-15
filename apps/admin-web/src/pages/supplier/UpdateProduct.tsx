import { useState } from 'react';
import { Box, Container, Paper, Typography, TextField, Button, Alert, Checkbox, FormControlLabel, Grid, Chip, Card, CardContent, CircularProgress } from '@mui/material';
import { Search as SearchIcon, LocationOn as LocationIcon, Add as AddIcon } from '@mui/icons-material';
import { Navigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '@hooks/useAuth';
import { productsApi } from '@services/products';
import { Loader } from '@components/ui';
import type { Product, SupplyChainEvent } from '../../types/product';

const UpdateProductPage = () => {
  const { user, isSupplier, isRetailer, isLoading: authLoading } = useAuth();
  const [serial, setSerial] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [location, setLocation] = useState('');
  const [isSold, setIsSold] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const role = user?.role === 'retailer' ? 'retailer' : user?.role === 'supplier' ? 'supplier' : null;

  const handleSearch = async () => {
    if (!serial.trim()) return;
    setLoading(true);
    setSearched(false);
    setStatus(null);
    try {
      const response = await productsApi.getBySerialNumber(serial.trim());
      if (response.success && response.data) {
        setProduct(response.data);
        setSearched(true);
        setLocation('');
        setIsSold(false);
      } else {
        setProduct(null);
        setSearched(true);
        setStatus(response.message || 'Product not found');
      }
    } catch (err: unknown) {
      setProduct(null);
      setSearched(true);
      setStatus('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!product || !user || !role) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const response = await productsApi.addSupplyChainEvent(product.serialNumber, {
        actor: user.username,
        role,
        location,
        timestamp: new Date().toISOString(),
        isSold,
      });
      if (response.success && response.data) {
        setProduct(response.data);
        setLocation('');
        setIsSold(false);
        setStatus('Supply chain event added successfully!');
      } else {
        setStatus(response.message || 'Failed to add event');
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setStatus(apiError.response?.data?.message || 'Failed to add event');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <Loader message="Loading..." fullScreen />;
  }

  if (!isSupplier() && !isRetailer()) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} sx={{ mb: 1 }}>
          Update Product
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Record a supply chain event for a product
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={10}>
            <TextField
              fullWidth
              label="Product Serial Number"
              placeholder="e.g., PRD-2024-001"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              InputProps={{
                startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="contained" fullWidth size="large" startIcon={<SearchIcon />} onClick={handleSearch} disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {status && (
        <Alert severity={status.includes('successfully') ? 'success' : 'error'} sx={{ mb: 3 }} onClose={() => setStatus(null)}>
          {status}
        </Alert>
      )}

      {loading ? (
        <Loader message="Fetching product..." />
      ) : !product ? (
        searched && (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {status || 'Enter a serial number above to load a product.'}
            </Typography>
          </Paper>
        )
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Product Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{product.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Brand</Typography>
                    <Typography variant="body1">{product.brand}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Serial Number</Typography>
                    <Typography variant="body1" fontFamily="monospace">{product.serialNumber}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip label={product.status} size="small" />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Add Supply Chain Event</Typography>
                  <TextField
                    fullWidth
                    label="Location"
                    placeholder="City, Country"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    margin="normal"
                  />
                  {role === 'retailer' && (
                    <FormControlLabel
                      control={<Checkbox checked={isSold} onChange={(e) => setIsSold(e.target.checked)} />}
                      label="Product sold to customer"
                    />
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddEvent} disabled={submitting || !location.trim()}>
                      {submitting ? <CircularProgress size={20} color="inherit" /> : 'Record Event'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Supply Chain History</Typography>
                {product.supplyChainHistory && product.supplyChainHistory.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {product.supplyChainHistory.map((event: SupplyChainEvent, index) => (
                      <Box
                        key={event.id}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          padding: '12px 0',
                          borderBottom: index < product.supplyChainHistory!.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                        }}
                      >
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight={600} textTransform="capitalize">
                              {event.role}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(event.timestamp).format('MMM D, YYYY HH:mm')}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">{event.actor}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            <LocationIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                            {event.location}
                          </Typography>
                          {event.isSold && (
                            <Chip label="Sold" size="small" color="success" variant="outlined" sx={{ mt: 1 }} />
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No supply chain events recorded yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default UpdateProductPage;