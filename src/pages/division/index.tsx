import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container } from '@mui/material';
import Layout from '../../components/layout/Layout';
import PageHeader from '../../components/shared/PageHeader';
import DivisionList from '../../components/division/DivisionList';
import withAuth from '../../components/auth/withAuth';
import { Division } from '../../types/division';

const DivisionsPage: NextPage = () => {
  const router = useRouter();

  const handleEdit = (division: Division) => {
    router.push(`/division/${division._id}`);
  };

  return (
    <Layout>
      <Head>
        <title>Divisi | Samudra ERP</title>
        <meta name="description" content="Manajemen Divisi Samudra ERP" />
      </Head>
      
      <Container maxWidth="lg">
        <PageHeader
          title="Manajemen Divisi"
          subtitle="Kelola struktur divisi perusahaan"
          breadcrumbs={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Divisi' },
          ]}
        />
        
        <DivisionList onEdit={handleEdit} />
      </Container>
    </Layout>
  );
};

export default withAuth()(DivisionsPage);