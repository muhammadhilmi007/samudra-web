// src/components/collection/PaymentDialog.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  Grid,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { PaymentInput, Collection } from '../../types/collection';
import { addPayment } from '../../store/slices/collectionSlice';
import { AppDispatch } from '../../store';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  collection: Collection;
  onSubmit?: (data: PaymentInput) => void;
  loading?: boolean;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  collection,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [amount, setAmount] = useState<number>(getRemainingBalance());
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const remainingBalance = getRemainingBalance();
    
    if (isNaN(value) || value <= 0) {
      setError('Jumlah pembayaran harus lebih besar dari 0');
    } else if (value > remainingBalance) {
      setError(`Jumlah pembayaran tidak boleh melebihi sisa tagihan (${formatCurrency(remainingBalance)})`);
    } else {
      setError(null);
    }
    setAmount(value);
  };

  // Handle submit
  const handleSubmit = () => {
    if (!amount || amount <= 0) {
      setError('Jumlah pembayaran harus lebih besar dari 0');
      return;
    }

    const remainingBalance = getRemainingBalance();
    if (amount > remainingBalance) {
      setError(`Jumlah pembayaran tidak boleh melebihi sisa tagihan (${formatCurrency(remainingBalance)})`);
      return;
    }

    // Validate payment date
    const paymentDate = new Date(date);
    const today = new Date();
    if (paymentDate > today) {
      setError('Tanggal pembayaran tidak boleh lebih dari hari ini');
      return;
    }

    const paymentData: PaymentInput = {
      collectionId: collection._id,
      jumlah: amount,
      tanggal: date,
      keterangan: notes,
    };

    try {
      // Dispatch the payment action
      await dispatch(addPayment(paymentData)).unwrap();

      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(paymentData);
      }

      // Close the dialog
      onClose();
    } catch (error: any) {
      setError(error.message || 'Gagal memproses pembayaran');
    }
  };

  // Calculate max payment amount (remaining balance)
  const getRemainingBalance = () => {
    const paidAmount = collection.jumlahBayarTermin?.reduce(
      (sum, payment) => sum + payment.jumlah,
      0
    ) || 0;
    return collection.totalTagihan - paidAmount;
  };

  // Get next payment term number
  const getNextTermNumber = () => {
    return (collection.jumlahBayarTermin?.length || 0) + 1;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tambah Pembayaran</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Detail Penagihan
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">No. Penagihan:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {collection.noPenagihan}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Total Tagihan:</Typography>
                <Typography variant="body2">
                  {formatCurrency(collection.totalTagihan)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Sudah Dibayar:</Typography>
                <Typography variant="body2">
                  {formatCurrency(
                    collection.jumlahBayarTermin?.reduce(
                      (sum, payment) => sum + payment.jumlah,
                      0
                    ) || 0
                  )}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Sisa Tagihan:</Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {formatCurrency(getRemainingBalance())}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Informasi Pembayaran
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="Termin Pembayaran"
                value={`Pembayaran ke-${getNextTermNumber()}`}
                margin="normal"
                disabled
              />
              <TextField
                fullWidth
                label="Tanggal Pembayaran"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Jumlah Pembayaran"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                margin="normal"
                error={!!error}
                helperText={error}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">Rp</InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Catatan Pembayaran"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                margin="normal"
                multiline
                rows={2}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading || !!error || amount <= 0}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Simpan Pembayaran
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;