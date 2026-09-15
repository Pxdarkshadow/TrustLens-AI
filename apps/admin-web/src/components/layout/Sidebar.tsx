import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Typography, useTheme } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PersonAdd as PersonAddIcon,
  ManageAccounts as ManageAccountsIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
}

const menuItems = [
  {
    roles: ['admin'],
    items: [
      { label: 'Dashboard', icon: <DashboardIcon />, to: '/admin' },
      { label: 'Add Account', icon: <PersonAddIcon />, to: '/add-account' },
      { label: 'Manage Accounts', icon: <ManageAccountsIcon />, to: '/manage-accounts' },
    ]
  },
  {
    roles: ['manufacturer'],
    items: [
      { label: 'Dashboard', icon: <DashboardIcon />, to: '/manufacturer' },
      { label: 'Add Product', icon: <InventoryIcon />, to: '/add-product' },
      { label: 'Profile', icon: <PersonIcon />, to: '/profile' },
    ]
  },
  {
    roles: ['supplier'],
    items: [
      { label: 'Dashboard', icon: <DashboardIcon />, to: '/supplier' },
      { label: 'Update Product', icon: <UpdateIcon />, to: '/update-product' },
      { label: 'Profile', icon: <PersonIcon />, to: '/profile' },
    ]
  },
  {
    roles: ['retailer'],
    items: [
      { label: 'Dashboard', icon: <DashboardIcon />, to: '/retailer' },
      { label: 'Update Product', icon: <UpdateIcon />, to: '/update-product' },
      { label: 'Profile', icon: <PersonIcon />, to: '/profile' },
    ]
  },
];

export const Sidebar = ({ open, onClose, variant = 'temporary' }: SidebarProps) => {
  const theme = useTheme();
  const { user, isAdmin, isManufacturer, isSupplier, isRetailer, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getRoleItems = () => {
    if (!user) return [];

    if (isAdmin()) {
      return menuItems.find(m => m.roles.includes('admin'))?.items || [];
    }
    if (isManufacturer()) {
      return menuItems.find(m => m.roles.includes('manufacturer'))?.items || [];
    }
    if (isSupplier()) {
      return menuItems.find(m => m.roles.includes('supplier'))?.items || [];
    }
    if (isRetailer()) {
      return menuItems.find(m => m.roles.includes('retailer'))?.items || [];
    }
    return [];
  };

  const items = getRoleItems();

  const handleItemClick = (to: string) => {
    navigate(to);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" fontFamily='"Gambetta", serif' fontWeight={700} color={theme.palette.primary.main}>
          TrustLens AI
        </Typography>
        <Box component="span" className="role-badge" sx={{ mt: 0.5, display: 'inline-block' }}>
          {user ? user.role : ''}
        </Box>
      </Box>

      <List sx={{ py: 1 }} disablePadding>
        {items.map((item) => (
          <ListItem
            key={item.to}
            button
            component={Link}
            to={item.to}
            selected={location.pathname === item.to}
            onClick={() => handleItemClick(item.to)}
            sx={{
              borderRadius: 1,
              m: 0.5,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': { backgroundColor: theme.palette.primary.dark },
                '& .MuiListItemIcon-root': { color: theme.palette.primary.contrastText },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
          </ListItem>
        ))}

        {items.length > 0 && <Divider sx={{ my: 1 }} />}

        <ListItem
          button
          component={Link}
          to="/profile"
          onClick={() => onClose()}
          sx={{
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon /></ListItemIcon>
          <ListItemText primary="Profile" primaryTypographyProps={{ fontWeight: 500 }} />
        </ListItem>

        <ListItem
          button
          onClick={handleLogout}
          sx={{
            '&:hover': {
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.main,
              '& .MuiListItemIcon-root': {
                color: theme.palette.error.main,
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;