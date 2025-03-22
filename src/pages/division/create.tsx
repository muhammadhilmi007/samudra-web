// src/pages/division/create.tsx
import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container, Paper, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/layout/layout';
import PageHeader from '../../components/shared/PageHeader';
import DivisionForm from '../../components/division/DivisionForm';
import withAuth from '../../components/auth/withAuth';
import { RootState, AppDispatch } from '../../store';
import { createDivision } from '../../store/slices/divisionSlice';

const CreateDivisionPage: NextPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.division);

  const handleSubmit = async (data: { namaDivisi: string }) => {
    try {
      await dispatch(createDivision(data));
      router.push('/division');
    } catch (error) {
      console.error('Error creating division:', error);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Tambah Divisi | Samudra ERP</title>
        <meta name="description" content="Tambah Divisi Baru Samudra ERP" />
      </Head>
      
      <Container maxWidth="md">
        <PageHeader
          title="Tambah Divisi"
          subtitle="Buat divisi baru dalam struktur perusahaan"
          breadcrumbs={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Divisi', href: '/division' },
            { label: 'Tambah Divisi' },
          ]}
        />
        
        <Box mt={3}>
          <Paper sx={{ p: 3 }}>
            <DivisionForm onSubmit={handleSubmit} loading={loading} />
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};

export default withAuth(CreateDivisionPage);