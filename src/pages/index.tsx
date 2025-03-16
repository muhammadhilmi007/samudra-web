// src/pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import { RootState } from '../store';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    // If not authenticated, redirect to login
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <>
      <Head>
        <title>Samudra ERP - Sistem Manajemen Logistik & Pengiriman</title>
        <meta name="description" content="Samudra ERP - Sistem Manajemen Logistik & Pengiriman terpadu" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" mt={3}>
          Memuat Samudra ERP...
        </Typography>
      </Box>
    </>
  );
}