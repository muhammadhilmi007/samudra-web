import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Box, 
  Badge, 
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Person as ProfileIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store';

const roles = [
  { id: "direktur", namaRole: "Direktur" },
  { id: "manajer_admin", namaRole: "Manajer Admin" },
  { id: "manajer_keuangan", namaRole: "Manajer Keuangan" },
  { id: "manajer_pemasaran", namaRole: "Manajer Pemasaran" },
  { id: "manajer_operasional", namaRole: "Manajer Operasional" },
  { id: "manajer_sdm", namaRole: "Manajer SDM" },
  { id: "manajer_distribusi", namaRole: "Manajer Distribusi" },
  { id: "kepala_cabang", namaRole: "Kepala Cabang" },
  { id: "kepala_gudang", namaRole: "Kepala Gudang" },
  { id: "staff_admin", namaRole: "Staf Admin" },
  { id: "staff_penjualan", namaRole: "Staf Penjualan" },
  { id: "kasir", namaRole: "Kasir" },
  { id: "debt_collector", namaRole: "Debt Collector" },
  { id: "checker", namaRole: "Checker" },
  { id: "supir", namaRole: "Supir" },
  { id: "pelanggan", namaRole: "Pelanggan" }
];

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const username = user?.nama || 'User';
  const userRole = user?.role && user.roleId ? 
    roles.find(r => r.id === user.roleId)?.namaRole || user.role : 
    'User';
  const cabangName = user?.cabang?.namaCabang || '';

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleOpenLogoutDialog = () => {
    handleMenuClose();
    setLogoutDialog(true);
  };

  const handleCloseLogoutDialog = () => {
    setLogoutDialog(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await dispatch(logout());
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
      setLogoutDialog(false);
    }
  };

  const handleSettings = () => {
    handleMenuClose();
    router.push('/settings');
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push('/profile');
  };

  return (
    <>
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="toggle drawer"
            onClick={onToggleSidebar}
            sx={{ mr: 2, display: { xs: 'block', sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {!isSidebarOpen && !isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={onToggleSidebar}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Samudra ERP {cabangName ? `- ${cabangName}` : ''}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Notifikasi">
              <IconButton 
                color="inherit" 
                onClick={handleNotificationsOpen}
                aria-controls="notifications-menu"
                aria-haspopup="true"
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Menu
              id="notifications-menu"
              anchorEl={notificationsAnchor}
              keepMounted
              open={Boolean(notificationsAnchor)}
              onClose={handleNotificationsClose}
              PaperProps={{
                style: {
                  width: '320px',
                  maxHeight: '400px',
                },
              }}
            >
              <MenuItem>
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="subtitle2">Pengiriman tertunda</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ada 5 pengiriman tertunda yang memerlukan perhatian segera
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem>
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="subtitle2">STT baru dibuat</Typography>
                  <Typography variant="body2" color="text.secondary">
                    BDG-180325-2023 telah dibuat dan menunggu pengiriman
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem>
                <Box sx={{ py: 0.5 }}>
                  <Typography variant="subtitle2">Penagihan jatuh tempo</Typography>
                  <Typography variant="body2" color="text.secondary">
                    2 penagihan akan jatuh tempo dalam 3 hari
                  </Typography>
                </Box>
              </MenuItem>
            </Menu>

            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', mr: 2, textAlign: 'right' }}>
                <Typography variant="subtitle2" noWrap>
                  {username}
                </Typography>
                <Typography variant="caption" color="textSecondary" noWrap>
                  {userRole}
                </Typography>
              </Box>
              
              <Tooltip title="Pengaturan akun">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="large"
                  edge="end"
                  aria-controls="profile-menu"
                  aria-haspopup="true"
                  color="inherit"
                >
                  <Avatar 
                    sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }} 
                    alt={username}
                    src={user?.fotoProfil}
                  >
                    {username?.charAt(0) || 'A'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>

            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfile}>
                <ProfileIcon fontSize="small" sx={{ mr: 1 }} />
                Profil
              </MenuItem>
              <MenuItem onClick={handleSettings}>
                <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                Pengaturan
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleOpenLogoutDialog}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialog}
        onClose={handleCloseLogoutDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Konfirmasi Logout
        </DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin keluar dari sistem?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseLogoutDialog} 
            disabled={loggingOut}
          >
            Batal
          </Button>
          <Button 
            onClick={handleLogout} 
            color="primary" 
            variant="contained"
            disabled={loggingOut}
          >
            {loggingOut ? 'Memproses...' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;