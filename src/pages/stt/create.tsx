import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { RootState, AppDispatch } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getCustomers } from '../../store/slices/customerSlice';
import { getForwarders } from '../../store/slices/forwarderSlice';
import { STTFormInputs } from '../../types/stt';

import Layout from '../../components/layout/Layout';
import PageHeader from '../../components/shared/PageHeader';

// Validation schema
const sttSchema = z.object({
  cabangAsalId: z.string().min(1, "Cabang asal harus dipilih"),
  cabangTujuanId: z.string().min(1, "Cabang tujuan harus dipilih"),
  pengirimId: z.string().min(1, "Pengirim harus dipilih"),
  penerimaId: z.string().min(1, "Penerima harus dipilih"),
  namaBarang: z.string().min(1, "Nama barang harus diisi"),
  komoditi: z.string().min(1, "Komoditi harus diisi"),
  packing: z.string().min(1, "Jenis kemasan harus diisi"),
  jumlahColly: z.number().min(1, "Jumlah colly harus lebih dari 0"),
  berat: z.number().min(0.1, "Berat harus lebih dari 0"),
  hargaPerKilo: z.number().min(0, "Harga per kilo harus tidak negatif"),
  harga: z.number().min(0, "Total harga harus tidak negatif"),
  keterangan: z.string().optional(),
  kodePenerus: z.string().optional(),
  penerusId: z.string().optional(),
  paymentType: z.enum(['CASH', 'COD', 'CAD'], {
    errorMap: () => ({ message: "Tipe pembayaran harus dipilih" })
  })
});

const CreateSTTPage: NextPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  useSelector((state: RootState) => state.branch);
  useSelector((state: RootState) => state.customer);
  const { user } = useSelector((state: RootState) => state.auth);
  const { forwarders } = useSelector((state: RootState) => state.forwarder);

  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    setValue  } = useForm<STTFormInputs>({
    resolver: zodResolver(sttSchema),
    defaultValues: {
      cabangAsalId: user?.cabangId || '',
      jumlahColly: 1,
      berat: 0,
      hargaPerKilo: 0,
      harga: 0,
      kodePenerus: '70' // Default kode forwarding
    }
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getCustomers());
    dispatch(getForwarders());
  }, [dispatch]);

  // Automatic harga calculation
  const watchBerat = watch('berat');
  const watchHargaPerKilo = watch('hargaPerKilo');

  useEffect(() => {
    const harga = watchBerat * watchHargaPerKilo;
    setValue('harga', Number(harga.toFixed(2)));
  }, [watchBerat, watchHargaPerKilo, setValue]);

  const onSubmit = async (data: STTFormInputs) => {
    try {
      router.push('/stt');
    } catch (error) {
      console.error('Failed to create STT', error);
    }
  };

  return (
    <Layout>
      <PageHeader 
        title="Buat Surat Tanda Terima (STT)" 
        backLink="/stt"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Previous form sections remain the same */}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kode Penerus</label>
            <Controller
              name="kodePenerus"
              control={control}
              render={({ field }) => (
                <select 
                  {...field} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                >
                  <option value="70">Tanpa Forwarding</option>
                  <option value="71">Forwarding Dibayar Pengirim</option>
                  <option value="72">Forwarding Dibayar Penerima</option>
                  <option value="73">Forwarding Dimajukan Cabang Penerima</option>
                </select>
              )}
            />
            {errors.kodePenerus && (
              <p className="mt-1 text-red-500 text-sm">{errors.kodePenerus.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Penerus (Opsional)</label>
            <Controller
              name="penerusId"
              control={control}
              render={({ field }) => (
                <select 
                  {...field} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                >
                  <option value="">Pilih Penerus</option>
                  {forwarders.map(forwarder => (
                    <option key={forwarder._id} value={forwarder._id}>
                      {forwarder.namaPenerus}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.penerusId && (
              <p className="mt-1 text-red-500 text-sm">{errors.penerusId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipe Pembayaran</label>
            <Controller
              name="paymentType"
              control={control}
              render={({ field }) => (
                <select 
                  {...field} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                >
                  <option value="">Pilih Tipe Pembayaran</option>
                  <option value="CASH">Dibayar Dimuka (CASH)</option>
                  <option value="COD">Bayar di Tempat (COD)</option>
                  <option value="CAD">Bayar Setelah Diterima (CAD)</option>
                </select>
              )}
            />
            {errors.paymentType && (
              <p className="mt-1 text-red-500 text-sm">{errors.paymentType.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Keterangan Tambahan</label>
          <Controller
            name="keterangan"
            control={control}
            render={({ field }) => (
              <textarea 
                {...field} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                placeholder="Masukkan keterangan tambahan (opsional)"
                rows={3}
              />
            )}
          />
          {errors.keterangan && (
            <p className="mt-1 text-red-500 text-sm">{errors.keterangan.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => router.push('/stt')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Simpan STT
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default CreateSTTPage;