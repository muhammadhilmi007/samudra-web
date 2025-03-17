// src/pages/return/[id].tsx
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
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  AssignmentReturn as AssignmentReturnIcon,
  AccessTime as AccessTimeIcon,
  Place as PlaceIcon,
  Inventory as InventoryIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import id from 'date-fns/locale/id';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getReturnById,
  updateReturnStatus,
} from '../../store/slices/returnSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import withAuth from '../../components/auth/withAuth';

const ReturnDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentReturn } = useSelector((state: RootState) => state.return);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);
  
  const [updateStatusDialog, setUpdateStatusDialog] = useState(false);
  const [statusData, setStatusData] = useState({
    status: '',
    tanggalSampai: null as Date | null,
    tandaTerima: '',
  });

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(getReturnById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentReturn) {
      setStatusData({
        status: currentReturn.status,
        tanggalSampai: currentReturn.tanggalSampai ? new Date(currentReturn.tanggalSampai) : null,
        tandaTerima: currentReturn.tandaTerima || '',
      });
    }
  }, [currentReturn]);

  const handleStatusDialogOpen = () => {
    setUpdateStatusDialog(true);
  };

  const handleStatusDialogClose = () => {
    setUpdateStatusDialog(false);
  };

  const handleDateChange = (date: Date | null) => {
    setStatusData({
      ...statusData,
      tanggalSampai: date,
    });
  };

  const handleTandaTerimaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusData({
      ...statusData,
      tandaTerima: event.target.value,
    });
  };

  const handleUpdateStatus = () => {
    if (id && typeof id === 'string') {
      const updateData = {
        status: 'SAMPAI' as 'PROSES' | 'SAMPAI',
        tanggalSampai: statusData.tanggalSampai?.toISOString(),
        tandaTerima: statusData.tandaTerima,
      };

      dispatch(updateReturnStatus({ id, statusData: updateData }));
      setUpdateStatusDialog(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROSES':
        return 'warning';
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

  if (loading && !currentReturn) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentReturn && !loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6">Data retur tidak ditemukan</Typography>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{`Retur ${currentReturn?.idRetur || ''}`} - Samudra ERP</title>
      </Head>

      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Detail Retur</Typography>
        </Box>

        <Paper sx={{ width: '100%', mb: 2, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5">{currentReturn?.idRetur}</Typography>
              <Chip 
                label={currentReturn?.status} 
                color={getStatusColor(currentReturn?.status || '') as any} 
                sx={{ mt: 1 }}
              />
            </Box>
            <Box>
              {currentReturn?.status === 'PROSES' && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleStatusDialogOpen}
                >
                  Update Status
                </Button>
              )}
            </Box>
          </Box>

          <Grid container spacing={3}>
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
                      Tanggal Pengiriman
                    </Typography>
                    <Typography variant="body1">
                      {new Date(currentReturn?.tanggalKirim || '').toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>
                  
                  {currentReturn?.tanggalSampai && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Tanggal Sampai
                      </Typography>
                      <Typography variant="body1">
                        {new Date(currentReturn.tanggalSampai).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  )}
                  
                  {currentReturn?.tandaTerima && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Tanda Terima
                      </Typography>
                      <Typography variant="body1">
                        {currentReturn.tandaTerima}
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
                    <PlaceIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Informasi Cabang</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Cabang
                    </Typography>
                    <Typography variant="body1">
                      {currentReturn?.cabang?.namaCabang || '-'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Dibuat Oleh
                    </Typography>
                    <Typography variant="body1">
                      {currentReturn?.creator?.nama || '-'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Dibuat Pada
                    </Typography>
                    <Typography variant="body1">
                      {new Date(currentReturn?.createdAt || '').toLocaleString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
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
                  
                  {currentReturn?.stts && currentReturn.stts.length > 0 ? (
                    <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <Grid container spacing={2}>
                        {currentReturn.stts.map((stt) => (
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
        <DialogTitle>Update Status Retur</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
              <Box mb={3}>
                <DatePicker
                  label="Tanggal Sampai"
                  value={statusData.tanggalSampai}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>
            </LocalizationProvider>
            
            <TextField
              fullWidth
              label="Tanda Terima"
              value={statusData.tandaTerima}
              onChange={handleTandaTerimaChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusDialogClose}>Batal</Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained"
            disabled={!statusData.tanggalSampai}
          >
            Simpan
          </Button>
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

export default withAuth(ReturnDetailPage);