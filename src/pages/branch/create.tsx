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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import BranchForm from '../../components/branch/BranchForm';
import withAuth from '../../components/auth/withAuth';
import { z } from 'zod';

// Import the branch schema type
const branchSchema = z.object({
  namaCabang: z.string().min(1, "Nama cabang harus diisi"),
  divisiId: z.string().min(1, "Divisi harus dipilih"),
  alamat: z.string().min(1, "Alamat harus diisi"),
  kelurahan: z.string().min(1, "Kelurahan harus diisi"),
  kecamatan: z.string().min(1, "Kecamatan harus diisi"),
  kota: z.string().min(1, "Kota harus diisi"),
  provinsi: z.string().min(1, "Provinsi harus diisi"),
  kontakPenanggungJawab: z.object({
    nama: z.string().min(1, "Nama penanggung jawab harus diisi"),
    telepon: z.string().min(1, "Telepon penanggung jawab harus diisi"),
    email: z.string().email("Format email tidak valid"),
  }),
});

type BranchFormInputs = z.infer<typeof branchSchema>;

const CreateBranchPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <BranchForm
            loading={false}
            onSubmit={undefined} // Let BranchForm handle the submission
          />
        </Paper>
      </Box>
    </>
  );
};

export default withAuth(CreateBranchPage);