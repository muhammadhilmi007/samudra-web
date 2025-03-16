// src/components/collection/CollectionForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Grid,
  Box,
  Divider
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getCustomers } from '../../store/slices/customerSlice';
import { getSTTs } from '../../store/slices/sttSlice';
import { createCollection, updateCollection } from '../../store/slices/collectionSlice';
import { Collection } from '../../types/collection';

// Validation schema
const collectionSchema = z.object({
  pelangganId: z.string().min(1, 'Pelanggan harus dipilih'),
  sttIds: z.array(z.string()).min(1, 'Minimal satu STT harus dipilih'),
  status: z.enum(['LUNAS', 'BELUM LUNAS'], { 
    errorMap: () => ({ message: 'Status harus dipilih' }) 
  }),
  tipePelanggan: z.enum(['Pengirim', 'Penerima'], { 
    errorMap: () => ({ message: 'Tipe pelanggan harus dipilih' }) 
  }),
});

type CollectionFormInputs = z.infer<typeof collectionSchema>;

interface CollectionFormProps {
  initialData?: Collection;
  onSubmit: (data: CollectionFormInputs) => void;
  loading?: boolean;
}

const CollectionForm: React.FC<CollectionFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { customers } = useSelector((state: RootState) => state.customer);
  const { sttList } = useSelector((state: RootState) => state.stt);

  // Fetch customers and STTs on component mount
  React.useEffect(() => {
    dispatch(getCustomers());
    dispatch(getSTTs());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CollectionFormInputs>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      pelangganId: initialData?.pelangganId || '',
      sttIds: initialData?.sttIds || [],
      status: initialData?.status || 'BELUM LUNAS',
      tipePelanggan: initialData?.tipePelanggan || 'Pengirim',
    },
  });

  // Watch selected customer to filter STTs
  const selectedCustomerId = watch('pelangganId');
  const selectedTipePelanggan = watch('tipePelanggan');

  // Filter STTs based on customer and type
  const filteredSTTs = React.useMemo(() => {
    return sttList.filter(stt => 
      (selectedTipePelanggan === 'Pengirim' ? stt.pengirimId : stt.penerimaId) === selectedCustomerId
    );
  }, [sttList, selectedCustomerId, selectedTipePelanggan]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Informasi Penagihan
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="tipePelanggan"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.tipePelanggan}>
                <InputLabel id="tipe-pelanggan-label">Tipe Pelanggan</InputLabel>
                <Select
                  {...field}
                  labelId="tipe-pelanggan-label"
                  label="Tipe Pelanggan"
                  disabled={loading}
                >
                  <MenuItem value="Pengirim">Pengirim</MenuItem>
                  <MenuItem value="Penerima">Penerima</MenuItem>
                </Select>
                {errors.tipePelanggan && (
                  <Typography variant="caption" color="error">
                    {errors.tipePelanggan.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="pelangganId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.pelangganId}>
                <InputLabel id="pelanggan-label">Pelanggan</InputLabel>
                <Select
                  {...field}
                  labelId="pelanggan-label"
                  label="Pelanggan"
                  disabled={loading}
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer._id} value={customer._id}>
                      {customer.nama}
                    </MenuItem>
                  ))}
                </Select>
                {errors.pelangganId && (
                  <Typography variant="caption" color="error">
                    {errors.pelangganId.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="sttIds"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControl fullWidth error={!!errors.sttIds}>
                <InputLabel id="stt-label">Pilih STT</InputLabel>
                <Select
                  labelId="stt-label"
                  label="Pilih STT"
                  multiple
                  value={value}
                  onChange={onChange}
                  disabled={loading || !selectedCustomerId}
                  renderValue={(selected) => `${selected.length} STT dipilih`}
                >
                  {filteredSTTs.map((stt) => (
                    <MenuItem key={stt._id} value={stt._id}>
                      {stt.noSTT} - {stt.namaBarang} ({stt.berat} kg)
                    </MenuItem>
                  ))}
                </Select>
                {errors.sttIds && (
                  <Typography variant="caption" color="error">
                    {errors.sttIds.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel id="status-label">Status Pembayaran</InputLabel>
                <Select
                  {...field}
                  labelId="status-label"
                  label="Status Pembayaran"
                  disabled={loading}
                >
                  <MenuItem value="LUNAS">Lunas</MenuItem>
                  <MenuItem value="BELUM LUNAS">Belum Lunas</MenuItem>
                </Select>
                {errors.status && (
                  <Typography variant="caption" color="error">
                    {errors.status.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            fullWidth
            sx={{ mt: 2 }}
          >
            {initialData ? 'Perbarui Penagihan' : 'Buat Penagihan'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CollectionForm;