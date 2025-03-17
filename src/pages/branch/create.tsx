// src/pages/branch/create.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createBranch } from '../../store/slices/branchSlice';
import BranchForm from '../../components/branch/BranchForm';
import withAuth from '../../components/auth/withAuth';

const CreateBranchPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (branchData: any) => {
    try {
      await dispatch(createBranch(branchData)).unwrap();
      router.push('/branch');
    } catch (error) {
      console.error('Failed to create branch:', error);
    }
  };

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
          <BranchForm onSubmit={handleSubmit} />
        </Paper>
      </Box>
    </>
  );
};

export default withAuth(CreateBranchPage);