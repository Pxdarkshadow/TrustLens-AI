import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Grid, Card, CardContent } from '@mui/material';
import { Update as UpdateIcon, Person as PersonIcon, QrCode as QrCodeIcon, Settings as SettingsIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Loader } from '@components/ui';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  color: string;
  badge?: number;
}

const DashboardCard = ({ title, description, icon, to, color, badge }: DashboardCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        },
      }}
      onClick={() => navigate(to)}
    >
      <CardContent>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            color: color,
            mb: 2,
            mx: 'auto',
          }}
        >
          {icon}
          {badge && badge > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: color,
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1,
              }}
            >
              {badge > 99 ? '99+' : badge}
            </Box>
          )}
        </Box>
        <Typography variant="h6" textAlign="center" fontWeight={700} sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export const SupplierDashboard = () => {
  const { user, isSupplier, isLoading: authLoading } = useAuth();
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authLoading && isSupplier()) {
      // In a real app, this would fetch products pending supplier updates
      setLoadingStats(false);
    }
  }, [authLoading]);

  const cards = [
    {
      title: 'Update Product',
      description: 'Scan QR and add supply chain event',
      icon: <UpdateIcon />,
      to: '/update-product',
      color: '#3f51b5',
    },
    {
      title: 'My Updates',
      description: 'View products you\'ve updated',
      icon: <InventoryIcon />,
      to: '/my-updates',
      color: '#98b5d5',
    },
    {
      title: 'Profile',
      description: 'Manage your supplier profile',
      icon: <PersonIcon />,
      to: '/profile',
      color: '#0288d1',
    },
    {
      title: 'Settings',
      description: 'Configure your preferences',
      icon: <SettingsIcon />,
      to: '/settings',
      color: '#ed6c02',
    },
  ];

  if (authLoading || loadingStats) {
    return <Loader message="Loading dashboard..." fullScreen />;
  }

  if (!isSupplier()) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} sx={{ mb: 1 }}>
          Supplier Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user?.username}. Update product supply chain information.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.to}>
            <DashboardCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          How It Works
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#e3f2fd', color: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <QrCodeIcon />
              </Box>
              <Typography variant="h6" sx={{ mb: 1 }}>1. Scan QR Code</Typography>
              <Typography variant="body2" color="text.secondary">
                Use the scanner to read the product's QR code
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#e8f5e9', color: '#388e3c', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <UpdateIcon />
              </Box>
              <Typography variant="h6" sx={{ mb: 1 }}>2. Add Event</Typography>
              <Typography variant="body2" color="text.secondary">
                Record location, timestamp, and transfer status
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fff3e0', color: '#f57c00', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <InventoryIcon />
              </Box>
              <Typography variant="h6" sx={{ mb: 1 }}>3. Verify</Typography>
              <Typography variant="body2" color="text.secondary">
                Product history is updated on blockchain
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SupplierDashboard;