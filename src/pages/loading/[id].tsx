// src/pages/loading/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  LocalShipping as LocalShippingIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Inventory as InventoryIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import id from 'date-fns/locale/id';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getLoadingById,
  updateLoadingStatus,
  generateDMB,
} from '../../store/slices/loadingSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import withAuth from '../../components/auth/withAuth';

const LoadingDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  const { loading: loadingData, pdfUrl } = useSelector((state: RootState) => state.loading);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);
  
  const [updateStatusDialog, setUpdateStatusDialog] = useState(false);
  const [statusData, setStatusData] = useState({
    status: '',
    waktuBerangkat: null as Date | null,
    waktuSampai: null as Date | null,
  });

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(getLoadingById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (loadingData) {
      setStatusData({
        status: loadingData.status,
        waktuBerangkat: loadingData.waktuBerangkat ? new Date(loadingData.waktuBerangkat) : null,
        waktuSampai: loadingData.waktuSampai ? new Date(loadingData.waktuSampai) : null,
      });
    }
  }, [loadingData]);

  const handleStatusDialogOpen = () => {
    setUpdateStatusDialog(true);
  };

  const handleStatusDialogClose = () => {
    setUpdateStatusDialog(false);
  };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusData({
      ...statusData,
      status: event.target.value as string,
    });
  };

  const handleDateChange = (field: 'waktuBerangkat' | 'waktuSampai', value: Date | null) => {
    setStatusData({
      ...statusData,
      [field]: value,
    });
  };

  const handleUpdateStatus = () => {
    if (id && typeof id === 'string') {
      const updateData = {
        status: statusData.status as 'MUAT' | 'BERANGKAT' | 'SAMPAI',
        ...(statusData.waktuBerangkat && { waktuBerangkat: statusData.waktuBerangkat.toISOString() }),
        ...(statusData.waktuSampai && { waktuSampai: statusData.waktuSampai.toISOString() }),
      };

      dispatch(updateLoadingStatus({ id, statusData: updateData }));
      setUpdateStatusDialog(false);
    }
  };

  const handlePrintDMB = () => {
    if (id && typeof id === 'string') {
      dispatch(generateDMB(id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MUAT':
        return 'primary';
      case 'BERANGKAT':
        return 'info';
      case 'SAMPAI':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  // Open PDF in a new window when available
  useEffect(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl]);

  if (loading && !loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!loadingData && !loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6">Data muatan tidak ditemukan</Typography>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{`Muatan ${loadingData?.idMuat || ''}`} - Samudra ERP</title>
      </Head>

      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Detail Muatan</Typography>
        </Box>

        <Paper sx={{ width: '100%', mb: 2, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5">{loadingData?.idMuat}</Typography>
              <Chip 
                label={loadingData?.status} 
                color={getStatusColor(loadingData?.status || '') as any} 
                sx={{ mt: 1 }}
              />
            </Box>
            <Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleStatusDialogOpen}
                sx={{ mr: 1 }}
              >
                Update Status
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrintDMB}
              >
                Cetak DMB
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocalShippingIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Informasi Kendaraan</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Kendaraan
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {loadingData?.antrianTruck?.truck?.namaKendaraan || '-'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Nomor Polisi
                    </Typography>
                    <Typography variant="body1">
                      {loadingData?.antrianTruck?.truck?.noPolisi || '-'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Supir
                    </Typography>
                    <Typography variant="body1">
                      {loadingData?.antrianTruck?.supir?.nama || '-'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Nomor Telepon Supir
                    </Typography>
                    <Typography variant="body1">
                      {loadingData?.antrianTruck?.noTelp || '-'}
                    </Typography>
                  </Box>
                  
                  {loadingData?.antrianTruck?.kenek && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Kenek
                      </Typography>
                      <Typography variant="body1">
                        {loadingData.antrianTruck.kenek.nama}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOnIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Informasi Rute</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Cabang Asal
                    </Typography>
                    <Typography variant="body1">
                      {loadingData?.cabangMuat?.namaCabang || '-'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Cabang Tujuan
                    </Typography>
                    <Typography variant="body1">
                      {loadingData?.cabangBongkar?.namaCabang || '-'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Checker
                    </Typography>
                    <Typography variant="body1">
                      {loadingData?.checker?.nama || '-'}
                    </Typography>
                  </Box>
                  
                  {loadingData?.keterangan && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Keterangan
                      </Typography>
                      <Typography variant="body1">
                        {loadingData.keterangan}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AccessTimeIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Informasi Waktu</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Dibuat Pada
                    </Typography>
                    <Typography variant="body1">
                      {new Date(loadingData?.createdAt || '').toLocaleString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                  
                  {loadingData?.waktuBerangkat && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Waktu Berangkat
                      </Typography>
                      <Typography variant="body1">
                        {new Date(loadingData.waktuBerangkat).toLocaleString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  )}
                  
                  {loadingData?.waktuSampai && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Waktu Sampai
                      </Typography>
                      <Typography variant="body1">
                        {new Date(loadingData.waktuSampai).toLocaleString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <InventoryIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Daftar STT</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {loadingData?.stts && loadingData.stts.length > 0 ? (
                    <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <Grid container spacing={2}>
                        {loadingData.stts.map((stt) => (
                          <Grid item xs={12} sm={6} md={4} key={stt._id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h6">{stt.noSTT}</Typography>
                                <Box mt={1}>
                                  <Typography variant="body2" color="text.secondary">
                                    Pengirim
                                  </Typography>
                                  <Typography variant="body2">
                                    {stt.pengirim?.nama || '-'}
                                  </Typography>
                                </Box>
                                <Box mt={1}>
                                  <Typography variant="body2" color="text.secondary">
                                    Penerima
                                  </Typography>
                                  <Typography variant="body2">
                                    {stt.penerima?.nama || '-'}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ) : (
                    <Typography variant="body1" align="center">
                      Tidak ada data STT
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Update Status Dialog */}
      <Dialog open={updateStatusDialog} onClose={handleStatusDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Status Muatan</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={statusData.status}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="MUAT">MUAT</MenuItem>
                <MenuItem value="BERANGKAT">BERANGKAT</MenuItem>
                <MenuItem value="SAMPAI">SAMPAI</MenuItem>
              </Select>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
              <Box mb={3}>
                <DateTimePicker
                  label="Waktu Berangkat"
                  value={statusData.waktuBerangkat}
                  onChange={(newValue) => handleDateChange('waktuBerangkat', newValue)}
                  ampm={false}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>
              
              <Box mb={3}>
                <DateTimePicker
                  label="Waktu Sampai"
                  value={statusData.waktuSampai}
                  onChange={(newValue) => handleDateChange('waktuSampai', newValue)}
                  ampm={false}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusDialogClose}>Batal</Button>
          <Button onClick={handleUpdateStatus} variant="contained">Simpan</Button>
        </DialogActions>
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

export default withAuth(LoadingDetailPage);