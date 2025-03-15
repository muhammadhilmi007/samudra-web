// src/components/layout/Layout.tsx
import React, { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  useMediaQuery, 
  useTheme,
  List,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  DirectionsCar as VehicleIcon,
  LocalShipping as TruckIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  SwapHoriz as ReturnIcon,
  AssignmentReturn as DeliveryIcon,
  AccountBalance as FinanceIcon,
  BarChart as ReportIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  LocalShipping
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import Link from 'next/link';

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  icon: React.ReactElement;
  text: string;
  path: string;
  roles: string[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    setAnchorEl(null);
    await dispatch(logout());
    router.push('/login');
  };
  
  const menuItems: MenuItem[] = [
    { 
      icon: <DashboardIcon />, 
      text: 'Dashboard', 
      path: '/dashboard',
      roles: ['all']
    },
    { 
      icon: <BusinessIcon />, 
      text: 'Cabang & Divisi', 
      path: '/branch',
      roles: ['direktur', 'manajer_admin', 'kepala_cabang']
    },
    { 
      icon: <PeopleIcon />, 
      text: 'Pegawai', 
      path: '/employee',
      roles: ['direktur', 'manajer_admin', 'manajer_sdm', 'kepala_cabang']
    },
    { 
      icon: <PersonIcon />, 
      text: 'Customer', 
      path: '/customer',
      roles: ['direktur', 'manajer_admin', 'staff_admin', 'staff_penjualan', 'kepala_cabang']
    },
    { 
      icon: <VehicleIcon />, 
      text: 'Kendaraan', 
      path: '/vehicle',
      roles: ['direktur', 'manajer_operasional', 'kepala_gudang', 'kepala_cabang']
    },
    { 
      icon: <TruckIcon />, 
      text: 'Pengambilan', 
      path: '/pickup',
      roles: ['direktur', 'manajer_operasional', 'kepala_gudang', 'staff_admin', 'kepala_cabang']
    },
    { 
      icon: <ReceiptIcon />, 
      text: 'STT', 
      path: '/stt',
      roles: ['direktur', 'manajer_operasional', 'staff_penjualan', 'kepala_cabang', 'staff_admin']
    },
    { 
      icon: <LocalShipping />, 
      text: 'Muatan', 
      path: '/loading',
      roles: ['direktur', 'manajer_operasional', 'kepala_gudang', 'checker', 'kepala_cabang']
    },
    { 
      icon: <DeliveryIcon />, 
      text: 'Lansir', 
      path: '/delivery',
      roles: ['direktur', 'manajer_operasional', 'kepala_gudang', 'checker', 'kepala_cabang', 'supir']
    },
    { 
      icon: <ReturnIcon />, 
      text: 'Retur', 
      path: '/return',
      roles: ['direktur', 'manajer_operasional', 'kepala_gudang', 'kepala_cabang', 'staff_admin']
    },
    { 
      icon: <PaymentIcon />, 
      text: 'Penagihan', 
      path: '/collection',
      roles: ['direktur', 'manajer_keuangan', 'kasir', 'debt_collector', 'kepala_cabang', 'staff_admin']
    },
    { 
      icon: <FinanceIcon />, 
      text: 'Keuangan', 
      path: '/finance',
      roles: ['direktur', 'manajer_keuangan', 'kasir', 'staff_admin', 'kepala_cabang']
    },
    { 
      icon: <ReportIcon />, 
      text: 'Laporan', 
      path: '/reports',
      roles: ['direktur', 'manajer_keuangan', 'manajer_operasional', 'kepala_cabang']
    },
    { 
      icon: <SettingsIcon />, 
      text: 'Pengaturan', 
      path: '/settings',
      roles: ['direktur', 'manajer_admin', 'kepala_cabang']
    }
  ];
  
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return false;
    return item.roles.includes('all') || item.roles.includes(user.role);
  });

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
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
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Samudra ERP
          </Typography>
          
          {user && (
            <>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user.nama.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => router.push('/profile')}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profil
                </MenuItem>
                <MenuItem onClick={() => router.push('/settings')}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Pengaturan
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={sidebarOpen}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">
            Menu
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        
        <List component="nav">
          {filteredMenuItems.map((item) => (
            <Link href={item.path} key={item.text} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton
                selected={router.pathname === item.path || router.pathname.startsWith(`${item.path}/`)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
          ))}
        </List>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Samudra ERP
          </Typography>
        </Box>
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;