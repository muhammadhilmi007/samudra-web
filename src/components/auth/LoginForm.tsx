// src/components/auth/LoginForm.tsx
import React, { useState, useEffect } from 'react';
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
  Link,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '../../store';

// Define the validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username diperlukan'),
  password: z.string().min(1, 'Password diperlukan'),
  rememberMe: z.boolean().optional(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    username: '',
    password: '',
    rememberMe: false,
  },
});

const onSubmit = async (data: LoginFormInputs) => {
  setLoading(true);
  setError(null);
  
  try {
    const resultAction = await dispatch(login({ 
      username: data.username, 
      password: data.password 
    }));
    
    unwrapResult(resultAction);
    
    // If rememberMe is checked, save the token in localStorage
    // This is handled in the slice, but we can use this flag for other user preferences
    if (data.rememberMe) {
      localStorage.setItem('prefersDarkMode', 'true');
    }
    
    // Navigation will be handled by the useEffect monitoring isAuthenticated
  } catch (error: any) {
    setError(error.message || 'Login gagal. Silakan periksa username dan password Anda.');
  } finally {
    setLoading(false);
  }
};

const handleClickShowPassword = () => {
  setShowPassword(!showPassword);
};

return (
  <Card sx={{ 
    maxWidth: 450, 
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
        <Box textAlign="center" mb={3}>
          <img 
            src="/logo.png" 
            alt="Samudra ERP Logo" 
            style={{ height: 60, marginBottom: 16 }} 
          />
          <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
            Login ke Samudra ERP
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Masukkan kredensial Anda untuk mengakses sistem
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
              disabled={loading}
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
              disabled={loading}
              autoComplete="current-password"
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
                      onClick={handleClickShowPassword}
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

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    color="primary"
                    checked={field.value}
                  />
                }
                label="Ingat saya"
              />
            )}
          />
          
          <Link href="/forgot-password" underline="hover" variant="body2">
            Lupa password?
          </Link>
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading}
          sx={{ mt: 2, py: 1.5 }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Memproses...' : 'Login'}
        </Button>
        
        <Box mt={2} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} PT. Sarana Mudah Raya. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);
};

export default LoginForm;