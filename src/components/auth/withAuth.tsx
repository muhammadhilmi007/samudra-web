// src/components/auth/withAuth.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { CircularProgress, Box } from '@mui/material';

// Higher Order Component to protect routes
const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const AuthenticatedComponent = (props: P) => {
    const router = useRouter();
    const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
    const { loading } = useSelector((state: RootState) => state.ui);

    useEffect(() => {
      // If user is not authenticated and we're not in the process of checking auth
      if (!isAuthenticated && !token && !loading) {
        router.replace('/login');
      }
    }, [isAuthenticated, token, loading, router]);

    // Show loading state while checking authentication
    if (!isAuthenticated || loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      );
    }

    // If authenticated, render the wrapped component
    return <Component {...props} />;
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  AuthenticatedComponent.displayName = `withAuth(${displayName})`;

  return AuthenticatedComponent;
};

export default withAuth;