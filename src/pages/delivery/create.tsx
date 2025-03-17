// src/pages/delivery/create.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  CircularProgress,
  Divider,
  FormHelperText,
  Alert,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  DirectionsCar as CarIcon,
  SupervisorAccount as SupervisorIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getVehicleQueues, createDelivery } from '../../store/slices/deliverySlice';
import { getSTTsByStatus } from '../../store/slices/sttSlice';
import { getEmployeesByBranch } from '../../store/slices/employeeSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import withAuth from '../../components/auth/withAuth';

// Schema for delivery form validation
const deliverySchema = z.object({
  antrianKendaraanId: z.string().min(1, 'Kendaraan wajib dipilih'),
  sttIds: z.array(z.string()).min(1, 'Minimal satu STT wajib dipilih'),
  checkerId: z.string().min(1, 'Checker wajib dipilih'),
  adminId: z.string().min(1, 'Admin wajib dipilih'),
  estimasiLansir: z.string().optional(),
  kilometerBerangkat: z.number().min(0, 'Kilometer berangkat tidak valid'),
  cabangId: z.string().min(1, 'Cabang wajib dipilih'),
});

type DeliveryFormInputs = z.infer<typeof deliverySchema>;

const CreateDeliveryPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { vehicleQueues, loading } = useSelector((state: RootState) => state.delivery);
  const { sttList } = useSelector((state: RootState) => state.stt);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);
  const { error, success } = useSelector((state: RootState) => state.ui);
  
  const [availableSTTs, setAvailableSTTs] = useState<any[]>([]);
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeliveryFormInputs>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      antrianKendaraanId: '',
      sttIds: [],
      checkerId: '',
      adminId: '',
      estimasiLansir: '',
      kilometerBerangkat: 0,
      cabangId: user?.cabangId || '',
    },
  });
  
  const cabangId = watch('cabangId');
  const selectedSTTIds = watch('sttIds') || [];
  
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getSTTsByStatus('MUAT')); // Get STTs that have been loaded but not delivered
    
    if (cabangId) {
      dispatch(getVehicleQueues());
      dispatch(getEmployeesByBranch(cabangId));
    }
  }, [dispatch, cabangId]);
  
  useEffect(() => {
    // Filter STTs for delivery
    const filteredSTTs = sttList.filter((stt) => 
      stt.status === 'MUAT' && stt.cabangTujuanId === cabangId
    );
    setAvailableSTTs(filteredSTTs);
  }, [sttList, cabangId]);
  
  const handleCloseAlert = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };
  
  const onSubmit = (data: DeliveryFormInputs) => {
    dispatch(createDelivery(data))
      .unwrap()
      .then((res) => {
        router.push(`/delivery/${res._id}`);
      })
      .catch((err) => {
        console.error('Failed to create delivery:', err);
      });
  };
  
  // Filter employees by role
  const checkers = employees.filter((emp) => 
    emp.jabatan?.toLowerCase().includes('checker') || 
    emp.role?.toLowerCase().includes('checker')
  );
  
  const admins = employees.filter((emp) => 
    emp.jabatan?.toLowerCase().includes('admin') || 
    emp.role?.toLowerCase().includes('admin')
  );
  
  // Filter vehicle queues that are waiting (not in delivery)
  const availableVehicleQueues = vehicleQueues.filter((queue) => 
    queue.status === 'MENUNGGU'
  );
  
  return (
    <>
      <Head>
        <title>Buat Pengiriman Baru | Samudra ERP</title>
      </Head>
      
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" passHref>
            <MuiLink underline="hover" color="inherit">Dashboard</MuiLink>
          </Link>
          <Link href="/delivery" passHref>
            <MuiLink underline="hover" color="inherit">Pengiriman</MuiLink>
          </Link>
          <Typography color="text.primary">Buat Pengiriman</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push('/delivery')}
            sx={{ mr: 2 }}
          >
            Kembali
          </Button>
          <Typography variant="h4">Buat Pengiriman Baru</Typography>
        </Box>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Detail Pengiriman
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
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
                          >
                            {branches.map((branch) => (
                              <MenuItem key={branch._id} value={branch._id}>
                                {branch.namaCabang}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.cabangId && (
                            <FormHelperText>{errors.cabangId.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="antrianKendaraanId"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormControl fullWidth error={!!errors.antrianKendaraanId}>
                          <InputLabel id="kendaraan-label">Kendaraan</InputLabel>
                          <Select
                            {...field}
                            labelId="kendaraan-label"
                            label="Kendaraan"
                            value={value}
                            onChange={onChange}
                          >
                            {availableVehicleQueues.map((queue) => (
                              <MenuItem key={queue._id} value={queue._id}>
                                {queue.truck?.namaKendaraan} - {queue.truck?.noPolisi} - {queue.supir?.nama}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.antrianKendaraanId && (
                            <FormHelperText>{errors.antrianKendaraanId.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="kilometerBerangkat"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <TextField
                          {...field}
                          label="Kilometer Berangkat"
                          type="number"
                          fullWidth
                          value={value}
                          onChange={(e) => onChange(parseFloat(e.target.value || '0'))}
                          error={!!errors.kilometerBerangkat}
                          helperText={errors.kilometerBerangkat?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="checkerId"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormControl fullWidth error={!!errors.checkerId}>
                          <InputLabel id="checker-label">Checker</InputLabel>
                          <Select
                            {...field}
                            labelId="checker-label"
                            label="Checker"
                            value={value}
                            onChange={onChange}
                          >
                            {checkers.map((checker) => (
                              <MenuItem key={checker._id} value={checker._id}>
                                {checker.nama}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.checkerId && (
                            <FormHelperText>{errors.checkerId.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="adminId"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormControl fullWidth error={!!errors.adminId}>
                          <InputLabel id="admin-label">Admin</InputLabel>
                          <Select
                            {...field}
                            labelId="admin-label"
                            label="Admin"
                            value={value}
                            onChange={onChange}
                          >
                            {admins.map((admin) => (
                              <MenuItem key={admin._id} value={admin._id}>
                                {admin.nama}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.adminId && (
                            <FormHelperText>{errors.adminId.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="estimasiLansir"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Estimasi Waktu Lansir"
                          fullWidth
                          placeholder="Contoh: 2-3 jam"
                          error={!!errors.estimasiLansir}
                          helperText={errors.estimasiLansir?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Pilih STT untuk Dikirim
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {availableSTTs.length === 0 ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Tidak ada STT yang tersedia untuk dikirim pada cabang ini.
                  </Alert>
                ) : (
                  <>
                    <Controller
                      name="sttIds"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormControl fullWidth error={!!errors.sttIds}>
                          <InputLabel id="stt-label">Pilih STT</InputLabel>
                          <Select
                            {...field}
                            labelId="stt-label"
                            label="Pilih STT"
                            multiple
                            value={value}
                            onChange={onChange}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => {
                                  const stt = availableSTTs.find((s) => s._id === value);
                                  return (
                                    <Chip 
                                      key={value} 
                                      label={stt ? stt.noSTT : value} 
                                      icon={<ReceiptIcon />} 
                                    />
                                  );
                                })}
                              </Box>
                            )}
                          >
                            {availableSTTs.map((stt) => (
                              <MenuItem key={stt._id} value={stt._id}>
                                {stt.noSTT} - {stt.penerima?.nama || 'N/A'}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.sttIds && (
                            <FormHelperText>{errors.sttIds.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                    
                    {selectedSTTIds.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1">STT Terpilih:</Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          {selectedSTTIds.map((id) => {
                            const stt = availableSTTs.find((s) => s._id === id);
                            return stt ? (
                              <Grid item xs={12} sm={6} md={4} key={id}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2">{stt.noSTT}</Typography>
                                    <Typography variant="body2">
                                      Pengirim: {stt.pengirim?.nama || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                      Penerima: {stt.penerima?.nama || 'N/A'}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ) : null;
                          })}
                        </Grid>
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, position: 'sticky', top: '80px' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ringkasan Pengiriman
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cabang
                  </Typography>
                  <Typography variant="body1">
                    {cabangId ? branches.find(b => b._id === cabangId)?.namaCabang : '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Kendaraan
                  </Typography>
                  <Typography variant="body1">
                    {availableVehicleQueues.find(q => q._id === watch('antrianKendaraanId'))?.truck?.namaKendaraan || '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Supir
                  </Typography>
                  <Typography variant="body1">
                    {availableVehicleQueues.find(q => q._id === watch('antrianKendaraanId'))?.supir?.nama || '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Checker
                  </Typography>
                  <Typography variant="body1">
                    {checkers.find(c => c._id === watch('checkerId'))?.nama || '-'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Jumlah STT
                  </Typography>
                  <Typography variant="body1">
                    {selectedSTTIds.length}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 4 }}>
                  <Button 
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<SaveIcon />}
                    disabled={loading || selectedSTTIds.length === 0}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Buat Pengiriman'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </form>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert 
          onClose={handleCloseAlert} 
          severity={error ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default withAuth(CreateDeliveryPage);