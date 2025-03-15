// src/pages/tracking.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  InputAdornment,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalShipping as LocalShippingIcon,
  CheckCircle as CheckCircleIcon,
  Store as StoreIcon,
  ReceiptLong as ReceiptLongIcon,
  QueryBuilder as QueryBuilderIcon
} from '@mui/icons-material';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { trackSTT, clearTrackingData } from '../store/slices/sttSlice';

const TrackingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { trackingData, loading } = useSelector((state: RootState) => state.stt);
  
  const [sttNumber, setSTTNumber] = useState<string>('');
  
  const handleTrack = () => {
    if (sttNumber) {
      dispatch(trackSTT(sttNumber));
    }
  };
  
  const handleReset = () => {
    setSTTNumber('');
    dispatch(clearTrackingData());
  };
  
  const getSteps = () => {
    const steps = [
      {
        label: 'STT Dibuat',
        description: 'STT telah dibuat di sistem',
        icon: <ReceiptLongIcon />,
      },
      {
        label: 'Barang Dimuat',
        description: 'Barang dimuat ke dalam truk untuk pengiriman',
        icon: <LocalShippingIcon />,
      },
      {
        label: 'Dalam Perjalanan',
        description: 'Barang dalam perjalanan ke cabang tujuan',
        icon: <QueryBuilderIcon />,
      },
      {
        label: 'Tiba di Cabang Tujuan',
        description: 'Barang telah tiba di cabang tujuan',
        icon: <StoreIcon />,
      },
      {
        label: 'Terkirim',
        description: 'Barang telah diterima oleh penerima',
        icon: <CheckCircleIcon />,
      },
    ];
    
    // If tracking data is returned, determine the active step
    if (trackingData) {
      const statusMap: { [key: string]: number } = {
        'PENDING': 0,
        'MUAT': 1,
        'TRANSIT': 2,
        'LANSIR': 3,
        'TERKIRIM': 4,
        'RETURN': -1, // Special case
      };
      
      const activeStep = statusMap[trackingData.status] || 0;
      
      // Handle return case
      if (trackingData.status === 'RETURN') {
        steps.splice(4, 1, {
          label: 'Barang Diretur',
          description: 'Barang dikembalikan ke cabang asal',
          icon: <CheckCircleIcon color="error" />,
        });
      }
      
      return {
        steps,
        activeStep,
      };
    }
    
    return {
      steps,
      activeStep: -1,
    };
  };
  
  const { steps, activeStep } = getSteps();
  
  return (
    <>
      <Head>
        <title>Tracking STT - Samudra ERP</title>
      </Head>
      
      <Container maxWidth="md">
        <Box pt={4} pb={8}>
          <Typography variant="h4" align="center" gutterBottom>
            Lacak Pengiriman
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" paragraph>
            Masukkan nomor STT untuk melacak status pengiriman Anda
          </Typography>
          
          <Box display="flex" justifyContent="center" mb={4}>
            <Paper
              component="form"
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: 500,
                maxWidth: '100%',
              }}
              onSubmit={(e) => {
                e.preventDefault();
                handleTrack();
              }}
            >
              <TextField
                fullWidth
                placeholder="Masukkan nomor STT (contoh: JKT-010224-0001)"
                value={sttNumber}
                onChange={(e) => setSTTNumber(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ ml: 1, flex: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ p: '10px', m: '5px' }}
                disabled={!sttNumber || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Lacak'}
              </Button>
            </Paper>
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress />
            </Box>
          ) : trackingData ? (
            <Box>
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Detail Pengiriman
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          No. STT
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {trackingData.noSTT}
                        </Typography>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight="medium"
                          color={trackingData.status === 'TERKIRIM' ? 'success.main' : 
                                 trackingData.status === 'RETURN' ? 'error.main' : 
                                 'inherit'}
                        >
                          {trackingData.status}
                        </Typography>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Tanggal Dibuat
                        </Typography>
                        <Typography variant="body1">
                          {new Date(trackingData.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </Typography>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Terakhir Diupdate
                        </Typography>
                        <Typography variant="body1">
                          {new Date(trackingData.updatedAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Pengiriman
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Dari Cabang
                        </Typography>
                        <Typography variant="body1">
                          {trackingData.cabangAsal?.namaCabang || '-'}
                        </Typography>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Ke Cabang
                        </Typography>
                        <Typography variant="body1">
                          {trackingData.cabangTujuan?.namaCabang || '-'}
                        </Typography>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Pengirim
                        </Typography>
                        <Typography variant="body1">
                          {trackingData.pengirim?.nama || '-'}
                        </Typography>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Penerima
                        </Typography>
                        <Typography variant="body1">
                          {trackingData.penerima?.nama || '-'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status Pengiriman
                  </Typography>
                  <Divider sx={{ mb: 4 }} />
                  
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                      <Step key={index}>
                        <StepLabel StepIconComponent={() => (
                          <Box 
                            sx={{ 
                              display: 'inline-flex', 
                              color: index <= activeStep ? 'primary.main' : 'text.disabled',
                              mr: 1
                            }}
                          >
                            {step.icon}
                          </Box>
                        )}>
                          <Typography variant="subtitle1">{step.label}</Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography>{step.description}</Typography>
                          {trackingData.status === 'RETURN' && index === 4 && (
                            <Typography color="error.main" sx={{ mt: 1 }}>
                              Barang diretur karena: {trackingData.keterangan || 'Alasan tidak tersedia'}
                            </Typography>
                          )}
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>
              
              <Box mt={4} display="flex" justifyContent="center">
                <Button variant="outlined" onClick={handleReset}>
                  Lacak STT Lain
                </Button>
              </Box>
            </Box>
          ) : (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              minHeight="50vh"
              sx={{ opacity: 0.7 }}
            >
              <LocalShippingIcon sx={{ fontSize: 100, mb: 2, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary" align="center">
                Masukkan nomor STT untuk melihat status pengiriman
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
};

export default TrackingPage;