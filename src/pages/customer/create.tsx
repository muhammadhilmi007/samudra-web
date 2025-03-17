// src/pages/customer/create.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createCustomer } from '../../store/slices/customerSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { CustomerFormInputs } from '../../types/customer';
import withAuth from '../../components/auth/withAuth';
import CustomerForm from '../../components/customer/CustomerForm';

const CreateCustomerPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  const handleSubmit = (data: CustomerFormInputs) => {
    dispatch(createCustomer(data)).then((result) => {
      if (!result.error) {
        // Redirect to customer list after successful creation
        setTimeout(() => {
          router.push('/customer');
        }, 1500);
      }
    });
  };

  const handleCancel = () => {
    router.back();
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  return (
    <>
      <Head>
        <title>Tambah Customer Baru - Samudra ERP</title>
      </Head>

      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Tambah Customer Baru</Typography>
        </Box>

        <Paper sx={{ width: '100%', mb: 2, p: 3 }}>
          <CustomerForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
            branches={branches}
            loading={loading}
            initialData={{
              nama: '',
              tipe: 'Pengirim',
              alamat: '',
              kelurahan: '',
              kecamatan: '',
              kota: '',
              provinsi: '',
              telepon: '',
              email: '',
              perusahaan: '',
              cabangId: user?.cabangId || '',
            }}
          />
        </Paper>
      </Box>

      {/* Snackbar untuk notifikasi */}
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default withAuth(CreateCustomerPage);