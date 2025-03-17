// src/pages/vehicle/create.tsx
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
import { getEmployeesByBranch } from '../../store/slices/employeeSlice';
import { createVehicle } from '../../store/slices/vehicleSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { VehicleFormInputs } from '../../types/vehicle';
import withAuth from '../../components/auth/withAuth';
import VehicleForm from '../../components/vehicle/VehicleForm';

const CreateVehiclePage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    if (user?.cabangId) {
      dispatch(getEmployeesByBranch(user.cabangId));
    }
  }, [dispatch, user]);

  const handleSubmit = (data: VehicleFormInputs) => {
    const formData = new FormData();
    
    // Append all text fields
    formData.append('noPolisi', data.noPolisi);
    formData.append('namaKendaraan', data.namaKendaraan);
    formData.append('supirId', data.supirId);
    formData.append('noTeleponSupir', data.noTeleponSupir);
    formData.append('noKTPSupir', data.noKTPSupir);
    formData.append('alamatSupir', data.alamatSupir);
    formData.append('cabangId', data.cabangId);
    formData.append('tipe', data.tipe);
    
    if (data.grup) {
      formData.append('grup', data.grup);
    }
    
    if (data.kenekId) {
      formData.append('kenekId', data.kenekId);
    }
    
    if (data.noTeleponKenek) {
      formData.append('noTeleponKenek', data.noTeleponKenek);
    }
    
    if (data.noKTPKenek) {
      formData.append('noKTPKenek', data.noKTPKenek);
    }
    
    if (data.alamatKenek) {
      formData.append('alamatKenek', data.alamatKenek);
    }
    
    // Append file fields if present
    if (data.fotoKTPSupir && data.fotoKTPSupir instanceof File) {
      formData.append('fotoKTPSupir', data.fotoKTPSupir);
    }
    
    if (data.fotoSupir && data.fotoSupir instanceof File) {
      formData.append('fotoSupir', data.fotoSupir);
    }
    
    if (data.fotoKTPKenek && data.fotoKTPKenek instanceof File) {
      formData.append('fotoKTPKenek', data.fotoKTPKenek);
    }
    
    if (data.fotoKenek && data.fotoKenek instanceof File) {
      formData.append('fotoKenek', data.fotoKenek);
    }
    
    dispatch(createVehicle(formData)).then((result) => {
      if (!result.error) {
        // Redirect to vehicle list after successful creation
        setTimeout(() => {
          router.push('/vehicle');
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

  // Filter employees to get drivers
  const drivers = employees.filter(employee => 
    employee.jabatan.toLowerCase().includes('supir') || 
    employee.jabatan.toLowerCase().includes('driver')
  );
  
  // Filter employees to get assistants
  const assistants = employees.filter(employee => 
    employee.jabatan.toLowerCase().includes('kenek') || 
    employee.jabatan.toLowerCase().includes('assistant')
  );

  return (
    <>
      <Head>
        <title>Tambah Kendaraan Baru - Samudra ERP</title>
      </Head>

      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Tambah Kendaraan Baru</Typography>
        </Box>

        <Paper sx={{ width: '100%', mb: 2, p: 3 }}>
          <VehicleForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
            drivers={drivers}
            assistants={assistants}
            loading={loading}
            initialData={{
              noPolisi: '',
              namaKendaraan: '',
              supirId: '',
              noTeleponSupir: '',
              noKTPSupir: '',
              alamatSupir: '',
              cabangId: user?.cabangId || '',
              tipe: 'Lansir',
              grup: '',
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

export default withAuth(CreateVehiclePage);