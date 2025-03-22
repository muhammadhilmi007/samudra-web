// src/components/stt/STTTracker.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalShipping as ShippingIcon,
  AccessTime as TimeIcon,
  CheckCircleOutline as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  QrCodeScanner as ScannerIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { trackSTT, clearTrackingData } from '../../store/slices/sttSlice';

// Track status order for stepper
const trackingOrder = [
  'PENDING',
  'MUAT',
  'TRANSIT',
  'LANSIR',
  'TERKIRIM',
];

const STTTracker: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { trackingData, loading } = useSelector((state: RootState) => state.stt);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Get status step for stepper
  const getStatusStep = () => {
    if (!trackingData?.stt) return 0;
    if (trackingData.stt.status === 'RETURN') return -1; // Special case for returns

    const index = trackingOrder.findIndex((status) => status === trackingData.stt.status);
    return index >= 0 ? index : 0;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TERKIRIM':
        return 'success';
      case 'RETURN':
        return 'error';
      case 'LANSIR':
      case 'TRANSIT':
        return 'info';
      case 'MUAT':
        return 'primary';
      case 'PENDING':
      default:
        return 'warning';
    }
  };

  // Handle search with enhanced error handling and validation
  const handleSearch = async () => {
    const trimmedNumber = trackingNumber.trim();
    if (!trimmedNumber) {
      return;
    }

    try {
      setHasSearched(true);
      await dispatch(trackSTT(trimmedNumber)).unwrap();
    } catch (error: any) {
      console.error('Tracking error:', error);
      // Use clearTrackingData from the slice instead of setTrackingData
      dispatch(clearTrackingData());
    }
  };

  // Improved debounce implementation with proper cleanup
  const debouncedSearch = useMemo(
    () => debounce(async (value: string) => {
      if (value.trim()) {
        await handleSearch();
      }
    }, 500),
    [handleSearch]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);


  // Handle keypress
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom align="center">
          Lacak Pengiriman
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom align="center">
          Masukkan nomor STT untuk melacak status pengiriman Anda
        </Typography>
        
        <Box 
          display="flex" 
          gap={1} 
          justifyContent="center" 
          alignItems="center" 
          maxWidth={600}
          mx="auto"
          my={3}
        >
          <TextField
            fullWidth
            label="Nomor STT"
            variant="outlined"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Contoh: BDG-010223-0001"
            disabled={loading}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={loading || !trackingNumber.trim()}
            sx={{ height: 56, px: 3 }}
          >
            Lacak
          </Button>
        </Box>
        
        <Box display="flex" justifyContent="center">
          <Button
            startIcon={<ScannerIcon />}
            color="inherit"
          >
            Scan Barcode
          </Button>
        </Box>
      </Paper>
      
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" my={5}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Mencari data pengiriman...
          </Typography>
        </Box>
      )}
      
      {hasSearched && !loading && !trackingData && (
        <Alert severity="error" sx={{ my: 3 }}>
          Nomor STT tidak ditemukan. Periksa kembali nomor STT Anda.
        </Alert>
      )}
      
      {trackingData && !loading && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informasi Pengiriman STT #{trackingData.stt?.noSTT}
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="bold"
                      color={`${getStatusColor(trackingData.stt?.status || 'PENDING')}.main`}
                    >
                      {trackingData.stt?.status === 'PENDING' ? 'Menunggu Proses' :
                       trackingData.stt?.status === 'MUAT' ? 'Pemuatan' :
                       trackingData.stt?.status === 'TRANSIT' ? 'Dalam Perjalanan' :
                       trackingData.stt?.status === 'LANSIR' ? 'Pengiriman Lokal' :
                       trackingData.stt?.status === 'TERKIRIM' ? 'Terkirim' :
                       trackingData.stt?.status === 'RETURN' ? 'Dikembalikan (Return)' :
                       trackingData.stt?.status || 'Tidak diketahui'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tanggal Pengiriman
                    </Typography>
                    <Typography variant="body1">
                      {new Date(trackingData.stt?.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Asal
                    </Typography>
                    <Typography variant="body1">
                      {trackingData.origin?.namaCabang || '-'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tujuan
                    </Typography>
                    <Typography variant="body1">
                      {trackingData.destination?.namaCabang || '-'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Pengirim
                    </Typography>
                    <Typography variant="body1">
                      {trackingData.sender?.nama || '-'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Penerima
                    </Typography>
                    <Typography variant="body1">
                      {trackingData.recipient?.nama || '-'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Barang
                    </Typography>
                    <Typography variant="body1">
                      {trackingData.stt?.namaBarang || '-'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Berat
                    </Typography>
                    <Typography variant="body1">
                      {trackingData.stt?.berat} kg
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} md={6}>
                {/* Display current status tracking */}
                {trackingData.stt?.status === 'RETURN' ? (
                  <Alert 
                    severity="error"
                    icon={<WarningIcon fontSize="inherit" />}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="subtitle2">
                      Paket Dikembalikan (Return)
                    </Typography>
                    <Typography variant="body2">
                      Paket ini dikembalikan dan tidak dapat dikirim ke alamat tujuan.
                    </Typography>
                  </Alert>
                ) : (
                  <Stepper 
                    activeStep={getStatusStep()} 
                    orientation="vertical"
                  >
                    <Step>
                      <StepLabel>Menunggu Proses</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Pemuatan</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Dalam Perjalanan</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Pengiriman Lokal</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Terkirim</StepLabel>
                    </Step>
                  </Stepper>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          {/* History Timeline */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Riwayat Pengiriman
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            {trackingData.history?.length > 0 ? (
              <Timeline position="alternate">
                {trackingData.history.map((track: any, index: number) => (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent color="text.secondary">
                      {new Date(track.timestamp).toLocaleString('id-ID')}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot 
                        color={
                          track.status === 'TERKIRIM' ? 'success' :
                          track.status === 'RETURN' ? 'error' :
                          track.status === 'LANSIR' || track.status === 'TRANSIT' ? 'info' :
                          track.status === 'MUAT' ? 'primary' :
                          'warning'
                        }
                      >
                        {track.status === 'TERKIRIM' ? <CheckIcon /> : 
                         track.status === 'RETURN' ? <ErrorIcon /> : 
                         <ShippingIcon />}
                      </TimelineDot>
                      {index < (trackingData.history?.length - 1) && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2">
                          {track.status === 'PENDING' ? 'Menunggu Proses' :
                           track.status === 'MUAT' ? 'Pemuatan' :
                           track.status === 'TRANSIT' ? 'Dalam Perjalanan' :
                           track.status === 'LANSIR' ? 'Pengiriman Lokal' :
                           track.status === 'TERKIRIM' ? 'Terkirim' :
                           track.status === 'RETURN' ? 'Dikembalikan (Return)' :
                           track.status}
                        </Typography>
                        <Typography variant="body2">
                          {track.location} - {track.description || 'Tidak ada deskripsi'}
                        </Typography>
                        {track.notes && (
                          <Typography variant="body2" color="text.secondary">
                            Catatan: {track.notes}
                          </Typography>
                        )}
                      </Paper>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <Alert severity="info" icon={<InfoIcon />}>
                Belum ada riwayat pengiriman untuk STT ini.
              </Alert>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default STTTracker;