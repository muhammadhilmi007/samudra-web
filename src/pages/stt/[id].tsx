// src/pages/stt/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Breadcrumbs,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  LocalShipping as LocalShippingIcon,
  Update as UpdateIcon,
  Edit as EditIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
  ReceiptLong as ReceiptLongIcon,
  Inventory2 as InventoryIcon,
  FlightTakeoff as FlightTakeoffIcon,
  FlightLand as FlightLandIcon,
  Home as HomeIcon,
  SwapHoriz as SwapHorizIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as PackageIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getSTTById, updateSTTStatus, generateSTTPDF } from '../../store/slices/sttSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { STT, STTStatusUpdate } from '../../types/stt';
import withAuth from '../../components/auth/withAuth';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Schema for status update validation
const statusUpdateSchema = z.object({
  status: z.string().min(1, 'Status wajib dipilih'),
  keterangan: z.string().optional(),
});

interface StatusHistoryItem {
  status: string;
  timestamp: string;
  location?: string;
  notes?: string;
  user?: string;
}

const STTDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  const { stt, pdfUrl } = useSelector((state: RootState) => state.stt);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);
  
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  
  // Mock data for status history - in a real app, this would come from the API
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<STTStatusUpdate & { keterangan: string }>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: '',
      keterangan: '',
    },
  });
  
  useEffect(() => {
    if (id) {
      dispatch(getSTTById(id as string));
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    if (stt) {
      reset({ status: stt.status, keterangan: '' });
      
      // Generate mock status history based on stt details
      const history: StatusHistoryItem[] = [
        {
          status: 'PENDING',
          timestamp: new Date(stt.createdAt).toLocaleString(),
          location: stt.cabangAsal?.namaCabang || 'Cabang Asal',
          user: stt.user?.nama || 'Admin',
        }
      ];
      
      // Add more status updates based on current status
      const statusOrder = ['PENDING', 'MUAT', 'TRANSIT', 'LANSIR', 'TERKIRIM'];
      const currentStatusIndex = statusOrder.indexOf(stt.status);
      
      for (let i = 1; i <= currentStatusIndex; i++) {
        const mockDate = new Date(stt.createdAt);
        mockDate.setHours(mockDate.getHours() + (i * 12)); // Add hours for each step
        
        let location = '';
        let notes = '';
        
        switch (statusOrder[i]) {
          case 'MUAT':
            location = stt.cabangAsal?.namaCabang || 'Cabang Asal';
            notes = 'Barang dimuat ke truk';
            break;
          case 'TRANSIT':
            location = 'Dalam Perjalanan';
            notes = 'Barang dalam pengiriman';
            break;
          case 'LANSIR':
            location = stt.cabangTujuan?.namaCabang || 'Cabang Tujuan';
            notes = 'Barang siap dikirim ke penerima';
            break;
          case 'TERKIRIM':
            location = stt.penerima?.alamat || 'Lokasi Penerima';
            notes = 'Barang telah diterima';
            break;
        }
        
        history.push({
          status: statusOrder[i],
          timestamp: mockDate.toLocaleString(),
          location,
          notes
        });
      }
      
      if (stt.status === 'RETURN') {
        const mockDate = new Date(stt.updatedAt);
        history.push({
          status: 'RETURN',
          timestamp: mockDate.toLocaleString(),
          location: 'Proses Return',
          notes: stt.keterangan || 'Barang diretur',
        });
      }
      
      setStatusHistory(history);
    }
  }, [stt, reset]);
  
  const handleOpenStatusDialog = () => {
    setOpenStatusDialog(true);
  };
  
  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
  };
  
  const handleUpdateStatus = (data: STTStatusUpdate & { keterangan: string }) => {
    if (id) {
      dispatch(updateSTTStatus({ 
        id: id as string, 
        statusData: { 
          status: data.status,
          keterangan: data.keterangan
        } 
      }));
    }
    handleCloseStatusDialog();
  };
  
  const handlePrintSTT = () => {
    if (id) {
      dispatch(generateSTTPDF(id as string));
    }
  };
  
  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };
  
  // Effect for PDF URL
  useEffect(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl]);
  
  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'default';
      case 'MUAT':
        return 'primary';
      case 'TRANSIT':
        return 'info';
      case 'LANSIR':
        return 'warning';
      case 'TERKIRIM':
        return 'success';
      case 'RETURN':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get payment type chip color
  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'CASH':
        return 'success';
      case 'COD':
        return 'primary';
      case 'CAD':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ReceiptLongIcon />;
      case 'MUAT':
        return <InventoryIcon />;
      case 'TRANSIT':
        return <FlightTakeoffIcon />;
      case 'LANSIR':
        return <LocalShippingIcon />;
      case 'TERKIRIM':
        return <FlightLandIcon />;
      case 'RETURN':
        return <SwapHorizIcon />;
      default:
        return <ReceiptLongIcon />;
    }
  };
  
  // Get status color for timeline
  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'grey.500';
      case 'MUAT':
        return 'primary.main';
      case 'TRANSIT':
        return 'info.main';
      case 'LANSIR':
        return 'warning.main';
      case 'TERKIRIM':
        return 'success.main';
      case 'RETURN':
        return 'error.main';
      default:
        return 'grey.500';
    }
  };
  
  // Can edit status based on role and current status
  const canEditStatus = () => {
    if (!user || !stt) return false;
    
    // Admin and managers can always update
    if (['direktur', 'manajer_operasional', 'kepala_cabang'].includes(user.role)) {
      return true;
    }
    
    // Staff permissions depend on status
    switch (user.role) {
      case 'staff_admin':
        return ['PENDING', 'RETURN'].includes(stt.status);
      case 'kepala_gudang':
        return ['PENDING', 'MUAT'].includes(stt.status);
      case 'checker':
        return ['MUAT', 'TRANSIT', 'LANSIR'].includes(stt.status);
      case 'supir':
        return ['TRANSIT', 'LANSIR', 'TERKIRIM'].includes(stt.status);
      default:
        return false;
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!stt) {
    return (
      <Box>
        <Typography variant="h6" color="error">STT tidak ditemukan</Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/stt')}
          sx={{ mt: 2 }}
        >
          Kembali
        </Button>
      </Box>
    );
  }
  
  return (
    <>
      <Head>
        <title>Detail STT - {stt.noSTT}</title>
      </Head>
      
      <Box>
        <Box mb={3}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/dashboard">
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', textDecoration: 'none' }}>
                <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                Dashboard
              </Box>
            </Link>
            <Link href="/stt">
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', textDecoration: 'none' }}>
                <ReceiptLongIcon sx={{ mr: 0.5 }} fontSize="small" />
                Surat Tanda Terima
              </Box>
            </Link>
            <Typography sx={{ display: 'flex', alignItems: 'center' }} color="text.primary">
              <QrCodeIcon sx={{ mr: 0.5 }} fontSize="small" />
              {stt.noSTT}
            </Typography>
          </Breadcrumbs>
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => router.push('/stt')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4">Detail STT</Typography>
          </Box>
          
          <Box>
            {canEditStatus() && (
              <Button
                variant="contained"
                startIcon={<UpdateIcon />}
                onClick={handleOpenStatusDialog}
                sx={{ mr: 1 }}
              >
                Update Status
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintSTT}
            >
              Cetak STT
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3, 
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '30%',
                  height: '100%',
                  background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(${getStatusColor(stt.status) === 'success' ? '76,175,80,0.1' : 
                                                                                 getStatusColor(stt.status) === 'primary' ? '25,118,210,0.1' : 
                                                                                 getStatusColor(stt.status) === 'error' ? '211,47,47,0.1' : 
                                                                                 getStatusColor(stt.status) === 'warning' ? '237,108,2,0.1' : 
                                                                                 getStatusColor(stt.status) === 'info' ? '2,136,209,0.1' : 
                                                                                 '158,158,158,0.1'}) 100%)`,
                  zIndex: 0,
                }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} sx={{ position: 'relative', zIndex: 1 }}>
                <Box>
                  <Typography variant="h5">STT #{stt.noSTT}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Created: {new Date(stt.createdAt).toLocaleString('id-ID')}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Typography variant="body1" sx={{ mr: 1 }}>Status:</Typography>
                  <Chip 
                    label={stt.status} 
                    color={getStatusColor(stt.status) as any} 
                    sx={{ fontWeight: 'bold' }}
                    icon={getStatusIcon(stt.status)}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Informasi STT
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Tanggal Dibuat
                    </Typography>
                    <Typography variant="body1">
                      {new Date(stt.createdAt).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      User
                    </Typography>
                    <Typography variant="body1">
                      {stt.user?.nama || '-'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Pembayaran
                    </Typography>
                    <Chip 
                      label={stt.paymentType} 
                      color={getPaymentTypeColor(stt.paymentType) as any} 
                      size="small" 
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Kode Penerus
                    </Typography>
                    <Typography variant="body1">
                      {stt.kodePenerus} - {
                        stt.kodePenerus === '70' ? 'NO FORWARDING' :
                        stt.kodePenerus === '71' ? 'FORWARDING PAID BY SENDER' :
                        stt.kodePenerus === '72' ? 'FORWARDING PAID BY RECIPIENT' :
                        stt.kodePenerus === '73' ? 'FORWARDING ADVANCED BY RECIPIENT BRANCH' : '-'
                      }
                    </Typography>
                  </Box>
                  
                  {stt.penerus && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Penerus
                      </Typography>
                      <Typography variant="body1">
                        {stt.penerus.namaPenerus}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Informasi Pengiriman
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Cabang Asal
                    </Typography>
                    <Typography variant="body1" display="flex" alignItems="center">
                      <StoreIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      {stt.cabangAsal?.namaCabang || '-'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Cabang Tujuan
                    </Typography>
                    <Typography variant="body1" display="flex" alignItems="center">
                      <StoreIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />
                      {stt.cabangTujuan?.namaCabang || '-'}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Barcode
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <QrCodeIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body1" fontFamily="monospace">
                        {stt.barcode}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {stt.keterangan && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Keterangan
                      </Typography>
                      <Typography variant="body1">
                        {stt.keterangan}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Informasi Pengirim
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Nama
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {stt.pengirim?.nama || '-'}
                  </Typography>
                </Box>
                
                {stt.pengirim?.perusahaan && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Perusahaan
                    </Typography>
                    <Typography variant="body1" display="flex" alignItems="center">
                      <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {stt.pengirim?.perusahaan}
                    </Typography>
                  </Box>
                )}
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Telepon
                  </Typography>
                  <Typography variant="body1" display="flex" alignItems="center">
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    {stt.pengirim?.telepon || '-'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Alamat
                  </Typography>
                  <Typography variant="body1" display="flex" alignItems="flex-start">
                    <LocationOnIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                    <span>{stt.pengirim?.alamat || '-'}</span>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PersonIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Informasi Penerima
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Nama
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {stt.penerima?.nama || '-'}
                  </Typography>
                </Box>
                
                {stt.penerima?.perusahaan && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Perusahaan
                    </Typography>
                    <Typography variant="body1" display="flex" alignItems="center">
                      <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {stt.penerima?.perusahaan}
                    </Typography>
                  </Box>
                )}
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Telepon
                  </Typography>
                  <Typography variant="body1" display="flex" alignItems="center">
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    {stt.penerima?.telepon || '-'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Alamat
                  </Typography>
                  <Typography variant="body1" display="flex" alignItems="flex-start">
                    <LocationOnIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                    <span>{stt.penerima?.alamat || '-'}</span>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PackageIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Informasi Barang
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Nama Barang
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {stt.namaBarang}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Komoditi
                      </Typography>
                      <Typography variant="body1">
                        {stt.komoditi}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Packing
                      </Typography>
                      <Typography variant="body1">
                        {stt.packing}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Jumlah Colly
                      </Typography>
                      <Typography variant="body1">
                        {stt.jumlahColly}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Berat
                      </Typography>
                      <Typography variant="body1">
                        {stt.berat} kg
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Harga per Kilo
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(stt.hargaPerKilo)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Total Harga
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                        <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                        {formatCurrency(stt.harga)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TimelineIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Tracking Pengiriman
                  </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />
                
                {statusHistory.length > 0 ? (
                  <Timeline position="alternate">
                    {statusHistory.map((item, index) => (
                      <TimelineItem key={index}>
                        <TimelineOppositeContent color="text.secondary">
                          {item.timestamp}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot sx={{ bgcolor: getTimelineColor(item.status) }}>
                            {getStatusIcon(item.status)}
                          </TimelineDot>
                          {index < statusHistory.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography variant="h6" component="div" fontWeight="bold">
                              {item.status}
                            </Typography>
                            {item.location && (
                              <Typography variant="body2">
                                Lokasi: {item.location}
                              </Typography>
                            )}
                            {item.notes && (
                              <Typography variant="body2" color="text.secondary">
                                {item.notes}
                              </Typography>
                            )}
                            {item.user && (
                              <Typography variant="caption" display="block" mt={1}>
                                Diproses oleh: {item.user}
                              </Typography>
                            )}
                          </Paper>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" p={3}>
                    <Typography variant="body1" color="text.secondary">
                      Tidak ada data tracking tersedia untuk STT ini.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Dialog for Status Update */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Status STT</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(handleUpdateStatus)}>
          <DialogContent>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  fullWidth
                  margin="normal"
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="MUAT">MUAT</MenuItem>
                  <MenuItem value="TRANSIT">TRANSIT</MenuItem>
                  <MenuItem value="LANSIR">LANSIR</MenuItem>
                  <MenuItem value="TERKIRIM">TERKIRIM</MenuItem>
                  <MenuItem value="RETURN">RETURN</MenuItem>
                </TextField>
              )}
            />
            
            <Controller
              name="keterangan"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Keterangan Update (Opsional)"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  placeholder="Tambahkan keterangan untuk update status ini"
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStatusDialog}>Batal</Button>
            <Button type="submit" variant="contained">
              Update Status
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

export default withAuth(STTDetailPage);