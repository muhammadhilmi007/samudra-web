// src/pages/return/create.tsx
import React, { useEffect } from 'react';
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
import {
  createReturn,
} from '../../store/slices/returnSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { getSTTsByStatus } from '../../store/slices/sttSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { ReturnFormInputs } from '../../types/return';
import withAuth from '../../components/auth/withAuth';
import ReturnForm from '../../components/return/ReturnForm';

const CreateReturnPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { sttList } = useSelector((state: RootState) => state.stt);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    dispatch(getBranches());
    
    // Get delivered STTs
    dispatch(getSTTsByStatus('TERKIRIM'));
  }, [dispatch]);

  const handleSubmit = (data: ReturnFormInputs) => {
    dispatch(createReturn(data)).then((result) => {
      if (!result.error) {
        // Redirect to return list after successful creation
        setTimeout(() => {
          router.push('/return');
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
        <title>Tambah Retur Baru - Samudra ERP</title>
      </Head>

      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Tambah Retur Baru</Typography>
        </Box>

        <Paper sx={{ width: '100%', mb: 2, p: 3 }}>
          <ReturnForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
            branches={branches}
            sttList={sttList}
            loading={loading}
            initialData={{
              sttIds: [],
              tanggalKirim: new Date().toISOString().split('T')[0],
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

export default withAuth(CreateReturnPage);