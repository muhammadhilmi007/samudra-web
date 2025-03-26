// src/components/layout/layout.tsx
import React, { ReactNode, useEffect } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState, AppDispatch } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { checkAuthStatus } from '../../store/slices/authSlice';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);

  // Check authentication status on mount
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, isAuthenticated, loading]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && !router.pathname.includes('/login')) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Don't render layout for non-authenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      
      {/* Header */}
      <Header 
        onToggleSidebar={handleDrawerToggle} 
        isSidebarOpen={sidebarOpen}
      />
      
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={handleDrawerToggle}
        variant={isMobile ? 'temporary' : 'permanent'} 
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? 240 : 72}px)` },
          mt: '64px',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflow: 'auto',
          height: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;