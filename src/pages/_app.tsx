// src/pages/_app.tsx
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { useRouter } from 'next/router';
import { store } from '../store';
import theme from '../styles/theme';
import '../styles/globals.css';
import Layout from '../components/layout/layout';
import { checkAuthStatus } from '../store/slices/authSlice';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthPage = router.pathname === '/login' || router.pathname === '/register';

  // Move the checkAuthStatus dispatch to a useEffect inside the Provider
  return (
    <Provider store={store}>
      <StoreInitializer />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {isAuthPage ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </ThemeProvider>
    </Provider>
  );
}

// Separate component to handle store initialization
const StoreInitializer = () => {
  useEffect(() => {
    store.dispatch(checkAuthStatus());
  }, []);
  
  return null;
};

export default MyApp;