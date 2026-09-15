import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { Inventory as InventoryIcon, PersonAdd as PersonAddIcon, ManageAccounts as ManageAccountsIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { productsApi } from '@services/products';
import { usersApi } from '@services/users';

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

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [productsCount, setProductsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRes = await usersApi.getAll({ limit: 1 });
        if (usersRes.data) {
          setUsersCount(usersRes.data.total);
        }
        const productsRes = await productsApi.getAll({ limit: 1 });
        if (productsRes.data) {
          setProductsCount(productsRes.data.total);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  const cards = [
    {
      title: 'Add Account',
      description: 'Create new user accounts with roles',
      icon: <PersonAddIcon />,
      to: '/add-account',
      color: '#3f51b5',
    },
    {
      title: 'Manage Accounts',
      description: 'View and manage all user accounts',
      icon: <ManageAccountsIcon />,
      to: '/manage-accounts',
      color: '#98b5d5',
    },
    {
      title: 'Product Overview',
      description: 'View all registered products',
      icon: <InventoryIcon />,
      to: '/products',
      color: '#0288d1',
    },
    {
      title: 'System Settings',
      description: 'Configure application settings',
      icon: <SettingsIcon />,
      to: '/settings',
      color: '#ed6c02',
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontFamily='"Gambetta", serif' fontWeight={700} sx={{ mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.username}. Manage your system from here.
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
          Quick Stats
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Users</Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">{usersCount ?? '—'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Active Products</Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">{productsCount ?? '—'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Verifications Today</Typography>
                <Typography variant="h4" fontWeight={700} color="info.main">—</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Pending Actions</Typography>
                <Typography variant="h4" fontWeight={700} color="warning.main">—</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;