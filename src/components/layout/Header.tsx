// src/components/layout/Header.tsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
  Badge,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';

interface HeaderProps {
  onDrawerToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDrawerToggle }) => {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleOpenNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNotifications(event.currentTarget);
  };
  
  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };
  
  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };
  
  const handleProfile = () => {
    router.push('/profile');
    handleCloseUserMenu();
  };
  
  const handleSettings = () => {
    router.push('/settings');
    handleCloseUserMenu();
  };
  
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Samudra ERP
        </Typography>
        
        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleOpenNotificationsMenu}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
              {user?.nama || 'User'}
            </Typography>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar 
                  alt={user?.nama || 'User'} 
                  src={user?.fotoProfil || ''} 
                  sx={{ width: 32, height: 32 }}
                >
                  {(user?.nama?.charAt(0) || 'U').toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* User dropdown menu */}
        <Menu
          sx={{ mt: '45px' }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          <MenuItem onClick={handleProfile}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography textAlign="center">Profil</Typography>
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography textAlign="center">Pengaturan</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography textAlign="center">Logout</Typography>
          </MenuItem>
        </Menu>
        
        {/* Notifications dropdown menu */}
        <Menu
          sx={{ mt: '45px' }}
          id="menu-notifications"
          anchorEl={anchorElNotifications}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorElNotifications)}
          onClose={handleCloseNotificationsMenu}
        >
          <MenuItem onClick={handleCloseNotificationsMenu}>
            <Typography variant="body2">STT #JKT-150323-0025 telah terkirim</Typography>
          </MenuItem>
          <MenuItem onClick={handleCloseNotificationsMenu}>
            <Typography variant="body2">STT #BDG-150323-0042 dalam pengiriman</Typography>
          </MenuItem>
          <MenuItem onClick={handleCloseNotificationsMenu}>
            <Typography variant="body2">Pembayaran diterima untuk STT #JKT-140323-0078</Typography>
          </MenuItem>
          <MenuItem onClick={handleCloseNotificationsMenu}>
            <Typography variant="body2">Lihat semua notifikasi</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;