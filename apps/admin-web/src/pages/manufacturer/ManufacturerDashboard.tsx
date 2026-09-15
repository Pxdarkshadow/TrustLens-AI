import { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Grid, Card, CardContent } from '@mui/material';
import { Inventory as InventoryIcon, Person as PersonIcon, QrCode as QrCodeIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { productsApi } from '@services/products';
import { Loader } from '@components/ui';
import dayjs from 'dayjs';
import type { Product } from '../../types/product';

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

export const ManufacturerDashboard = () => {
  const { user, isManufacturer, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [productsCount, setProductsCount] = useState(0);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authLoading && isManufacturer()) {
      const fetchStats = async () => {
        try {
          const response = await productsApi.getAll({ limit: 1 });
          if (response.data) {
            setProductsCount(response.data.total);
          }
          const recent = await productsApi.getAll({ page: 1, limit: 3, sortBy: 'createdAt', sortOrder: 'desc' });
          if (recent.data) {
            setRecentProducts(recent.data.items);
          }
        } catch (error) {
          console.error('Failed to fetch stats:', error);
        } finally {
          setLoadingStats(false);
        }
      };
      fetchStats();
    }
  }, [authLoading]);

  const cards = [
    {
      title: 'Add Product',
      description: 'Register a new product with QR code',
      icon: <AddIcon />,
      to: '/add-product',
      color: '#3f51b5',
    },
    {
      title: 'My Products',
      description: `View and manage ${productsCount} products`,
      icon: <InventoryIcon />,
      to: '/my-products',
      color: '#98b5d5',
      badge: productsCount,
    },
    {
      title: 'Profile',
      description: 'Manage your manufacturer profile',
      icon: <PersonIcon />,
      to: '/profile',
      color: '#0288d1',
    },
    {
      title: 'QR Code Generator',
      description: 'Generate QR codes for products',
      icon: <QrCodeIcon />,
      to: '/qr-generator',
      color: '#ed6c02',
    },
  ];

  if (authLoading || loadingStats) {
    return <Loader message="Loading dashboard..." fullScreen />;
  }

  if (!isManufacturer()) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} sx={{ mb: 1 }}>
          Manufacturer Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user?.username}. Manage your products and supply chain.
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
          Recent Products
        </Typography>
        <Paper elevation={1} sx={{ p: 3 }}>
          {recentProducts.length > 0 ? (
            <Grid container spacing={2}>
              {recentProducts.map((product) => (
                <Grid item xs={12} key={product.serialNumber}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/product?serialNumber=${product.serialNumber}`)}>
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>{product.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.brand} &bull; <span style={{ fontFamily: 'monospace' }}>{product.serialNumber}</span>
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(product.createdAt).format('MMM D, YYYY')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              No products yet. Add your first product to get started!
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ManufacturerDashboard;