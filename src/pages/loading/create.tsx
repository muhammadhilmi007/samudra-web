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
import { FormProvider, useForm } from 'react-hook-form';

const CreateLoadingPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const methods = useForm<LoadingFormInputs>({
    defaultValues: {
      sttIds: [],
      antrianTruckId: '',
      checkerId: '',
      cabangMuatId: '',
      cabangBongkarId: '',
      keterangan: ''
    }
  });

  const { user } = useSelector((state: RootState) => state.auth);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { sttList } = useSelector((state: RootState) => state.stt);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { truckQueues } = useSelector((state: RootState) => state.loading);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    dispatch(getBranches());
    
    if (user?.cabangId) {
      dispatch(getSTTsByStatus('PENDING'));
      dispatch(getEmployeesByBranch(user.cabangId));
      dispatch(getTruckQueuesByBranch(user.cabangId));
      methods.setValue('cabangMuatId', user.cabangId);
    }
  }, [dispatch, user, methods]);

  const handleSubmit = (data: LoadingFormInputs) => {
    dispatch(createLoading(data)).then((result) => {
      if (!result.error) {
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
          <FormProvider {...methods}>
            <LoadingForm 
              onSubmit={methods.handleSubmit(handleSubmit)} 
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
                keterangan: '',
                _id: '',
                idMuat: ''
              }}
            />
          </FormProvider>
        </Paper>
      </Box>

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