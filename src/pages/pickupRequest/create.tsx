import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Box, TextField, MenuItem, Button, Paper } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import { RootState, AppDispatch } from '../../store';
import { createPickupRequest } from '../../store/slices/pickupRequestSlice';
import { getCustomers } from '../../store/slices/customerSlice';
import { PickupRequestFormInputs } from '../../types/pickupRequest';

import Layout from '../../components/layout/Layout';
import PageHeader from '../../components/shared/PageHeader';

// Validation schema
const pickupRequestSchema = z.object({
  pengirimId: z.string().min(1, "Pengirim harus dipilih"),
  alamatPengambilan: z.string().min(1, "Alamat pengambilan harus diisi"),
  tujuan: z.string().min(1, "Tujuan harus diisi"),
  jumlahColly: z.number().min(1, "Jumlah colly harus lebih dari 0"),
  cabangId: z.string().min(1, "Cabang harus dipilih")
});

const CreatePickupRequestPage: NextPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const { customers } = useSelector((state: RootState) => state.customer);
  const { user } = useSelector((state: RootState) => state.auth);

  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm<PickupRequestFormInputs>({
    resolver: zodResolver(pickupRequestSchema),
    defaultValues: {
      pengirimId: '',
      alamatPengambilan: '',
      tujuan: '',
      jumlahColly: 1,
      cabangId: user?.cabangId || ''
    }
  });

  useEffect(() => {
    dispatch(getCustomers());
  }, [dispatch]);

  const onSubmit = async (data: PickupRequestFormInputs) => {
    try {
      await dispatch(createPickupRequest(data)).unwrap();
      router.push('/pickup');
    } catch (error) {
      console.error('Failed to create pickup request', error);
    }
  };

  const handleBack = () => {
    router.push('/pickup');
  };

  return (
    <Layout>
      <PageHeader 
        title="Buat Permintaan Pengambilan"
        breadcrumbs={[
          { label: 'Pickup', href: '/pickup' },
          { label: 'Buat Permintaan' }
        ]}
        action={{
          label: "Kembali",
          onClick: handleBack,
          icon: <ArrowBack />
        }}
      />

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ '& > :not(style)': { mb: 3 } }}>
          <Controller
            name="pengirimId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label="Pengirim"
                error={!!errors.pengirimId}
                helperText={errors.pengirimId?.message}
              >
                <MenuItem value="">Pilih Pengirim</MenuItem>
                {customers.map(customer => (
                  <MenuItem key={customer._id} value={customer._id}>
                    {customer.nama} - {customer.telepon}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="alamatPengambilan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Alamat Pengambilan"
                placeholder="Masukkan alamat pengambilan"
                error={!!errors.alamatPengambilan}
                helperText={errors.alamatPengambilan?.message}
              />
            )}
          />

          <Controller
            name="tujuan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Tujuan"
                placeholder="Masukkan tujuan pengiriman"
                error={!!errors.tujuan}
                helperText={errors.tujuan?.message}
              />
            )}
          />

          <Controller
            name="jumlahColly"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <TextField
                {...field}
                type="number"
                fullWidth
                label="Jumlah Colly"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                InputProps={{ inputProps: { min: 1 } }}
                error={!!errors.jumlahColly}
                helperText={errors.jumlahColly?.message}
              />
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={handleBack}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
            >
              Simpan
            </Button>
          </Box>
        </Box>
      </Paper>
    </Layout>
  );
};

export default CreatePickupRequestPage;
