// src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { getRoles } from '../../store/slices/employeeSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../../store';
import { useEffect } from 'react';

// Define the validation schema
const registerSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username hanya boleh berisi huruf, angka, dan karakter . _ -'),
  email: z.string().email('Format email tidak valid'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string()
    .min(1, 'Konfirmasi password diperlukan'),
  jabatan: z.string().min(2, 'Jabatan minimal 2 karakter'),
  roleId: z.string().min(1, 'Role harus dipilih'),
  telepon: z.string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .regex(/^[0-9+()-]+$/, 'Nomor telepon tidak valid'),
  alamat: z.string().min(5, 'Alamat minimal 5 karakter'),
  cabangId: z.string().min(1, 'Cabang harus dipilih'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { branches } = useSelector((state: RootState) => state.branch);
  const { roles } = useSelector((state: RootState) => state.employee);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Load branches and roles
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getRoles());
  }, [dispatch]);

  // Check if user has permission to register new users
  const hasPermission = isAuthenticated && user && (
    user.role === 'direktur' || 
    user.role === 'manajer_admin' || 
    user.role === 'manajer_sdm' || 
    user.role === 'kepala_cabang'
  );

  const { control, handleSubmit, reset, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nama: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      jabatan: '',
      roleId: '',
      telepon: '',
      alamat: '',
      cabangId: user?.cabangId || '',
    },
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    if (!hasPermission) {
      setError('Anda tidak memiliki izin untuk mendaftarkan pengguna baru');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const resultAction = await dispatch(register(data));
      unwrapResult(resultAction);
      
      setSuccess(true);
      reset();
      
      // Redirect after successful registration after 2 seconds
      setTimeout(() => {
        router.push('/employee');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // If not authenticated or no permission, show error
  if (!isAuthenticated || !hasPermission) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      maxWidth: 800, 
      width: '100%',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      borderRadius: 2,
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <Box mb={2}>
            <Typography variant="h5" component="h1" gutterBottom>
              Registrasi Pengguna Baru
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lengkapi formulir di bawah untuk mendaftarkan pengguna baru
            </Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Pengguna berhasil didaftarkan! Mengalihkan...
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="nama"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nama Lengkap"
                    variant="outlined"
                    fullWidth
                    error={!!errors.nama}
                    helperText={errors.nama?.message}
                    disabled={loading || success}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    variant="outlined"
                    fullWidth
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    disabled={loading || success}
                    autoComplete="username"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
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
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={loading || success}
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
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
                    label="Nomor Telepon"
                    variant="outlined"
                    fullWidth
                    error={!!errors.telepon}
                    helperText={errors.telepon?.message}
                    disabled={loading || success}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
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
                    disabled={loading || success}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="jabatan"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Jabatan"
                    variant="outlined"
                    fullWidth
                    error={!!errors.jabatan}
                    helperText={errors.jabatan?.message}
                    disabled={loading || success}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="cabangId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.cabangId}>
                    <InputLabel id="cabang-label">Cabang</InputLabel>
                    <Select
                      {...field}
                      labelId="cabang-label"
                      label="Cabang"
                      disabled={Boolean(loading || success || (user?.cabangId && user.role !== 'direktur'))}
                      startAdornment={
                        <InputAdornment position="start">
                          <BusinessIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {branches.map(branch => (
                        <MenuItem key={branch._id} value={branch._id}>
                          {branch.namaCabang}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.cabangId && (
                      <Typography variant="caption" color="error">
                        {errors.cabangId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.roleId}>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      {...field}
                      labelId="role-label"
                      label="Role"
                      disabled={loading || success}
                      startAdornment={
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {roles
                        // Filter roles based on user's own role
                        .filter(role => {
                          // Direktur can assign any role
                          if (user?.role === 'direktur') return true;
                          
                          // Manajer can't assign direktur role
                          if (role.kodeRole === 'direktur') return false;
                          
                          // Kepala cabang has limited role assignment
                          if (user?.role === 'kepala_cabang') {
                            return ['staff_admin', 'staff_penjualan', 'kasir', 'checker', 'supir'].includes(role.kodeRole);
                          }
                          
                          // Default case for other admin roles
                          return true;
                        })
                        .map(role => (
                          <MenuItem key={role._id} value={role._id}>
                            {role.namaRole}
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.roleId && (
                      <Typography variant="caption" color="error">
                        {errors.roleId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={loading || success}
                    autoComplete="new-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={toggleShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Konfirmasi Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    disabled={loading || success}
                    autoComplete="new-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={toggleShowConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="outlined"
              onClick={() => router.back()}
              disabled={loading || success}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || success}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Mendaftarkan...' : 'Daftarkan Pengguna'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;