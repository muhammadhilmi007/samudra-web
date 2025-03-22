// src/components/auth/ChangePasswordForm.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/index';
import { changePassword } from '../../store/slices/authSlice';
import { unwrapResult } from '@reduxjs/toolkit';

// Define the validation schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini diperlukan'),
  newPassword: z.string()
    .min(8, 'Password baru minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus berisi minimal 1 huruf kapital')
    .regex(/[a-z]/, 'Password harus berisi minimal 1 huruf kecil')
    .regex(/[0-9]/, 'Password harus berisi minimal 1 angka')
    .regex(/[@$!%*?&]/, 'Password harus berisi minimal 1 karakter spesial (@$!%*?&)'),
  confirmPassword: z.string().min(1, 'Konfirmasi password diperlukan'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password dan konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

type ChangePasswordFormInputs = z.infer<typeof changePasswordSchema>;

const ChangePasswordForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordFormInputs>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormInputs) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const resultAction = await dispatch(
        changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.newPassword // or data.confirmPassword if you have it
        })
      );
      unwrapResult(resultAction);
      
      setSuccess('Password berhasil diubah');
      reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Gagal mengubah password. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      display="flex"
      flexDirection="column"
      gap={3}
    >
      <Typography variant="h6" gutterBottom>
        Ubah Password
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Controller
        name="currentPassword"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Password Saat Ini"
            type={showCurrentPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle current password visibility"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      <Controller
        name="newPassword"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Password Baru"
            type={showNewPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle new password visibility"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

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
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
      >
        {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
      </Button>
    </Box>
  );
};

export default ChangePasswordForm;