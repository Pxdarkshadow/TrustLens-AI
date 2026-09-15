import { useEffect, useState } from 'react';
import { Box, Container, Paper, Typography, Button, Grid, Chip, Alert, CircularProgress, Divider } from '@mui/material';
import { ArrowBack as BackIcon, QrCode as QrCodeIcon, LocationOn as LocationIcon, Person as PersonIcon, Verified as VerifiedIcon, Cancel as CancelIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { productsApi } from '@services/products';
import { Loader } from '@components/ui';
import type { Product, SupplyChainEvent } from '../../types/product';

interface ProductViewPageProps {
  serialNumber?: string;
}

export const ProductViewPage = ({ serialNumber: propSerialNumber }: ProductViewPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const serialNumber = propSerialNumber || location.state?.qrData?.productId || location.state?.serialNumber;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (serialNumber) {
      const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await productsApi.getBySerialNumber(serialNumber);
          if (response.success && response.data) {
            setProduct(response.data);
          } else {
            throw new Error(response.message || 'Product not found');
          }
        } catch (err: unknown) {
          const apiError = err as { response?: { data?: { message?: string } } };
          setError(apiError.response?.data?.message || 'Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
      setLoading(false);
      setError('No product specified');
    }
  }, [serialNumber]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleVerify = async () => {
    if (!serialNumber) return;
    setVerifying(true);
    try {
      const response = await productsApi.verify(serialNumber);
      if (response.success && response.data) {
        if (response.data.isAuthentic) {
          navigate('/authentic-product', {
            state: { product: response.data.product, qrData: `trustlens://verify/${serialNumber}` }
          });
        } else {
          navigate('/fake-product', {
            state: { message: response.data.message, qrData: `trustlens://verify/${serialNumber}` }
          });
        }
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const formatEvent = (event: SupplyChainEvent) => {
    const roleLabels: Record<string, string> = {
      manufacturer: 'Manufactured',
      supplier: 'Supplied',
      retailer: 'Retailed',
    };
    return {
      label: roleLabels[event.role] || event.role,
      role: event.role,
    };
  };

  const getEventIcon = (role: string) => {
    switch (role) {
      case 'manufacturer':
        return <PersonIcon color="primary" />;
      case 'supplier':
        return <LocationIcon color="info" />;
      case 'retailer':
        return <ShoppingCartIcon color="warning" />;
      default:
        return <QrCodeIcon color="secondary" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Loader message="Loading product..." fullScreen />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Product not found'}
          </Alert>
          <Button variant="contained" startIcon={<BackIcon />} onClick={handleBack}>
            Back to Scanner
          </Button>
        </Paper>
      </Container>
    );
  }

  const statusConfig = {
    active: { color: 'success', icon: <VerifiedIcon />, label: 'Active' },
    inactive: { color: 'warning', icon: <CancelIcon />, label: 'Inactive' },
    revoked: { color: 'error', icon: <CancelIcon />, label: 'Revoked' },
    sold: { color: 'info', icon: <VerifiedIcon />, label: 'Sold' },
  };

  const status = statusConfig[product.status as keyof typeof statusConfig] || statusConfig.inactive;

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="text" startIcon={<BackIcon />} onClick={handleBack}>
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700}>
            {product.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {product.brand} &bull; Serial: {product.serialNumber}
          </Typography>
        </Box>
        <Chip
          icon={status.icon}
          label={status.label}
          color={status.color as any}
          size="medium"
        />
      </Box>

      <Grid container spacing={4}>
        {/* Main Product Info */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Product Details</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Brand</Typography>
                <Typography variant="body1">{product.brand}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Serial Number</Typography>
                <Typography variant="body1" fontFamily="monospace">{product.serialNumber}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Manufacturer</Typography>
                <Typography variant="body1">{product.manufacturerName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Manufacturer Location</Typography>
                <Typography variant="body1">{product.manufacturerLocation}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Manufacture Date</Typography>
                <Typography variant="body1">{dayjs(product.manufactureDate).format('MMMM D, YYYY')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip label={status.label} color={status.color as any} icon={status.icon} size="small" />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Description</Typography>
                <Typography variant="body1" paragraph>{product.description || 'No description provided'}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Supply Chain History */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Supply Chain History</Typography>
              <Button variant="outlined" startIcon={<QrCodeIcon />} onClick={handleVerify} disabled={verifying}>
                {verifying ? <CircularProgress size={20} color="inherit" /> : 'Verify Authenticity'}
              </Button>
            </Box>

            {product.supplyChainHistory && product.supplyChainHistory.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {product.supplyChainHistory.map((event, index) => {
                  const eventInfo = formatEvent(event);
                  return (
                    <Box
                      key={event.id}
                      sx={{
                        display: 'flex',
                        gap: 3,
                        padding: '16px 0',
                        borderBottom: index < product.supplyChainHistory!.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor:
                              event.role === 'manufacturer' ? '#e3f2fd' :
                              event.role === 'supplier' ? '#e8f5e9' :
                              event.role === 'retailer' ? '#fff3e0' : '#f5f5f5',
                          }}
                        >
                          {getEventIcon(event.role)}
                        </Box>
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {eventInfo.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(event.timestamp).format('MMMM D, YYYY HH:mm')}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {event.actor}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <LocationIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          {event.location}
                        </Typography>
                        {event.isSold && (
                          <Chip
                            label="Sold"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        )}
                        {event.transactionHash && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontFamily: 'monospace' }}>
                            Tx: {event.transactionHash.slice(0, 12)}...
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <QrCodeIcon color="disabled" sx={{ mb: 1, fontSize: 48 }} />
                <Typography variant="body1" color="text.secondary">
                  No supply chain history recorded yet
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Product Image & Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 'fit-content', sticky: 'top', top: 100 }}>
            {product.primaryImage?.url ? (
              <Box sx={{ mb: 3, borderRadius: 1, overflow: 'hidden' }}>
                <img
                  src={product.primaryImage.url}
                  alt={product.name}
                  style={{ width: '100%', height: 'auto', maxHeight: 300, objectFit: 'cover' }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '1/1',
                  borderRadius: 1,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <QrCodeIcon color="disabled" sx={{ mb: 1, fontSize: 64 }} />
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<QrCodeIcon />}
                onClick={handleVerify}
                disabled={verifying}
              >
                {verifying ? 'Verifying...' : 'Verify Authenticity'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/scanner')}
              >
                Scan Another Product
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="text.secondary" align="center" paragraph>
              TrustLens AI provides tamper-proof product verification using blockchain technology.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductViewPage;