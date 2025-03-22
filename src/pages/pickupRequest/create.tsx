import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { RootState, AppDispatch } from '../../store';
import { createPickupRequest } from '../../store/slices/pickupRequestSlice';
import { getCustomers } from '../../store/slices/customerSlice';
import { PickupRequestFormInputs } from '../../types/pickupRequest';

import Layout from '../../components/layout/layout';
import PageHeader from '../../components/shared/PageHeader';

// Validation schema
const pickupRequestSchema = z.object({
  pengirimId: z.string().min(1, "Pengirim harus dipilih"),
  alamatPengambilan: z.string().min(1, "Alamat pengambilan harus diisi"),
  tujuan: z.string().min(1, "Tujuan harus diisi"),
  jumlahColly: z.number().min(1, "Jumlah colly harus lebih dari 0")
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

  return (
    <Layout>
      <PageHeader 
        title="Buat Permintaan Pengambilan" 
        backLink="/pickup"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Pengirim</label>
          <Controller
            name="pengirimId"
            control={control}
            render={({ field }) => (
              <select 
                {...field} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
              >
                <option value="">Pilih Pengirim</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.nama} - {customer.telepon}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.pengirimId && (
            <p className="mt-1 text-red-500 text-sm">{errors.pengirimId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Alamat Pengambilan</label>
          <Controller
            name="alamatPengambilan"
            control={control}
            render={({ field }) => (
              <input 
                {...field} 
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                placeholder="Masukkan alamat pengambilan"
              />
            )}
          />
          {errors.alamatPengambilan && (
            <p className="mt-1 text-red-500 text-sm">{errors.alamatPengambilan.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tujuan</label>
          <Controller
            name="tujuan"
            control={control}
            render={({ field }) => (
              <input 
                {...field} 
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                placeholder="Masukkan tujuan pengiriman"
              />
            )}
          />
          {errors.tujuan && (
            <p className="mt-1 text-red-500 text-sm">{errors.tujuan.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Jumlah Colly</label>
          <Controller
            name="jumlahColly"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <input 
                {...field} 
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                placeholder="Masukkan jumlah colly"
                min={1}
              />
            )}
          />
          {errors.jumlahColly && (
            <p className="mt-1 text-red-500 text-sm">{errors.jumlahColly.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => router.push('/pickup')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Simpan
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default CreatePickupRequestPage;