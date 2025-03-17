// src/pages/loading/create.tsx
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
  createLoading,
  getTruckQueuesByBranch,
} from '../../store/slices/loadingSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { getSTTsByStatus } from '../../store/slices/sttSlice';
import { getEmployeesByBranch } from '../../store/slices/employeeSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { LoadingFormInputs } from '../../types/loading';
import withAuth from '../../components/auth/withAuth';
import LoadingForm from '../../components/loading/LoadingForm';

const CreateLoadingPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { sttList } = useSelector((state: RootState) => state.stt);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { truckQueues } = useSelector((state: RootState) => state.loading);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    dispatch(getBranches());
    
    // Get pending STTs
    if (user?.cabangId) {
      dispatch(getSTTsByStatus('PENDING'));
      dispatch(getEmployeesByBranch(user.cabangId));
      dispatch(getTruckQueuesByBranch(user.cabangId));
    }
  }, [dispatch, user]);

  const handleSubmit = (data: LoadingFormInputs) => {
    dispatch(createLoading(data)).then((result) => {
      if (!result.error) {
        // Redirect to loading list after successful creation
        setTimeout(() => {
          router.push('/loading');
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

  // Filter employees to find checkers
  const checkers = employees.filter(employee => 
    employee.jabatan.toLowerCase().includes('checker') || 
    employee.jabatan.toLowerCase().includes('operator')
  );

  return (
    <>
      <Head>
        <title>Tambah Muatan Baru - Samudra ERP</title>
      </Head>

      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Tambah Muatan Baru</Typography>
        </Box>

        <Paper sx={{ width: '100%', mb: 2, p: 3 }}>
          <LoadingForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
            branches={branches}
            sttList={sttList}
            checkers={checkers}
            truckQueues={truckQueues}
            loading={loading}
            initialData={{
              sttIds: [],
              antrianTruckId: '',
              checkerId: '',
              cabangMuatId: user?.cabangId || '',
              cabangBongkarId: '',
              keterangan: ''
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

export default withAuth(CreateLoadingPage);