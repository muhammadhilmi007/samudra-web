// src/pages/branch/create.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  Container,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import BranchForm from '../../components/branch/BranchForm';
import withAuth from '../../components/auth/withAuth';
import { RootState, AppDispatch } from '../../store';
import { createBranch, clearBranch } from '../../store/slices/branchSlice';
import { BranchFormInputs } from '../../types/branch';

const CreateBranchPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.branch);
  const [formData, setFormData] = useState<BranchFormInputs | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clean up when leaving page
  React.useEffect(() => {
    return () => {
      dispatch(clearBranch());
    };
  }, [dispatch]);

  const handleSubmit = async (data: BranchFormInputs) => {
    setFormData(data);
    setLocalError(null);
    
    try {
      await dispatch(createBranch(data)).unwrap();
      router.push('/branch');
    } catch (error: any) {
      console.error('Error creating branch:', error);
      setLocalError(error.message || 'Gagal membuat cabang baru. Silakan coba lagi.');
    }
  };

  const handleCancel = () => {
    router.push('/branch');
  };

  return (
    <>
      <Head>
        <title>Tambah Cabang Baru | Samudra ERP</title>
      </Head>
      
      <Container maxWidth="lg">
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link href="/dashboard" passHref>
              <MuiLink underline="hover" color="inherit">Dashboard</MuiLink>
            </Link>
            <Link href="/branch" passHref>
              <MuiLink underline="hover" color="inherit">Cabang</MuiLink>
            </Link>
            <Typography color="text.primary">Tambah Cabang Baru</Typography>
          </Breadcrumbs>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={handleCancel}
                variant="outlined"
              >
                Kembali
              </Button>
              <Typography variant="h4" component="h1">
                Tambah Cabang Baru
              </Typography>
            </Box>
          </Box>
          
          {/* Stepper - Optional for visual guidance */}
          <Stepper 
            activeStep={1} 
            alternativeLabel 
            sx={{ mb: 4, display: { xs: 'none', md: 'flex' } }}
          >
            <Step completed>
              <StepLabel StepIconProps={{ icon: <BusinessIcon /> }}>
                Pilih Divisi
              </StepLabel>
            </Step>
            <Step active>
              <StepLabel StepIconProps={{ icon: <LocationIcon /> }}>
                Isi Data Cabang
              </StepLabel>
            </Step>
            <Step>
              <StepLabel StepIconProps={{ icon: <PersonIcon /> }}>
                Tentukan Penanggung Jawab
              </StepLabel>
            </Step>
            <Step>
              <StepLabel StepIconProps={{ icon: <SaveIcon /> }}>
                Simpan Cabang
              </StepLabel>
            </Step>
          </Stepper>

          {/* Info Card */}
          <Card sx={{ mb: 3, borderLeft: 5, borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Membuat Cabang Baru
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cabang merupakan bagian penting dalam struktur perusahaan. Lengkapi semua data yang diperlukan
                untuk membuat cabang baru. Pastikan telah memilih divisi yang benar dan mengisi alamat lengkap
                serta informasi penanggung jawab cabang.
              </Typography>
            </CardContent>
          </Card>
          
          {/* Errors */}
          {(error || localError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || localError}
            </Alert>
          )}
          
          {/* Form */}
          <Paper sx={{ p: 3 }}>
            <BranchForm
              loading={loading}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default withAuth(CreateBranchPage);