// src/pages/collection/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Breadcrumbs,
  Link as MuiLink,
  Button,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  DeleteOutline as DeleteIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  Done as DoneIcon,
  Schedule as ScheduleIcon,
  Money as MoneyOutlinedIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getCollectionById, updateCollectionStatus, addPayment, generateInvoice, clearPDFUrl } from '../../store/slices/collectionSlice';
import { format } from 'date-fns';
import idLocale from 'date-fns/locale/id';
import withAuth from '../../components/auth/withAuth';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Schema for payment form validation
const paymentSchema = z.object({
  tanggal: z.date({
    required_error: "Tanggal pembayaran wajib diisi",
  }),
  jumlah: z.number({
    required_error: "Jumlah pembayaran wajib diisi",
  }).positive("Jumlah pembayaran harus lebih dari 0"),
  keterangan: z.string().optional(),
});

type PaymentFormInputs = z.infer<typeof paymentSchema>;

const CollectionDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentCollection, pdfUrl, loading } = useSelector((state: RootState) => state.collection);
  const { error, success } = useSelector((state: RootState) => state.ui);
  
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormInputs>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      tanggal: new Date(),
      jumlah: 0,
      keterangan: '',
    },
  });
  
  useEffect(() => {
    if (id) {
      dispatch(getCollectionById(id as string));
    }
    
    return () => {
      dispatch(clearPDFUrl());
    };
  }, [dispatch, id]);
  
  useEffect(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl]);
  
  const handlePaymentDialogOpen = () => {
    setPaymentDialogOpen(true);
    reset({
      tanggal: new Date(),
      jumlah: 0,
      keterangan: '',
    });
  };
  
  const handlePaymentDialogClose = () => {
    setPaymentDialogOpen(false);
  };
  
  const handleStatusDialogOpen = () => {
    setStatusDialogOpen(true);
  };
  
  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
  };
  
  const handleAddPayment = (data: PaymentFormInputs) => {
    if (id) {
      dispatch(
        addPayment({
          collectionId: id as string,
          jumlah: data.jumlah,
          tanggal: format(data.tanggal, 'yyyy-MM-dd'),
          keterangan: data.keterangan,
        })
      );
      handlePaymentDialogClose();
    }
  };
  
  const handleUpdateStatus = (status: 'LUNAS' | 'BELUM LUNAS') => {
    if (id) {
      dispatch(updateCollectionStatus({ id: id as string, status }));
      handleStatusDialogClose();
    }
  };
  
  const handleGenerateInvoice = () => {
    if (id) {
      dispatch(generateInvoice(id as string));
    }
  };
  
  const handleCloseAlert = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };
  
  if (!currentCollection || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Calculate total amount paid
  const totalPaid = currentCollection.jumlahBayarTermin.reduce(
    (sum, payment) => sum + payment.jumlah,
    0
  );
  
  // Calculate remaining amount
  const remainingAmount = currentCollection.totalTagihan - totalPaid;
  
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy', { locale: idLocale });
  };
  
  // Collection status color
  const getStatusColor = (status: string) => {
    return status === 'LUNAS' ? 'success' : 'warning';
  };
  
  // Step index for stepper
  const getCurrentStep = () => {
    if (currentCollection.status === 'LUNAS') {
      return 2;
    } else if (currentCollection.jumlahBayarTermin.length > 0) {
      return 1;
    }
    return 0;
  };
  
  return (
    <>
      <Head>
        <title>Detail Penagihan | Samudra ERP</title>
      </Head>
      
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" passHref>
            <MuiLink underline="hover" color="inherit">Dashboard</MuiLink>
          </Link>
          <Link href="/collection" passHref>
            <MuiLink underline="hover" color="inherit">Penagihan</MuiLink>
          </Link>
          <Typography color="text.primary">Detail Penagihan</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => router.push('/collection')}
              sx={{ mr: 2 }}
            >
              Kembali
            </Button>
            <Typography variant="h4">Detail Penagihan</Typography>
          </Box>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<PrintIcon />} 
              onClick={handleGenerateInvoice}
              sx={{ mr: 1 }}
            >
              Cetak Invoice
            </Button>
            <Button 
              variant="contained" 
              startIcon={<PaymentIcon />} 
              onClick={handlePaymentDialogOpen}
              disabled={currentCollection.status === 'LUNAS'}
            >
              Tambah Pembayaran
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Informasi Penagihan</Typography>
                <Chip 
                  label={currentCollection.status}
                  color={getStatusColor(currentCollection.status)}
                  variant="outlined"
                />
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">No. Penagihan</Typography>
                  <Typography variant="body1">{currentCollection.noPenagihan}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Pelanggan</Typography>
                  <Typography variant="body1">
                    {currentCollection.pelanggan?.nama || 'N/A'}
                    <Chip 
                      label={currentCollection.tipePelanggan} 
                      size="small" 
                      sx={{ ml: 1 }} 
                      color="info"
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Cabang</Typography>
                  <Typography variant="body1">
                    {currentCollection.cabang?.namaCabang || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Total Tagihan</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    Rp {currentCollection.totalTagihan.toLocaleString('id-ID')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Total Terbayar</Typography>
                  <Typography variant="body1" color="success.main" fontWeight="bold">
                    Rp {totalPaid.toLocaleString('id-ID')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Sisa Tagihan</Typography>
                  <Typography variant="body1" color={remainingAmount > 0 ? "error.main" : "success.main"} fontWeight="bold">
                    Rp {remainingAmount.toLocaleString('id-ID')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Tanggal Dibuat</Typography>
                  <Typography variant="body1">
                    {formatDate(currentCollection.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Overdue</Typography>
                  <Typography variant="body1">
                    {currentCollection.overdue ? 
                      <Chip label="Ya" color="error" size="small" /> : 
                      <Chip label="Tidak" color="success" size="small" />
                    }
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Dibuat Oleh</Typography>
                  <Typography variant="body1">
                    {currentCollection.creator?.nama || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Status Penagihan</Typography>
                
                <Stepper activeStep={getCurrentStep()} alternativeLabel sx={{ mb: 4 }}>
                  <Step>
                    <StepLabel>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">Penagihan Dibuat</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(currentCollection.createdAt)}
                        </Typography>
                      </Box>
                    </StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">Pembayaran Sebagian</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {currentCollection.jumlahBayarTermin.length > 0 
                            ? formatDate(currentCollection.jumlahBayarTermin[currentCollection.jumlahBayarTermin.length - 1].tanggal) 
                            : '-'}
                        </Typography>
                      </Box>
                    </StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">Lunas</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {currentCollection.status === 'LUNAS' && currentCollection.tanggalBayar 
                            ? formatDate(currentCollection.tanggalBayar) 
                            : '-'}
                        </Typography>
                      </Box>
                    </StepLabel>
                  </Step>
                </Stepper>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={currentCollection.status === 'LUNAS' ? <ScheduleIcon /> : <DoneIcon />}
                    onClick={handleStatusDialogOpen}
                  >
                    {currentCollection.status === 'LUNAS' ? 'Tandai Belum Lunas' : 'Tandai Lunas'}
                  </Button>
                </Box>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Detail Pembayaran</Typography>
              <Divider sx={{ mb: 3 }} />
              
              {currentCollection.jumlahBayarTermin.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>No.</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell align="right">Jumlah</TableCell>
                      <TableCell>Keterangan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentCollection.jumlahBayarTermin.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{payment.termin}</TableCell>
                        <TableCell>{formatDate(payment.tanggal)}</TableCell>
                        <TableCell align="right">Rp {payment.jumlah.toLocaleString('id-ID')}</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Total Terbayar</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        Rp {totalPaid.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Sisa Tagihan</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: remainingAmount > 0 ? 'error.main' : 'success.main' }}>
                        Rp {remainingAmount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Belum ada data pembayaran untuk penagihan ini.
                </Alert>
              )}
              
              {remainingAmount > 0 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    startIcon={<PaymentIcon />} 
                    onClick={handlePaymentDialogOpen}
                  >
                    Tambah Pembayaran
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Detail STT</Typography>
              <Divider sx={{ mb: 3 }} />
              
              {currentCollection.stts && currentCollection.stts.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {currentCollection.stts.map((stt) => (
                    <Card key={stt._id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {stt.noSTT}
                          </Typography>
                          <Typography variant="body2">
                            Rp {stt.harga.toLocaleString('id-ID')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                          <Link href={`/stt/${stt._id}`} passHref>
                            <Button size="small">Lihat Detail</Button>
                          </Link>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Alert severity="warning">
                  Tidak ada STT terkait dengan penagihan ini.
                </Alert>
              )}
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Informasi Pelanggan</Typography>
              <Divider sx={{ mb: 3 }} />
              
              {currentCollection.pelanggan ? (
                <Box>
                  <Typography variant="subtitle1">{currentCollection.pelanggan.nama}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {currentCollection.tipePelanggan}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Alamat</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {currentCollection.pelanggan.alamat || '-'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Telepon</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {currentCollection.pelanggan.telepon || '-'}
                  </Typography>
                  
                  <Link href={`/customer/${currentCollection.pelangganId}`} passHref>
                    <Button size="small" variant="outlined">Lihat Profil Pelanggan</Button>
                  </Link>
                </Box>
              ) : (
                <Alert severity="warning">
                  Data pelanggan tidak ditemukan.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={handlePaymentDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Tambah Pembayaran</DialogTitle>
        <form onSubmit={handleSubmit(handleAddPayment)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Informasi Penagihan
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Total Tagihan:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    Rp {currentCollection.totalTagihan.toLocaleString('id-ID')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Total Terbayar:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    Rp {totalPaid.toLocaleString('id-ID')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="body2">Sisa Tagihan:</Typography>
                  <Typography variant="body2" fontWeight="bold" color={remainingAmount > 0 ? "error.main" : "success.main"}>
                    Rp {remainingAmount.toLocaleString('id-ID')}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Detail Pembayaran
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Controller
                    name="tanggal"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Tanggal Pembayaran"
                        value={field.value}
                        onChange={(newValue) => field.onChange(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.tanggal,
                            helperText: errors.tanggal?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="jumlah"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <TextField
                      {...field}
                      label="Jumlah Pembayaran"
                      type="number"
                      fullWidth
                      value={value}
                      onChange={(e) => onChange(parseFloat(e.target.value || '0'))}
                      error={!!errors.jumlah}
                      helperText={errors.jumlah?.message}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, color: 'text.secondary' }}>Rp</Box>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="keterangan"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Keterangan (Opsional)"
                      fullWidth
                      multiline
                      rows={2}
                      error={!!errors.keterangan}
                      helperText={errors.keterangan?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePaymentDialogClose}>Batal</Button>
            <Button type="submit" variant="contained" startIcon={<MoneyIcon />}>
              Proses Pembayaran
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleStatusDialogClose}>
        <DialogTitle>
          {currentCollection.status === 'LUNAS' 
            ? 'Tandai Belum Lunas' 
            : 'Tandai Lunas'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {currentCollection.status === 'LUNAS'
              ? 'Apakah Anda yakin ingin mengubah status penagihan menjadi "Belum Lunas"?'
              : `Apakah Anda yakin ingin mengubah status penagihan menjadi "Lunas"? ${
                  remainingAmount > 0
                    ? `Masih ada sisa tagihan sebesar Rp ${remainingAmount.toLocaleString('id-ID')}.`
                    : ''
                }`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusDialogClose}>Batal</Button>
          <Button 
            onClick={() => handleUpdateStatus(currentCollection.status === 'LUNAS' ? 'BELUM LUNAS' : 'LUNAS')}
            color={currentCollection.status === 'LUNAS' ? 'warning' : 'success'}
          >
            {currentCollection.status === 'LUNAS' ? 'Tandai Belum Lunas' : 'Tandai Lunas'}
          </Button>
        </DialogActions>
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

export default withAuth(CollectionDetailPage);