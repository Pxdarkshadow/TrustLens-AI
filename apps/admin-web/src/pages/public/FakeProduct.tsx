import { Box, Container, Paper, Typography, Button, Alert, Card, CardContent } from '@mui/material';
import { ArrowBack as BackIcon, Warning as WarningIcon, ThumbDown as ThumbDownIcon, Shield as ShieldIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

interface FakeProductPageProps {
  message?: string;
  qrData?: string;
}

export const FakeProductPage = ({ message, qrData: _qrData }: FakeProductPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageMessage = message || location.state?.message || 'This product could not be verified as authentic. It appears to be a counterfeit.';

  const handleBack = () => {
    navigate('/scanner');
  };

  const handleReport = () => {
    // In a real app, this would navigate to a report form
    alert('Reporting feature would be implemented here');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="text" startIcon={<BackIcon />} onClick={handleBack}>
          Back
        </Button>
        <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} color="error.main">
          Verification Failed ⚠
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: '#fce4ec',
            color: '#c62828',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 48,
          }}
        >
          <WarningIcon />
        </Box>

        <Typography variant="h4" sx={{ mb: 1, color: 'error.main' }}>
          Product Authentication Failed
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }} paragraph>
          We're sorry to inform you that the product you scanned is <strong>not authentic</strong>.
          It appears to be a counterfeit product.
        </Typography>

        <Alert severity="error" sx={{ mb: 4 }}>
          <ThumbDownIcon sx={{ mr: 1 }} />
          <strong>Do not purchase</strong> this product. It has failed authenticity verification.
        </Alert>

        <Card sx={{ mb: 4, textAlign: 'left', borderLeft: '4px solid', borderColor: 'error.main' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, color: 'error.main' }}>
              <ShieldIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Why this happens
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {pageMessage}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Counterfeit products may have copied QR codes, tampered packaging, or unauthorized
              manufacturing. Always purchase from authorized retailers.
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mb: 4 }}>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<ShieldIcon />}
            onClick={handleReport}
          >
            Report Counterfeit
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/scanner')}
          >
            Scan Another Product
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Checked on {dayjs().format('MMMM D, YYYY at HH:mm')} via TrustLens AI
        </Typography>
      </Paper>
    </Container>
  );
};

export default FakeProductPage;