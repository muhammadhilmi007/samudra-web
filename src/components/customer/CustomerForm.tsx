// src/components/customer/CustomerForm.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Typography,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Home as HomeIcon,
  LocationCity as LocationCityIcon,
  Public as PublicIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { Customer, CustomerFormInputs } from '../../types/customer';

// Validation schema
const customerSchema = z.object({
  nama: z.string().min(1, 'Nama customer wajib diisi'),
  tipe: z.enum(['Pengirim', 'Penerima', 'Keduanya'], {
    errorMap: () => ({ message: 'Tipe customer wajib dipilih' }),
  }),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  kelurahan: z.string().min(1, 'Kelurahan wajib diisi'),
  kecamatan: z.string().min(1, 'Kecamatan wajib diisi'),
  kota: z.string().min(1, 'Kota wajib diisi'),
  provinsi: z.string().min(1, 'Provinsi wajib diisi'),
  telepon: z.string().min(1, 'Telepon wajib diisi'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  perusahaan: z.string().optional().or(z.literal('')),
  cabangId: z.string().min(1, 'Cabang wajib dipilih'),
});

interface CustomerFormProps {
  initialData?: Partial<Customer>;
  onSubmit: (data: CustomerFormInputs) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);

  // Form setup with validation
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    reset
  } = useForm<CustomerFormInputs>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      nama: initialData?.nama || '',
      tipe: (initialData?.tipe as ('Pengirim' | 'Penerima' | 'Keduanya')) || 'Pengirim',
      alamat: initialData?.alamat || '',
      kelurahan: initialData?.kelurahan || '',
      kecamatan: initialData?.kecamatan || '',
      kota: initialData?.kota || '',
      provinsi: initialData?.provinsi || '',
      telepon: initialData?.telepon || '',
      email: initialData?.email || '',
      perusahaan: initialData?.perusahaan || '',
      cabangId: initialData?.cabangId || user?.cabangId || '',
    },
  });

  // Fetch branches on component mount
  useEffect(() => {
    if (branches.length === 0) {
      dispatch(getBranches());
    }
  }, [dispatch, branches.length]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        nama: initialData.nama || '',
        tipe: (initialData.tipe as ('Pengirim' | 'Penerima' | 'Keduanya')) || 'Pengirim',
        alamat: initialData.alamat || '',
        kelurahan: initialData.kelurahan || '',
        kecamatan: initialData.kecamatan || '',
        kota: initialData.kota || '',
        provinsi: initialData.provinsi || '',
        telepon: initialData.telepon || '',
        email: initialData.email || '',
        perusahaan: initialData.perusahaan || '',
        cabangId: initialData.cabangId || user?.cabangId || '',
      });
    }
  }, [initialData, reset, user?.cabangId]);

  // Auto fill address for testing (just for convenience)
  const handleAutoFillAddress = () => {
    setValue('alamat', 'Jl. Contoh No. 123', { shouldDirty: true });
    setValue('kelurahan', 'Kelurahan Contoh', { shouldDirty: true });
    setValue('kecamatan', 'Kecamatan Contoh', { shouldDirty: true });
    setValue('kota', 'Jakarta Selatan', { shouldDirty: true });
    setValue('provinsi', 'DKI Jakarta', { shouldDirty: true });
  };

  const handleFormSubmit = (data: CustomerFormInputs) => {
    onSubmit(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            Informasi Dasar
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="nama"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nama Customer *"
                fullWidth
                error={!!errors.nama}
                helperText={errors.nama?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="tipe"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.tipe} disabled={loading}>
                <InputLabel id="customer-type-label">Tipe Customer *</InputLabel>
                <Select
                  {...field}
                  labelId="customer-type-label"
                  label="Tipe Customer *"
                >
                  <MenuItem value="Pengirim">Pengirim</MenuItem>
                  <MenuItem value="Penerima">Penerima</MenuItem>
                  <MenuItem value="Keduanya">Keduanya</MenuItem>
                </Select>
                {errors.tipe && <FormHelperText>{errors.tipe.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="telepon"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nomor Telepon *"
                fullWidth
                error={!!errors.telepon}
                helperText={errors.telepon?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="email"
                label="Email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="perusahaan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nama Perusahaan (jika ada)"
                fullWidth
                error={!!errors.perusahaan}
                helperText={errors.perusahaan?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            Alamat
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              size="small"
              onClick={handleAutoFillAddress}
              disabled={loading}
            >
              Auto-fill untuk testing
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="alamat"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Alamat Lengkap *"
                fullWidth
                multiline
                rows={2}
                error={!!errors.alamat}
                helperText={errors.alamat?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
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
                label="Kelurahan *"
                fullWidth
                error={!!errors.kelurahan}
                helperText={errors.kelurahan?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon />
                    </InputAdornment>
                  ),
                }}
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
                label="Kecamatan *"
                fullWidth
                error={!!errors.kecamatan}
                helperText={errors.kecamatan?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon />
                    </InputAdornment>
                  ),
                }}
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
                label="Kota/Kabupaten *"
                fullWidth
                error={!!errors.kota}
                helperText={errors.kota?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCityIcon />
                    </InputAdornment>
                  ),
                }}
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
                label="Provinsi *"
                fullWidth
                error={!!errors.provinsi}
                helperText={errors.provinsi?.message}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublicIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            Informasi Tambahan
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="cabangId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.cabangId} disabled={loading || !!user?.cabangId}>
                <InputLabel id="branch-label">Cabang *</InputLabel>
                <Select
                  {...field}
                  labelId="branch-label"
                  label="Cabang *"
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id}>
                      {branch.namaCabang}
                    </MenuItem>
                  ))}
                </Select>
                {errors.cabangId && <FormHelperText>{errors.cabangId.message}</FormHelperText>}
              </FormControl>
            )}
          />
          {user?.cabangId && (
            <FormHelperText>
              Customer akan secara otomatis ditambahkan ke cabang Anda saat ini
            </FormHelperText>
          )}
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
                startIcon={<ArrowBackIcon />}
              >
                Batal
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={loading || (!isDirty && !!initialData)}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ ml: onCancel ? 2 : 0, flexGrow: onCancel ? 0 : 1 }}
            >
              {initialData ? 'Perbarui Customer' : 'Tambah Customer'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerForm;