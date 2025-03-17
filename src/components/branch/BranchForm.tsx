// src/components/branch/BranchForm.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getDivisions } from '../../store/slices/divisionSlice';
import { Branch } from '../../types/branch';

// Validation schema
const branchSchema = z.object({
  namaCabang: z.string().min(1, 'Nama cabang harus diisi'),
  divisiId: z.string().min(1, 'Divisi harus dipilih'),
  alamat: z.string().min(1, 'Alamat harus diisi'),
  kelurahan: z.string().min(1, 'Kelurahan harus diisi'),
  kecamatan: z.string().min(1, 'Kecamatan harus diisi'),
  kota: z.string().min(1, 'Kota harus diisi'),
  provinsi: z.string().min(1, 'Provinsi harus diisi'),
  kontakPenanggungJawab: z.object({
    nama: z.string().min(1, 'Nama penanggung jawab harus diisi'),
    telepon: z.string().min(1, 'Telepon penanggung jawab harus diisi'),
    email: z.string().email('Format email tidak valid'),
  }),
});

type BranchFormInputs = z.infer<typeof branchSchema>;

interface BranchFormProps {
  initialData?: Branch;
  onSubmit: (data: BranchFormInputs) => void;
  loading?: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { divisions } = useSelector((state: RootState) => state.division);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchFormInputs>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      namaCabang: initialData?.namaCabang || '',
      divisiId: initialData?.divisiId || '',
      alamat: initialData?.alamat || '',
      kelurahan: initialData?.kelurahan || '',
      kecamatan: initialData?.kecamatan || '',
      kota: initialData?.kota || '',
      provinsi: initialData?.provinsi || '',
      kontakPenanggungJawab: {
        nama: initialData?.kontakPenanggungJawab?.nama || '',
        telepon: initialData?.kontakPenanggungJawab?.telepon || '',
        email: initialData?.kontakPenanggungJawab?.email || '',
      },
    },
  });

  useEffect(() => {
    dispatch(getDivisions());
  }, [dispatch]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Informasi Cabang
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="namaCabang"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nama Cabang"
                variant="outlined"
                fullWidth
                error={!!errors.namaCabang}
                helperText={errors.namaCabang?.message}
                disabled={loading}
                autoFocus
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="divisiId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.divisiId}>
                <InputLabel id="divisi-label">Divisi</InputLabel>
                <Select
                  {...field}
                  labelId="divisi-label"
                  label="Divisi"
                  disabled={loading}
                >
                  {divisions.map((division) => (
                    <MenuItem key={division._id} value={division._id}>
                      {division.namaDivisi}
                    </MenuItem>
                  ))}
                </Select>
                {errors.divisiId && (
                  <Typography variant="caption" color="error">
                    {errors.divisiId.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="alamat"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Alamat"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                error={!!errors.alamat}
                helperText={errors.alamat?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="kelurahan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Kelurahan"
                variant="outlined"
                fullWidth
                error={!!errors.kelurahan}
                helperText={errors.kelurahan?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="kecamatan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Kecamatan"
                variant="outlined"
                fullWidth
                error={!!errors.kecamatan}
                helperText={errors.kecamatan?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="kota"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Kota"
                variant="outlined"
                fullWidth
                error={!!errors.kota}
                helperText={errors.kota?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="provinsi"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Provinsi"
                variant="outlined"
                fullWidth
                error={!!errors.provinsi}
                helperText={errors.provinsi?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
            Informasi Penanggung Jawab
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="kontakPenanggungJawab.nama"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nama Penanggung Jawab"
                variant="outlined"
                fullWidth
                error={!!errors.kontakPenanggungJawab?.nama}
                helperText={errors.kontakPenanggungJawab?.nama?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="kontakPenanggungJawab.telepon"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Telepon Penanggung Jawab"
                variant="outlined"
                fullWidth
                error={!!errors.kontakPenanggungJawab?.telepon}
                helperText={errors.kontakPenanggungJawab?.telepon?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="kontakPenanggungJawab.email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email Penanggung Jawab"
                variant="outlined"
                fullWidth
                error={!!errors.kontakPenanggungJawab?.email}
                helperText={errors.kontakPenanggungJawab?.email?.message}
                disabled={loading}
              />
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
            {initialData ? 'Perbarui' : 'Simpan'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BranchForm;