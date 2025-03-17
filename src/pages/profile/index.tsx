// src/pages/profile/index.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  TextField,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Contacts as ContactsIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getCurrentUser, changePassword } from '../../store/slices/authSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { ChangePasswordParams } from '../../types/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import withAuth from '../../components/auth/withAuth';

// Schema for password change validation
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string()
    .min(8, 'Password baru minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  const [changePasswordDialog, setChangePasswordDialog] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordParams>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const handleOpenChangePasswordDialog = () => {
    setChangePasswordDialog(true);
    reset();
  };

  const handleCloseChangePasswordDialog = () => {
    setChangePasswordDialog(false);
  };

  const onSubmitPasswordChange = (data: ChangePasswordParams) => {
    dispatch(changePassword(data)).then((result) => {
      if (!result.error) {
        handleCloseChangePasswordDialog();
      }
    });
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  if (loading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Profil Pengguna - Samudra ERP</title>
      </Head>

      <Box>
        <Typography variant="h4" mb={3}>Profil Pengguna</Typography>

        <Paper sx={{ width: '100%', mb: 2, p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar 
                  src={user?.fotoProfil || undefined} 
                  alt={user?.nama || 'User'}
                  sx={{ width: 150, height: 150, mb: 2 }}
                >
                  {!user?.fotoProfil && <PersonIcon sx={{ fontSize: 80 }} />}
                </Avatar>
                
                <Typography variant="h5" align="center">{user?.nama}</Typography>
                <Typography variant="body1" color="text.secondary" align="center">
                  {user?.jabatan}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {user?.cabang?.namaCabang || 'Tidak ada cabang'}
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={handleOpenChangePasswordDialog}
                  sx={{ mt: 3 }}
                >
                  Ubah Password
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <BadgeIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Informasi Personal</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Nama Lengkap
                        </Typography>
                        <Typography variant="body1">
                          {user?.nama || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Username
                        </Typography>
                        <Typography variant="body1">
                          {user?.username || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Jabatan
                        </Typography>
                        <Typography variant="body1">
                          {user?.jabatan || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Role
                        </Typography>
                        <Typography variant="body1">
                          {user?.role || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ContactsIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Kontak & Alamat</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box mb={2} display="flex" alignItems="center">
                        <EmailIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body1">
                            {user?.email || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box mb={2} display="flex" alignItems="center">
                        <PhoneIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Telepon
                          </Typography>
                          <Typography variant="body1">
                            {user?.telepon || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box mb={2} display="flex" alignItems="flex-start">
                        <LocationOnIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary', mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Alamat
                          </Typography>
                          <Typography variant="body1">
                            {user?.alamat || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <InfoIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Informasi Akun</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Typography variant="body1">
                          {user?.aktif ? 'Aktif' : 'Tidak Aktif'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Dibuat Pada
                        </Typography>
                        <Typography variant="body1">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : '-'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialog} onClose={handleCloseChangePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Ubah Password</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmitPasswordChange)}>
          <DialogContent>
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password Saat Ini"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword?.message}
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
                  type="password"
                  fullWidth
                  margin="normal"
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                />
              )}
            />
            
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Konfirmasi Password Baru"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseChangePasswordDialog}>Batal</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Simpan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar untuk notifikasi */}
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default withAuth(ProfilePage);