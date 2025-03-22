import React, { useState } from 'react';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { trackSTT, clearSTTs } from '../store/slices/sttSlice';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Paper,
  Divider,
  CircularProgress,
  styled
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  CheckCircle as CheckCircleIcon,
  Store as BuildingIcon,
  ReceiptLong as FileIcon,
  QueryBuilder as ClockIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const StepIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: `2px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  marginRight: theme.spacing(2),
}));

const StepConnector = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 17,
  top: 36,
  height: 'calc(100% - 36px)',
  width: 2,
  backgroundColor: theme.palette.divider,
}));

const StepContent = styled(Box)(({ theme }) => ({
  flex: 1,
  paddingTop: theme.spacing(1),
}));

const TrackingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { trackingData, loading } = useSelector((state: RootState) => state.stt);
  
  const [sttNumber, setSTTNumber] = useState<string>('');
  
  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (sttNumber) {
      dispatch(trackSTT(sttNumber));
    }
  };
  
  const handleReset = () => {
    setSTTNumber('');
    dispatch(clearSTTs());
  };
  
  const getSteps = () => {
    const steps = [
      {
        label: 'STT Dibuat',
        description: 'STT telah dibuat di sistem',
        icon: <FileIcon />,
      },
      {
        label: 'Barang Dimuat',
        description: 'Barang dimuat ke dalam truk untuk pengiriman',
        icon: <TruckIcon />,
      },
      {
        label: 'Dalam Perjalanan',
        description: 'Barang dalam perjalanan ke cabang tujuan',
        icon: <ClockIcon />,
      },
      {
        label: 'Tiba di Cabang Tujuan',
        description: 'Barang telah tiba di cabang tujuan',
        icon: <BuildingIcon />,
      },
      {
        label: 'Terkirim',
        description: 'Barang telah diterima oleh penerima',
        icon: <CheckCircleIcon />,
      },
    ];
    
    if (trackingData) {
      const statusMap: { [key: string]: number } = {
        'PENDING': 0,
        'MUAT': 1,
        'TRANSIT': 2,
        'LANSIR': 3,
        'TERKIRIM': 4,
        'RETURN': -1,
      };
      
      const activeStep = statusMap[trackingData.status] || 0;
      
      if (trackingData.status === 'RETURN') {
        steps[4] = {
          label: 'Barang Diretur',
          description: 'Barang dikembalikan ke cabang asal',
          icon: <CheckCircleIcon color="error" />,
        };
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TERKIRIM':
        return 'success.main';
      case 'RETURN':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };
  
  return (
    <>
      <Head>
        <title>Tracking STT - Samudra ERP</title>
      </Head>
      
      <Container maxWidth="md">
        <Box py={4}>
          <Typography variant="h4" align="center" gutterBottom>
            Lacak Pengiriman
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" paragraph>
            Masukkan nomor STT untuk melacak status pengiriman Anda
          </Typography>
          
          <Box display="flex" justifyContent="center" mb={4}>
            <Paper
              component="form"
              onSubmit={handleTrack}
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: 500,
                maxWidth: '100%',
              }}
            >
              <SearchIcon sx={{ ml: 1, color: 'text.secondary' }} />
              <TextField
                name="sttNumber"
                fullWidth
                placeholder="Masukkan nomor STT (contoh: JKT-010224-0001)"
                value={sttNumber}
                onChange={(e) => setSTTNumber(e.target.value)}
                variant="standard"
                sx={{ ml: 1, flex: 1 }}
                InputProps={{ disableUnderline: true }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!sttNumber || loading}
                sx={{ p: '10px', m: '5px' }}
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
                  <Grid container spacing={4}>
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
                          color={getStatusColor(trackingData.status)}
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
                  
                  <Box>
                    {steps.map((step, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          position: 'relative',
                          pb: index === steps.length - 1 ? 0 : 3,
                        }}
                      >
                        {index !== steps.length - 1 && <StepConnector />}
                        <StepIcon
                          sx={{
                            borderColor: index <= activeStep ? 'primary.main' : 'divider',
                            color: index <= activeStep ? 'primary.main' : 'text.disabled',
                          }}
                        >
                          {step.icon}
                        </StepIcon>
                        <StepContent>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {step.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.description}
                          </Typography>
                          {trackingData.status === 'RETURN' && index === 4 && (
                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                              Barang diretur karena: {trackingData.keterangan || 'Alasan tidak tersedia'}
                            </Typography>
                          )}
                        </StepContent>
                      </Box>
                    ))}
                  </Box>
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
              <TruckIcon sx={{ fontSize: 100, mb: 2, color: 'text.secondary' }} />
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