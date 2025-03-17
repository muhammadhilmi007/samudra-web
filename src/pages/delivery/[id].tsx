// src/pages/delivery/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as TruckIcon,
  PersonPin as PersonPinIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  DirectionsCar as CarIcon,
  SupervisorAccount as SupervisorIcon,
  Person as PersonIcon,
  Route as RouteIcon,
  Search as SearchIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getDeliveryById, updateDeliveryStatus, generateDeliveryForm, clearPDFUrl } from '../../store/slices/deliverySlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { format } from 'date-fns';
import idLocale from 'date-fns/locale/id';
import withAuth from '../../components/auth/withAuth';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Schema for update status form validation
const updateStatusSchema = z.object({
  status: z.enum(['LANSIR', 'TERKIRIM', 'BELUM SELESAI'], {
    errorMap: () => ({ message: 'Status pengiriman wajib dipilih' }),
  }),
  namaPenerima: z.string().optional(),
  keterangan: z.string().optional(),
  kilometerPulang: z.number().optional(),
});

type UpdateStatusFormInputs = z.infer<typeof updateStatusSchema>;

const DeliveryDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentDelivery, pdfUrl, loading } = useSelector((state: RootState) => state.delivery);
  const { error, success } = useSelector((state: RootState) => state.ui);
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateStatusFormInputs>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: 'LANSIR',
      namaPenerima: '',
      keterangan: '',
      kilometerPulang: 0,
    },
  });
  
  const selectedStatus = watch('status');
  
  useEffect(() => {
    if (id) {
      dispatch(getDeliveryById(id as string));
    }
    
    return () => {
      dispatch(clearPDFUrl());
    };
  }, [dispatch, id]);
  
  useEffect(() => {
    if (currentDelivery) {
      reset({
        status: currentDelivery.status,
        namaPenerima: currentDelivery.namaPenerima || '',
        keterangan: currentDelivery.keterangan || '',
        kilometerPulang: currentDelivery.kilometerPulang || 0,
      });
    }
  }, [currentDelivery, reset]);
  
  useEffect(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl]);
  
  const handleStatusDialogOpen = () => {
    setStatusDialogOpen(true);
  };
  
  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
  };
  
  const handleUpdateStatus = (data: UpdateStatusFormInputs) => {
    if (id) {
      dispatch(
        updateDeliveryStatus({
          id: id as string,
          statusData: {
            status: data.status,
            namaPenerima: data.namaPenerima,
            keterangan: data.keterangan,
            kilometerPulang: data.kilometerPulang,
            sampai: data.status === 'TERKIRIM' ? new Date().toISOString() : undefined,
          },
        })
      );
      handleStatusDialogClose();
    }
  };
  
  const handleGenerateForm = () => {
    if (id) {
      dispatch(generateDeliveryForm(id as string));
    }
  };
  
  const handleCloseAlert = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };
  
  if (!currentDelivery || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Format the date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy HH:mm', { locale: idLocale });
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LANSIR':
        return 'info';
      case 'TERKIRIM':
        return 'success';
      case 'BELUM SELESAI':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Calculate current step for stepper
  const getCurrentStep = () => {
    switch (currentDelivery.status) {
      case 'LANSIR':
        return 0;
      case 'TERKIRIM':
        return 2;
      case 'BELUM SELESAI':
        return 1;
      default:
        return 0;
    }
  };
  
  return (
    <>
      <Head>
        <title>Detail Pengiriman | Samudra ERP</title>
      </Head>
      
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" passHref>
            <MuiLink underline="hover" color="inherit">Dashboard</MuiLink>
          </Link>
          <Link href="/delivery" passHref>
            <MuiLink underline="hover" color="inherit">Pengiriman</MuiLink>
          </Link>
          <Typography color="text.primary">Detail Pengiriman</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => router.push('/delivery')}
              sx={{ mr: 2 }}
            >
              Kembali
            </Button>
            <Typography variant="h4">Detail Pengiriman</Typography>
          </Box>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<PrintIcon />} 
              onClick={handleGenerateForm}
              sx={{ mr: 1 }}
            >
              Cetak Form
            </Button>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />} 
              onClick={handleStatusDialogOpen}
            >
              Update Status
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Informasi Pengiriman</Typography>
                <Chip 
                  label={currentDelivery.status}
                  color={getStatusColor(currentDelivery.status) as any}
                />
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">ID Lansir</Typography>
                  <Typography variant="body1">{currentDelivery.idLansir}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Cabang</Typography>
                  <Typography variant="body1">
                    {currentDelivery.cabang?.namaCabang || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Jumlah STT</Typography>
                  <Typography variant="body1">
                    {currentDelivery.sttIds?.length || 0} STT
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Checker</Typography>
                  <Typography variant="body1">
                    {currentDelivery.checker?.nama || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Admin</Typography>
                  <Typography variant="body1">
                    {currentDelivery.admin?.nama || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Estimasi Lansir</Typography>
                  <Typography variant="body1">
                    {currentDelivery.estimasiLansir || '-'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Waktu Berangkat</Typography>
                  <Typography variant="body1">
                    {formatDate(currentDelivery.berangkat)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Waktu Sampai</Typography>
                  <Typography variant="body1">
                    {formatDate(currentDelivery.sampai)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Tanggal Dibuat</Typography>
                  <Typography variant="body1">
                    {formatDate(currentDelivery.createdAt)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Kilometer Berangkat</Typography>
                  <Typography variant="body1">
                    {currentDelivery.kilometerBerangkat?.toLocaleString('id-ID') || '-'} km
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Kilometer Pulang</Typography>
                  <Typography variant="body1">
                    {currentDelivery.kilometerPulang?.toLocaleString('id-ID') || '-'} km
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Nama Penerima</Typography>
                  <Typography variant="body1">
                    {currentDelivery.namaPenerima || '-'}
                  </Typography>
                </Grid>
                
                {currentDelivery.keterangan && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Keterangan</Typography>
                    <Typography variant="body1">
                      {currentDelivery.keterangan}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Status Pengiriman</Typography>
                
                <Stepper activeStep={getCurrentStep()} alternativeLabel sx={{ mb: 4 }}>
                  <Step>
                    <StepLabel>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">Lansir</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(currentDelivery.berangkat)}
                        </Typography>
                      </Box>
                    </StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">Tertunda</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {currentDelivery.status === 'BELUM SELESAI' ? formatDate(currentDelivery.updatedAt) : '-'}
                        </Typography>
                      </Box>
                    </StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">Terkirim</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {currentDelivery.status === 'TERKIRIM' ? formatDate(currentDelivery.sampai) : '-'}
                        </Typography>
                      </Box>
                    </StepLabel>
                  </Step>
                </Stepper>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Detail STT</Typography>
              <Divider sx={{ mb: 3 }} />
              
              {currentDelivery.stts && currentDelivery.stts.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>No. STT</TableCell>
                        <TableCell>Pengirim</TableCell>
                        <TableCell>Penerima</TableCell>
                        <TableCell align="center">Aksi</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentDelivery.stts.map((stt) => (
                        <TableRow key={stt._id}>
                          <TableCell>{stt.noSTT}</TableCell>
                          <TableCell>{stt.pengirim?.nama || '-'}</TableCell>
                          <TableCell>{stt.penerima?.nama || '-'}</TableCell>
                          <TableCell align="center">
                            <Link href={`/stt/${stt._id}`} passHref>
                              <Button size="small">Detail</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="warning">
                  Tidak ada STT terkait dengan pengiriman ini.
                </Alert>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Informasi Kendaraan</Typography>
              <Divider sx={{ mb: 3 }} />
              
              {currentDelivery.antrianKendaraan?.kendaraan ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1">
                      {currentDelivery.antrianKendaraan.kendaraan.namaKendaraan}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" color="text.secondary">No. Polisi</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {currentDelivery.antrianKendaraan.kendaraan.noPolisi}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" color="text.secondary">Supir</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {currentDelivery.antrianKendaraan.supir?.nama || '-'}
                    </Typography>
                  </Box>
                  
                  {currentDelivery.antrianKendaraan.kenek && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Kenek</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                        <Typography variant="body1">
                          {currentDelivery.antrianKendaraan.kenek.nama}
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  <Link href={`/vehicle/${currentDelivery.antrianKendaraan.kendaraan._id}`} passHref>
                    <Button size="small" variant="outlined" sx={{ mt: 1 }}>
                      Detail Kendaraan
                    </Button>
                  </Link>
                </Box>
              ) : (
                <Alert severity="warning">
                  Data kendaraan tidak ditemukan.
                </Alert>
              )}
            </Paper>
            
            {currentDelivery.status === 'TERKIRIM' && currentDelivery.namaPenerima && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Informasi Penerima</Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonPinIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="subtitle1">
                    {currentDelivery.namaPenerima}
                  </Typography>
                </Box>
                
                <Typography variant="subtitle2" color="text.secondary">Waktu Terima</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {formatDate(currentDelivery.sampai)}
                </Typography>
                
                {currentDelivery.keterangan && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">Keterangan</Typography>
                    <Typography variant="body1">
                      {currentDelivery.keterangan}
                    </Typography>
                  </>
                )}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
      
      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleStatusDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Status Pengiriman</DialogTitle>
        <form onSubmit={handleSubmit(handleUpdateStatus)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel id="status-label">Status Pengiriman</InputLabel>
                      <Select
                        {...field}
                        labelId="status-label"
                        label="Status Pengiriman"
                      >
                        <MenuItem value="LANSIR">Lansir (Dalam Perjalanan)</MenuItem>
                        <MenuItem value="TERKIRIM">Terkirim</MenuItem>
                        <MenuItem value="BELUM SELESAI">Belum Selesai (Tertunda)</MenuItem>
                      </Select>
                      {errors.status && (
                        <FormHelperText>{errors.status.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              {selectedStatus === 'TERKIRIM' && (
                <>
                  <Grid item xs={12}>
                    <Controller
                      name="namaPenerima"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nama Penerima"
                          fullWidth
                          error={!!errors.namaPenerima}
                          helperText={errors.namaPenerima?.message}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="kilometerPulang"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Kilometer Pulang"
                          type="number"
                          fullWidth
                          error={!!errors.kilometerPulang}
                          helperText={errors.kilometerPulang?.message}
                        />
                      )}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <Controller
                  name="keterangan"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Keterangan"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.keterangan}
                      helperText={errors.keterangan?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStatusDialogClose}>Batal</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color={selectedStatus === 'TERKIRIM' ? 'success' : 'primary'}
            >
              Update Status
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
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

export default withAuth(DeliveryDetailPage);