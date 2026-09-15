import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box, Avatar, useTheme } from '@mui/material';
import { Menu as MenuIcon, Logout, Person, Dashboard } from '@mui/icons-material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/ui';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { user, logout, isAdmin, isManufacturer, isSupplier, isRetailer } = useAuth();
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (isAdmin()) return '/admin';
    if (isManufacturer()) return '/manufacturer';
    if (isSupplier()) return '/supplier';
    if (isRetailer()) return '/retailer';
    return '/';
  };

  const getRoleLabel = () => {
    if (!user) return '';
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        minHeight: 64,
      }}
    >
      <Toolbar>
        {onMenuClick && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, color: theme.palette.text.primary }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component={Link}
          to={getDashboardRoute()}
          sx={{
            flexGrow: 1,
            fontFamily: '"Gambetta", serif',
            fontWeight: 700,
            color: theme.palette.primary.main,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          TrustLens AI
        </Typography>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
              {getRoleLabel()}
            </Typography>
            <Button variant="outline" size="small" startIcon={<Dashboard />} onClick={() => navigate(getDashboardRoute())}>
              Dashboard
            </Button>
            <IconButton
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              size="small"
              color="inherit"
            >
              <Avatar
                alt={user.username}
                src={user.username.charAt(0).toUpperCase()}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem',
                  backgroundColor: theme.palette.primary.main,
                }}
              />
            </IconButton>
            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">
                  {user.username}
                </Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                <Person fontSize="small" sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;