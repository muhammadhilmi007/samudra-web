// src/components/stt/STTDetail.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  LocalShipping as ShippingIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Payment as PaymentIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { getSTTById, generateSTTPDF, trackSTT } from '../../store/slices/sttSlice';
import StatusBadge from '../shared/StatusBadge';

interface STTDetailProps {
  id: string;
  onEdit: () => void;
}

// Track status order for stepper
const trackingOrder = [
  'PENDING',
  'MUAT',
  'TRANSIT',
  'LANSIR',
  'TERKIRIM',
];

const STTDetail: React.FC<STTDetailProps> = ({ id, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { stt, loading, pdfUrl, trackingData } = useSelector((state: RootState) => state.stt);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { senders, recipients } = useSelector((state: RootState) => state.customer);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getSTTById(id));
    }
  }, [dispatch, id]);

  // Handle Generate PDF
  const handleGeneratePDF = () => {
    dispatch(generateSTTPDF(id));
  };

  // Handle tracking
  const handleTrackSTT = () => {
    dispatch(trackSTT(stt?.noSTT || ''));
    setTrackingDialogOpen(true);
  };

  // Effect for handling PDF generation
  useEffect(() => {
    if (pdfUrl) {
      // Open PDF in a new tab
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl]);

  // Get branch, sender, and recipient information
  const getBranchName = (branchId: string) => {
    const branch = branches.find((b) => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };

  const getSenderName = (senderId: string) => {
    const sender = senders.find((s) => s._id === senderId);
    return sender ? sender.nama : '-';
  };

  const getRecipientName = (recipientId: string) => {
    const recipient = recipients.find((r) => r._id === recipientId);
    return recipient ? recipient.nama : '-';
  };

  // Get status step for stepper
  const getStatusStep = () => {
    if (!stt) return 0;
    if (stt.status === 'RETURN') return -1; // Special case for returns

    const index = trackingOrder.findIndex((status) => status === stt.status);
    return index >= 0 ? index : 0;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading || !stt) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* STT Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                STT #{stt.noSTT}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <StatusBadge status={stt.status} />
                <Chip
                  label={`${getBranchName(stt.cabangAsalId)} → ${getBranchName(stt.cabangTujuanId)}`}
                  size="small"
                  color="default"
                  variant="outlined"
                  icon={<LocationIcon fontSize="small" />}
                />
                <Chip
                  label={stt.paymentType}
                  size="small"
                  color={
                    stt.paymentType === 'CASH' ? 'success' :
                    stt.paymentType === 'COD' ? 'warning' :
                    'info'
                  }
                  variant="outlined"
                  icon={<PaymentIcon fontSize="small" />}
                />
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={handleGeneratePDF}
              >
                Cetak STT
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={onEdit}
              >
                Edit
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Track shipment stepper */}
          <Box mb={3}>
            {stt.status === 'RETURN' ? (
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'error.light', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <WarningIcon color="error" fontSize="large" />
                <Box>
                  <Typography variant="subtitle1" color="error.dark">
                    Paket Dikembalikan (Return)
                  </Typography>
                  <Typography variant="body2" color="error.dark">
                    Paket ini dikembalikan dan tidak dapat dikirim ke alamat tujuan.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Stepper 
                activeStep={getStatusStep()} 
                alternativeLabel
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
          </Box>
          
          <Box textAlign="center" mb={1}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShippingIcon />}
              onClick={handleTrackSTT}
            >
              Lacak Pengiriman
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Sender & Recipient Information */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
              Informasi Pengirim
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ width: '40%', fontWeight: 500 }}>
                      Nama Pengirim
                    </TableCell>
                    <TableCell>{getSenderName(stt.pengirimId)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>
                      Cabang Asal
                    </TableCell>
                    <TableCell>{getBranchName(stt.cabangAsalId)}</TableCell>
                  </TableRow>
                  {/* Additional sender information would go here */}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
              Informasi Penerima
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ width: '40%', fontWeight: 500 }}>
                      Nama Penerima
                    </TableCell>
                    <TableCell>{getRecipientName(stt.penerimaId)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>
                      Cabang Tujuan
                    </TableCell>
                    <TableCell>{getBranchName(stt.cabangTujuanId)}</TableCell>
                  </TableRow>
                  {/* Additional recipient information would go here */}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Package Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
            Informasi Barang
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ width: '40%', fontWeight: 500 }}>
                        Nama Barang
                      </TableCell>
                      <TableCell>{stt.namaBarang}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>
                        Komoditi
                      </TableCell>
                      <TableCell>{stt.komoditi}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>
                        Packing
                      </TableCell>
                      <TableCell>{stt.packing}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>
                        Keterangan
                      </TableCell>
                      <TableCell>{stt.keterangan || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ width: '40%', fontWeight: 500 }}>
                        Jumlah Colly
                      </TableCell>
                      <TableCell>{stt.jumlahColly}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>
                        Berat
                      </TableCell>
                      <TableCell>{stt.berat} kg</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>
                        Harga per Kilo
                      </TableCell>
                      <TableCell>{formatCurrency(stt.hargaPerKilo)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 500 }}>
                        Total Harga
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'primary.main'
                        }}
                      >
                        {formatCurrency(stt.harga)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Kode Penerus
              </Typography>
              <Chip
                label={(() => {
                  switch (stt.kodePenerus) {
                    case '70': return '70 - NO FORWARDING';
                    case '71': return '71 - FORWARDING PAID BY SENDER';
                    case '72': return '72 - FORWARDING PAID BY RECIPIENT';
                    case '73': return '73 - FORWARDING ADVANCED BY RECIPIENT BRANCH';
                    default: return stt.kodePenerus;
                  }
                })()}
                color="default"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Metode Pembayaran
              </Typography>
              <Chip
                label={(() => {
                  switch (stt.paymentType) {
                    case 'CASH': return 'CASH (Bayar Dimuka)';
                    case 'COD': return 'COD (Cash On Delivery)';
                    case 'CAD': return 'CAD (Cash After Delivery)';
                    default: return stt.paymentType;
                  }
                })()}
                color={
                  stt.paymentType === 'CASH' ? 'success' :
                  stt.paymentType === 'COD' ? 'warning' :
                  'info'
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Additional Information */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <TimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
            Informasi Tambahan
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                ID STT
              </Typography>
              <Typography variant="body1">
                {stt._id}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                No. Barcode
              </Typography>
              <Typography variant="body1">
                {stt.barcode || '-'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Tanggal Dibuat
              </Typography>
              <Typography variant="body1">
                {new Date(stt.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Terakhir Diperbarui
              </Typography>
              <Typography variant="body1">
                {new Date(stt.updatedAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Tracking Dialog */}
      <Dialog
        open={trackingDialogOpen}
        onClose={() => setTrackingDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Lacak Pengiriman STT #{stt.noSTT}
        </DialogTitle>
        <DialogContent dividers>
          {trackingData ? (
            <Timeline position="alternate">
              {trackingData.history?.map((track: any, index: number) => (
                <TimelineItem key={index}>
                  <TimelineOppositeContent color="text.secondary">
                    {new Date(track.timestamp).toLocaleString('id-ID')}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot 
                      color={
                        track.status === 'TERKIRIM' ? 'success' :
                        track.status === 'RETURN' ? 'error' :
                        'primary'
                      }
                    >
                      {track.status === 'TERKIRIM' ? <CheckIcon /> : 
                       track.status === 'RETURN' ? <WarningIcon /> : 
                       <DeliveryIcon />}
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
            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
              <CircularProgress size={40} sx={{ mr: 2 }} />
              <Typography>Memuat data pelacakan...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackingDialogOpen(false)}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default STTDetail;