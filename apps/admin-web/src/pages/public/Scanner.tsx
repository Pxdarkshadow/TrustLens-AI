import { useState, useEffect, useRef } from 'react';
import { Box, Container, Paper, Typography, Button, Alert, IconButton } from '@mui/material';
import { QrCode as QrCodeIcon, CameraAlt as CameraIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { productsApi } from '@services/products';
import { qrService } from '@services/qr';

export const ScannerPage = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [html5Qrcode, setHtml5Qrcode] = useState<Html5Qrcode | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const scannerRef = useRef<HTMLDivElement>(null);

  const handleScan = async (result: string) => {
    if (!result) return;

    setScanning(false);
    setScanResult(result);

    try {
      const qrData = qrService.parseQRData(result);
      if (!qrData) {
        throw new Error('Invalid QR code format');
      }

      // Verify product through backend
      const response = await productsApi.verify(qrData.productId);

      if (response.success && response.data) {
        const verification = response.data;
        if (verification.isAuthentic) {
          navigate('/authentic-product', { state: { qrData: result, product: verification.product } });
        } else {
          navigate('/fake-product', { state: { qrData: result, message: verification.message } });
        }
      } else {
        throw new Error(response.message || 'Verification failed');
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Product verification failed. Please try again.');
      // Restart scanning after error
      setTimeout(() => {
        if (html5Qrcode) {
          html5Qrcode.resume();
        }
        setScanning(true);
        setScanResult(null);
        setError(null);
      }, 3000);
    }
  };

  const handleError = (err: Error) => {
    console.error('QR Reader error:', err);
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      setError('Camera permission denied. Please allow camera access to scan QR codes.');
    } else if (err.name === 'NotFoundError') {
      setError('No camera found. Please connect a camera to scan QR codes.');
    } else {
      setError('Failed to start camera. Please try again.');
    }
    setScanning(false);
  };

  useEffect(() => {
    if (scannerRef.current && scanning) {
      const qrcode = new Html5Qrcode('qr-reader');
      setHtml5Qrcode(qrcode);

      qrcode.start(
        { facingMode: { exact: facingMode } },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScan,
        () => {
          // Ignore scan errors (no QR code found)
        }
      ).catch(handleError);

      return () => {
        qrcode.stop().catch(console.error);
        setHtml5Qrcode(null);
      };
    }
  }, [scanning, facingMode]);

  const handleBack = () => {
    navigate('/');
  };

  const toggleCamera = () => {
    if (html5Qrcode) {
      setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
      setScanning(false);
      html5Qrcode.stop().then(() => {
        setTimeout(() => setScanning(true), 500);
      });
    }
  };

  const restartScan = () => {
    if (html5Qrcode) {
      html5Qrcode.resume();
    }
    setScanning(true);
    setScanResult(null);
    setError(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8ecf1 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Button variant="text" startIcon={<BackIcon />} onClick={handleBack}>
            Back
          </Button>
          <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} color="primary.main">
            Scan QR Code
          </Typography>
          <Box sx={{ width: 40 }} />
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
              <Button
                size="small"
                variant="text"
                onClick={restartScan}
                sx={{ ml: 1 }}
              >
                Retry
              </Button>
            </Alert>
          )}

          {!scanning && scanResult && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Scanned: {scanResult}
            </Alert>
          )}

          <Box sx={{ position: 'relative', maxWidth: 400, margin: '0 auto', mb: 4 }}>
            <div id="qr-reader" ref={scannerRef} style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }} />

            {/* Scan frame overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 2,
                pointerEvents: 'none',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  width: 40,
                  height: 40,
                  borderTop: '4px solid',
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  width: 40,
                  height: 40,
                  borderBottom: '4px solid',
                  borderRight: '4px solid',
                  borderColor: 'primary.main',
                },
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                bottom: -50,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <IconButton
                size="large"
                onClick={toggleCamera}
                aria-label="Switch camera"
                sx={{ backgroundColor: 'white', boxShadow: 2 }}
              >
                <CameraIcon />
              </IconButton>
              <IconButton
                size="large"
                onClick={restartScan}
                aria-label="Restart scan"
                disabled={scanning}
                sx={{ backgroundColor: 'white', boxShadow: 2 }}
              >
                <QrCodeIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ mt: 6 }}>
            <Typography variant="body1" color="text.secondary" paragraph>
              Point your camera at a TrustLens QR code to verify product authenticity.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The QR code should be well-lit and fully visible within the frame.
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have a QR code? <Button variant="text" size="small" onClick={() => navigate('/product')}>View Demo Product</Button>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ScannerPage;