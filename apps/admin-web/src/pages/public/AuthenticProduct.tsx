import { Box, Container, Paper, Typography, Button, Alert, Card, CardContent } from '@mui/material';
import { ArrowBack as BackIcon, Verified as VerifiedIcon, QrCode as QrCodeIcon, ThumbUp as ThumbUpIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Product } from '../../types/product';

interface AuthenticProductPageProps {
  product?: Product;
  qrData?: string;
}

export const AuthenticProductPage = ({ product, qrData: _qrData }: AuthenticProductPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageProduct = product || location.state?.product;

  const handleBack = () => {
    navigate('/scanner');
  };

  const handleViewDetails = () => {
    if (pageProduct) {
      navigate('/product', { state: { serialNumber: pageProduct.serialNumber } });
    } else {
      navigate('/scanner');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="text" startIcon={<BackIcon />} onClick={handleBack}>
          Back
        </Button>
        <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} color="success.main">
          Authentic Product Verified ✓
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: '#e8f5e9',
            color: '#388e3c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 48,
          }}
        >
          <VerifiedIcon />
        </Box>

        <Typography variant="h4" sx={{ mb: 1 }}>
          Genuine Product Confirmed
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }} paragraph>
          This product has been verified as authentic through the TrustLens blockchain verification system.
          The product's supply chain history is recorded immutably and cannot be tampered with.
        </Typography>

        {pageProduct && (
          <Card sx={{ mb: 4, textAlign: 'left' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Product Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body2" fontWeight={600}>{pageProduct.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Brand</Typography>
                  <Typography variant="body2" fontWeight={600}>{pageProduct.brand}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Serial Number</Typography>
                  <Typography variant="body2" fontWeight={600} fontFamily="monospace">{pageProduct.serialNumber}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Manufacturer</Typography>
                  <Typography variant="body2" fontWeight={600}>{pageProduct.manufacturerName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Manufactured</Typography>
                  <Typography variant="body2" fontWeight={600}>{dayjs(pageProduct.manufactureDate).format('MMMM D, YYYY')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Supply Chain Events</Typography>
                  <Typography variant="body2" fontWeight={600}>{pageProduct.supplyChainHistory?.length || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        <Alert severity="success" sx={{ mb: 4 }}>
          <ThumbUpIcon sx={{ mr: 1 }} />
          This product is <strong>authentic</strong> and safe to purchase.
        </Alert>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<QrCodeIcon />}
            onClick={handleViewDetails}
          >
            View Full Details
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/scanner')}
          >
            Scan Another Product
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
          Verified on {dayjs().format('MMMM D, YYYY at HH:mm')} via TrustLens AI
        </Typography>
      </Paper>
    </Container>
  );
};

export default AuthenticProductPage;