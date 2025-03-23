import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import BranchForm from '../../components/branch/BranchForm';
import withAuth from '../../components/auth/withAuth';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createBranch } from '../../store/slices/branchSlice';
import { getDivisions } from '../../store/slices/divisionSlice';
import { clearError, clearSuccess, setError } from '../../store/slices/uiSlice';
import { BranchFormSubmitData } from '@/types/branch';

const CreateBranchPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.branch);
  const { divisions } = useSelector((state: RootState) => state.division);
  const { error, success } = useSelector((state: RootState) => state.ui);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getDivisions());
  }, [dispatch]);

  const handleSubmit = async (data: BranchFormSubmitData) => {
    try {
      setSubmitting(true);
      
      // Ensure the nested kontakPenanggungJawab object is properly formed
      const formattedData = {
        ...data,
        kontakPenanggungJawab: {
          nama: data.kontakPenanggungJawab?.nama || '',
          telepon: data.kontakPenanggungJawab?.telepon || '',
          email: data.kontakPenanggungJawab?.email || ''
        }
      };
      
      // Log the formatted data for debugging
      console.log("Submitting branch data:", JSON.stringify(formattedData, null, 2));
      
      // Validate required fields before dispatching
      if (!formattedData.kontakPenanggungJawab.nama) {
        throw new Error('Nama penanggung jawab wajib diisi');
      }
      
      if (!formattedData.kontakPenanggungJawab.telepon) {
        throw new Error('Telepon penanggung jawab wajib diisi');
      }
      
      await dispatch(createBranch(formattedData)).unwrap();
      router.push('/branch');
    } catch (error: any) {
      console.error('Error creating branch:', error);
      // Set error message in UI state
      dispatch(setError(error.message || 'Gagal membuat cabang baru'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  // Show loading indicator if divisions are not yet loaded
  if (divisions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Tambah Cabang Baru | Samudra ERP</title>
      </Head>
      
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" passHref>
            <MuiLink underline="hover" color="inherit">Dashboard</MuiLink>
          </Link>
          <Link href="/branch" passHref>
            <MuiLink underline="hover" color="inherit">Cabang</MuiLink>
          </Link>
          <Typography color="text.primary">Tambah Cabang Baru</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push('/branch')}
            sx={{ mr: 2 }}
          >
            Kembali
          </Button>
          <Typography variant="h4">Tambah Cabang Baru</Typography>
        </Box>
        
        <Paper sx={{ p: 3 }}>
          <BranchForm 
            onSubmit={handleSubmit}
            loading={submitting || loading}
          />
        </Paper>
      </Box>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default withAuth(CreateBranchPage);