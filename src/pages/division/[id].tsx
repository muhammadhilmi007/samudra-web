// src/pages/division/[id].tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import PageHeader from '../../components/shared/PageHeader';
import DivisionDetail from '../../components/division/DivisionDetail';
import DivisionForm from '../../components/division/DivisionForm';
import FormDialog from '../../components/shared/FormDialog';
import withAuth from '../../components/auth/withAuth';
import { RootState, AppDispatch } from '../../store';
import { getDivisionById, updateDivision } from '../../store/slices/divisionSlice';

const DivisionDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  const { division, loading } = useSelector((state: RootState) => state.division);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(getDivisionById(id));
    }
  }, [dispatch, id]);

  const handleEditClick = () => {
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: { namaDivisi: string }) => {
    if (id && typeof id === 'string') {
      await dispatch(updateDivision({ id, divisionData: data }));
      setFormOpen(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Detail Divisi | Samudra ERP</title>
        <meta name="description" content="Detail Divisi Samudra ERP" />
      </Head>
      
      <Container maxWidth="lg">
        <PageHeader
          title="Detail Divisi"
          subtitle={division?.namaDivisi || 'Memuat...'}
          breadcrumbs={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Divisi', href: '/division' },
            { label: division?.namaDivisi || 'Detail' },
          ]}
        />
        
        <Box mt={3}>
          {id && typeof id === 'string' && (
            <DivisionDetail id={id} onEdit={handleEditClick} />
          )}
        </Box>
        
        {division && (
          <FormDialog
            open={formOpen}
            onClose={() => setFormOpen(false)}
            title="Edit Divisi"
            maxWidth="sm"
          >
            <DivisionForm
              initialData={division}
              onSubmit={handleFormSubmit}
              loading={loading}
            />
          </FormDialog>
        )}
      </Container>
    </Layout>
  );
};

export default withAuth()(DivisionDetailPage);