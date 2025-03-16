// src/components/auth/LoginForm.tsx
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
  useTheme,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { unwrapResult } from '@reduxjs/toolkit';

// Define the validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username diperlukan'),
  password: z.string().min(1, 'Password diperlukan'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    setError(null);
    
    try {
      // @ts-ignore (dispatch is typed incorrectly for async thunks)
      const resultAction = await dispatch(login({ username: data.username, password: data.password }));
      unwrapResult(resultAction);
      
      // Redirect to dashboard on successful login
      router.push('/dashboard');
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
      maxWidth: 400, 
      width: '100%',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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
          <Box textAlign="center" mb={2}>
            <Typography variant="h4" component="h1" gutterBottom>
              Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Masuk ke Sistem ERP Samudra
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

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoginForm;