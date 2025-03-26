// src/components/layout/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  useTheme,
  IconButton,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  Inventory as InventoryIcon,
  ReceiptLong as ReceiptLongIcon,
  LocalShipping as LocalShippingIcon,
  AssignmentReturn as ReturnIcon,
  Payment as PaymentIcon,
  AccountBalance as AccountBalanceIcon,
  Assignment as AssignmentIcon,
  QueryStats as StatsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: 'permanent' | 'persistent' | 'temporary';
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant }) => {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [openSubmenu, setOpenSubmenu] = useState<{ [key: string]: boolean }>({});
  
  // Get user permissions
  const userRole = user?.role || '';
  const userPermissions = user?.permissions || [];
  
  // Sidebar menu items
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
      requiredPermissions: ['read_dashboard']
    },
    {
      title: 'Master Data',
      path: '/master',
      icon: <BusinessIcon />,
      children: [
        {
          title: 'Cabang & Divisi',
          path: '/branch',
          icon: <BusinessIcon />,
          requiredRoles: ['direktur', 'manajer_admin', 'kepala_cabang', 'admin'],
          requiredPermissions: ['read_branches']
        },
        {
          title: 'Pegawai',
          path: '/employee',
          icon: <PersonIcon />,
          requiredRoles: ['direktur', 'manajer_admin', 'manajer_sdm', 'kepala_cabang', 'admin'],
          requiredPermissions: ['read_users']
        },
        {
          title: 'Kendaraan',
          path: '/vehicle',
          icon: <DirectionsCarIcon />,
          requiredRoles: ['direktur', 'manajer_operasional', 'kepala_cabang', 'admin', 'kepala_gudang'],
          requiredPermissions: ['read_vehicles']
        },
        {
          title: 'Customer',
          path: '/customer',
          icon: <PersonIcon />,
          requiredRoles: ['direktur', 'manajer_operasional', 'kepala_cabang', 'admin', 'staff_admin'],
          requiredPermissions: ['read_customers']
        }
      ]
    },
    {
      title: 'Operasional',
      path: '/operational',
      icon: <LocalShippingIcon />,
      requiredPermissions: ['read_operations'],
      children: [
        {
          title: 'Pengambilan Barang',
          path: '/pickup',
          icon: <InventoryIcon />,
          requiredRoles: ['direktur', 'manajer_operasional', 'kepala_cabang', 'kepala_gudang', 'staff_admin'],
          requiredPermissions: ['read_pickups']
        },
        {
          title: 'STT',
          path: '/stt',
          icon: <ReceiptLongIcon />,
          requiredRoles: ['direktur', 'manajer_operasional', 'kepala_cabang', 'staff_admin'],
          requiredPermissions: ['read_stt']
        },
        {
          title: 'Muat',
          path: '/loading',
          icon: <LocalShippingIcon />,
          requiredRoles: ['direktur', 'manajer_operasional', 'kepala_cabang', 'kepala_gudang', 'checker'],
          requiredPermissions: ['shipment_management']
        },
        {
          title: 'Lansir',
          path: '/delivery',
          icon: <LocalShippingIcon />,
          requiredRoles: ['direktur', 'manajer_operasional', 'kepala_cabang', 'kepala_gudang', 'checker', 'supir'],
          requiredPermissions: ['delivery_tracking']
        },
        {
          title: 'Retur',
          path: '/return',
          icon: <ReturnIcon />,
          requiredRoles: ['direktur', 'manajer_operasional', 'kepala_cabang', 'staff_admin', 'checker'],
          requiredPermissions: ['read_operations']
        }
      ]
    },
    {
      title: 'Keuangan',
      path: '/finance',
      icon: <AccountBalanceIcon />,
      requiredRoles: ['direktur', 'manajer_keuangan', 'kepala_cabang', 'kasir', 'admin'],
      requiredPermissions: ['read_finance'],
      children: [
        {
          title: 'Penagihan',
          path: '/collection',
          icon: <PaymentIcon />,
          requiredRoles: ['direktur', 'manajer_keuangan', 'kepala_cabang', 'kasir', 'debt_collector'],
          requiredPermissions: ['payment_processing']
        },
        {
          title: 'Jurnal',
          path: '/journal',
          icon: <AssignmentIcon />,
          requiredRoles: ['direktur', 'manajer_keuangan', 'kepala_cabang', 'kasir'],
          requiredPermissions: ['financial_transactions']
        },
        {
          title: 'Kas',
          path: '/cash',
          icon: <PaymentIcon />,
          requiredRoles: ['direktur', 'manajer_keuangan', 'kepala_cabang', 'kasir'],
          requiredPermissions: ['cash_management']
        },
        {
          title: 'Laporan',
          path: '/report',
          icon: <AssignmentIcon />,
          requiredRoles: ['direktur', 'manajer_keuangan', 'kepala_cabang'],
          requiredPermissions: ['generate_reports']
        }
      ]
    },
    {
      title: 'Monitoring',
      path: '/monitoring',
      icon: <StatsIcon />,
      children: [
        {
          title: 'Tracking',
          path: '/tracking',
          icon: <LocalShippingIcon />,
          requiredPermissions: ['tracking_only']
        },
        {
          title: 'Statistik',
          path: '/statistics',
          icon: <StatsIcon />,
          requiredRoles: ['direktur', 'manajer_operasional', 'manajer_keuangan', 'kepala_cabang'],
          requiredPermissions: ['read_dashboard']
        }
      ]
    },
    {
      title: 'Pengaturan',
      path: '/settings',
      icon: <SettingsIcon />,
      requiredRoles: ['direktur', 'admin', 'manajer_admin', 'manajer_sdm'],
      requiredPermissions: ['read_settings']
    }
  ];
  
  // Check if the user has permission to see the menu item
  const hasPermission = (item: MenuItem): boolean => {
    // If no restrictions set, everyone can see it
    if (!item.requiredRoles && !item.requiredPermissions) {
      return true;
    }
    
    // Check role-based access
    if (item.requiredRoles && item.requiredRoles.length > 0) {
      if (item.requiredRoles.includes(userRole)) {
        return true;
      }
    }
    
    // Check permission-based access
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      // Check if user has any of the required permissions
      return item.requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );
    }
    
    // If we get here and requiredRoles was set but no requiredPermissions,
    // and the user did not have the required role, then deny access
    if (item.requiredRoles && !item.requiredPermissions) {
      return false;
    }
    
    return true;
  };
  
  // Check if the menu item has accessible children
  const hasAccessibleChildren = (item: MenuItem): boolean => {
    if (!item.children) {
      return false;
    }
    
    return item.children.some(child => hasPermission(child));
  };
  
  // Check if the current route is active
  const isActive = (path: string): boolean => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };
  
  // Handle menu item click
  const handleMenuClick = (path: string, hasChildren: boolean, key: string) => {
    if (hasChildren) {
      // Only toggle submenu for parent items, don't navigate
      setOpenSubmenu(prev => ({ ...prev, [key]: !prev[key] }));
    } else if (path !== router.pathname) {
      // Only navigate if the path is different from current path
      router.push(path);
      if (variant === 'temporary') {
        onClose();
      }
    }
  };
  
  // Initialize open submenu states
  useEffect(() => {
    const initialOpenSubmenu: { [key: string]: boolean } = {};
    menuItems.forEach(item => {
      if (item.children && item.children.some(child => isActive(child.path))) {
        initialOpenSubmenu[item.title] = true;
      }
    });
    
    setOpenSubmenu(initialOpenSubmenu);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]); 
  
  const drawerWidth = open ? 240 : 72;
  
  const renderMenuItems = (items: MenuItem[], isSubmenu = false) => {
    return items.map((item) => {
      // Skip menu items that the user doesn't have permission to see
      if (!hasPermission(item) && !hasAccessibleChildren(item)) {
        return null;
      }
      
      const hasChildren = !!item.children && item.children.length > 0 && hasAccessibleChildren(item);
      const isMenuOpen = openSubmenu[item.title] || false;
      const active = isActive(item.path);
      
      return (
        <React.Fragment key={item.title}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                ml: isSubmenu ? 2 : 0,
                bgcolor: active ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
              }}
              onClick={() => handleMenuClick(item.path, hasChildren, item.title)}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: active ? theme.palette.primary.main : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title} 
                sx={{ 
                  opacity: open ? 1 : 0,
                  color: active ? theme.palette.primary.main : 'inherit'
                }} 
              />
              {hasChildren && open && (
                isMenuOpen ? <ExpandLess /> : <ExpandMore />
              )}
            </ListItemButton>
          </ListItem>
          
          {hasChildren && (
            <Collapse in={isMenuOpen && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children && renderMenuItems(item.children.filter(child => hasPermission(child)), true)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };
  
  const drawer = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-end' : 'center',
          p: 1,
          height: '64px'
        }}
      >
        {open && (
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, ml: 2 }}>
            Menu
          </Typography>
        )}
        <IconButton onClick={onClose}>
          {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        {renderMenuItems(menuItems)}
      </List>
    </>
  );
  
  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          whiteSpace: 'nowrap',
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;