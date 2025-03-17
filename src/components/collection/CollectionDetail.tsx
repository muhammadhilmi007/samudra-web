// src/components/collection/CollectionDetail.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  LocalAtm as LocalAtmIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarTodayIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { PaymentInput, Collection } from '../../types/collection';
import { STT } from '../../types/stt';
import { Customer } from '../../types/customer';
import { addCollectionPayment, generateCollectionInvoice } from '../../store/slices/collectionSlice';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Schema for payment form
const paymentSchema = z.object({
  jumlah: z.number().min(1, 'Jumlah pembayaran harus lebih dari 0'),
  tanggal: z.string().min(1, 'Tanggal pembayaran wajib diisi'),
  keterangan: z.string().optional(),
});

interface CollectionDetailProps {
  collection: Collection;
  onBack: () => void;
  onEdit: () => void;
}

const CollectionDetail: React.FC<CollectionDetailProps> = ({
  collection,
  onBack,
  onEdit,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { loading } = useSelector((state: RootState) => state.ui);
  
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  // Payment form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      collectionId: collection._id,
      jumlah: collection.totalTagihan - getTotalPaid(),
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: '',
    },
  });
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Get branch name by ID
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    return status === 'LUNAS' ? 'success' : 'error';
  };
  
  // Calculate total paid amount
  const getTotalPaid = () => {
    if (!collection.jumlahBayarTermin || !collection.jumlahBayarTermin.length) {
      return 0;
    }
    
    return collection.jumlahBayarTermin.reduce(
      (total, termin) => total + termin.jumlah, 
      0
    );
  };
  
  // Calculate remaining amount
  const getRemainingAmount = () => {
    return collection.totalTagihan - getTotalPaid();
  };
  
  // Handle open payment dialog
  const handleOpenPaymentDialog = () => {
    // Reset form with default values
    reset({
      collectionId: collection._id,
      jumlah: getRemainingAmount(),
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: '',
    });
    
    setPaymentDialogOpen(true);
  };
  
  // Handle close payment dialog
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
  };
  
  // Handle payment submission
  const handlePaymentSubmit = (data: PaymentInput) => {
    dispatch(addCollectionPayment(data));
    handleClosePaymentDialog();
  };
  
  // Handle generate invoice
  const handleGenerateInvoice = () => {
    dispatch(generateCollectionInvoice(collection._id));
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
        >
          Kembali
        </Button>
        
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
            startIcon={<EditIcon />}
            onClick={onEdit}
          >
            Edit
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Invoice #{collection.noPenagihan}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={1}>
                <Chip
                  label={collection.status}
                  color={getStatusColor(collection.status) as any}
                  sx={{ mr: 1 }}
                />
                
                {collection.overdue && (
                  <Chip
                    label="Terlambat"
                    color="warning"
                  />
                )}
              </Box>
              
              <Box display="flex" alignItems="center" mb={1}>
                <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  <strong>Pelanggan:</strong> {collection.pelanggan?.nama || '-'}
                  {collection.pelanggan?.perusahaan && ` (${collection.pelanggan.perusahaan})`}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" mb={1}>
                <DescriptionIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  <strong>Jumlah STT:</strong> {collection.sttIds?.length || 0}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" mb={1}>
                <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  <strong>Tanggal:</strong> {formatDate(collection.createdAt)}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center">
                <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body1" fontWeight="bold">
                  <strong>Total Tagihan:</strong> {formatCurrency(collection.totalTagihan)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" flexDirection="column" height="100%">
              <Box flexGrow={1}>
                <Typography variant="h6" gutterBottom>
                  Informasi Pembayaran
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Total Tagihan:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(collection.totalTagihan)}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Total Dibayar:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    {formatCurrency(getTotalPaid())}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Sisa Tagihan:</Typography>
                  <Typography variant="body1" fontWeight="bold" color={getRemainingAmount() > 0 ? 'error.main' : 'text.primary'}>
                    {formatCurrency(getRemainingAmount())}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">Status:</Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold"
                    color={collection.status === 'LUNAS' ? 'success.main' : 'error.main'}
                  >
                    {collection.status}
                  </Typography>
                </Box>
                
                {collection.tanggalBayar && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1">Tanggal Pembayaran:</Typography>
                    <Typography variant="body1">
                      {formatDate(collection.tanggalBayar)}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {collection.status !== 'LUNAS' && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenPaymentDialog}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Tambah Pembayaran
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Daftar STT
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>No. STT</TableCell>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Jumlah</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collection.stts && collection.stts.length > 0 ? (
                    collection.stts.map((stt) => (
                      <TableRow key={stt._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <ReceiptIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            {stt.noSTT}
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(stt.createdAt)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={stt.status} 
                            size="small" 
                            color={
                              stt.status === 'TERKIRIM' ? 'success' : 
                              stt.status === 'PENDING' ? 'default' : 
                              stt.status === 'MUAT' ? 'primary' : 
                              stt.status === 'TRANSIT' ? 'info' : 
                              stt.status === 'LANSIR' ? 'warning' : 
                              'error'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(stt.harga)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Tidak ada data STT
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Riwayat Pembayaran
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {!collection.jumlahBayarTermin || collection.jumlahBayarTermin.length === 0 ? (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <Typography variant="body2" color="text.secondary">
                  Belum ada pembayaran
                </Typography>
              </Box>
            ) : (
              <Box>
                {collection.jumlahBayarTermin.map((termin, index) => (
                  <Card 
                    key={index} 
                    variant="outlined"
                    sx={{ mb: 2, bgcolor: 'background.default' }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <LocalAtmIcon sx={{ mr: 1, color: 'success.main' }} />
                          <Typography variant="subtitle1">
                            Pembayaran #{termin.termin}
                          </Typography>
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(termin.jumlah)}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mt={1}>
                        <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatDate(termin.tanggal)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={handleClosePaymentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tambah Pembayaran</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(handlePaymentSubmit)}>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Sisa tagihan: {formatCurrency(getRemainingAmount())}
            </Alert>
            
            <Controller
              name="jumlah"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Jumlah Pembayaran"
                  fullWidth
                  margin="normal"
                  error={!!errors.jumlah}
                  helperText={errors.jumlah?.message}
                  disabled={loading}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            
            <Controller
              name="tanggal"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Tanggal Pembayaran"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.tanggal}
                  helperText={errors.tanggal?.message}
                  disabled={loading}
                />
              )}
            />
            
            <Controller
              name="keterangan"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Keterangan (Opsional)"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NotesIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentDialog} disabled={loading}>
              Batal
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AccountBalanceIcon />}
            >
              Proses Pembayaran
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default CollectionDetail;