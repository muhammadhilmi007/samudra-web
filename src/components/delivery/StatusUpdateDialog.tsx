// src/components/delivery/StatusUpdateDialog.tsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Person as PersonIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { DeliveryStatusUpdate, Delivery } from '../../types/delivery';
import { updateDeliveryStatus } from '../../store/slices/deliverySlice';
import { AppDispatch } from '../../store';

interface StatusUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  delivery: Delivery;
  onSubmit: (data: DeliveryStatusUpdate) => void;
  loading?: boolean;
}

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  open,
  onClose,
  delivery,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string | null>(null);
  
  // Status update fields
  const [status, setStatus] = useState<'LANSIR' | 'TERKIRIM' | 'BELUM_SELESAI'>(
    delivery.status as 'LANSIR' | 'TERKIRIM' | 'BELUM_SELESAI'
  );
  const [kilometerPulang, setKilometerPulang] = useState<number | ''>(
    delivery.kilometerPulang || ''
  );
  const [namaPenerima, setNamaPenerima] = useState<string>(delivery.namaPenerima || '');
  const [keterangan, setKeterangan] = useState<string>(delivery.keterangan || '');

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle kilometer change with validation
  const handleKilometerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? '' : Number(e.target.value);
    
    if (value === '' || value >= 0) {
      setKilometerPulang(value);
      setError(null);
    }
  };

  // Handle status change
  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatus(event.target.value as 'LANSIR' | 'TERKIRIM' | 'BELUM_SELESAI');
  };

  // Validate form before submit
  const validateForm = (): boolean => {
    // Validate based on selected status
    if (status === 'TERKIRIM') {
      if (!namaPenerima.trim()) {
        setError('Nama penerima harus diisi untuk status TERKIRIM');
        return false;
      }
      
      if (kilometerPulang === '') {
        setError('Kilometer pulang harus diisi untuk status TERKIRIM');
        return false;
      }
      
      if (kilometerPulang < (delivery.kilometerBerangkat || 0)) {
        setError('Kilometer pulang harus lebih besar dari kilometer berangkat');
        return false;
      }
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const statusData: DeliveryStatusUpdate = {
      status,
    };
    
    // Add additional data based on status
    if (status === 'TERKIRIM') {
      statusData.kilometerPulang = kilometerPulang as number;
      statusData.namaPenerima = namaPenerima;
      statusData.sampai = new Date().toISOString();
    }
    
    if (keterangan.trim()) {
      statusData.keterangan = keterangan;
    }
    
    onSubmit(statusData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Update Status Pengiriman</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Informasi Pengiriman
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">ID Lansir:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {delivery.idLansir}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Kendaraan:</Typography>
                <Typography variant="body2">
                  {delivery.antrianKendaraan?.kendaraan
                    ? `${delivery.antrianKendaraan.kendaraan.noPolisi} - ${delivery.antrianKendaraan.kendaraan.namaKendaraan}`
                    : '-'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Supir:</Typography>
                <Typography variant="body2">
                  {delivery.antrianKendaraan?.supir?.nama || '-'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Berangkat:</Typography>
                <Typography variant="body2">
                  {formatDate(delivery.berangkat)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Kilometer Awal:</Typography>
                <Typography variant="body2">
                  {delivery.kilometerBerangkat ? `${delivery.kilometerBerangkat} km` : '-'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Jumlah STT:</Typography>
                <Typography variant="body2">
                  {delivery.sttIds?.length || 0}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Update Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Status Pengiriman</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  onChange={handleStatusChange as any}
                  label="Status Pengiriman"
                  disabled={loading}
                >
                  <MenuItem value="LANSIR">LANSIR (Sedang Dikirim)</MenuItem>
                  <MenuItem value="TERKIRIM">TERKIRIM (Sudah Sampai)</MenuItem>
                  <MenuItem value="BELUM_SELESAI">BELUM SELESAI (Pengiriman Bermasalah)</MenuItem>
                </Select>
              </FormControl>
              
              {status === 'TERKIRIM' && (
                <>
                  <TextField
                    label="Kilometer Pulang"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={kilometerPulang}
                    onChange={handleKilometerChange}
                    disabled={loading}
                    error={error?.includes('kilometer')}
                    helperText={error?.includes('kilometer') ? error : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SpeedIcon />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position="end">km</InputAdornment>,
                    }}
                  />
                  
                  <TextField
                    label="Nama Penerima"
                    fullWidth
                    margin="normal"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    disabled={loading}
                    error={error?.includes('penerima')}
                    helperText={error?.includes('penerima') ? error : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Nama orang yang menerima barang"
                  />
                </>
              )}
              
              {status === 'BELUM_SELESAI' && (
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="body2" color="warning.main">
                    Status BELUM SELESAI digunakan jika pengiriman mengalami kendala dan belum dapat diselesaikan.
                    Berikan keterangan yang jelas mengenai permasalahan yang terjadi.
                  </Typography>
                </Box>
              )}
              
              <TextField
                label="Keterangan"
                fullWidth
                margin="normal"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                disabled={loading}
                multiline
                rows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NotesIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder={
                  status === 'BELUM_SELESAI'
                    ? 'Jelaskan permasalahan yang terjadi'
                    : 'Catatan tambahan (opsional)'
                }
              />
              
              {error && !error.includes('kilometer') && !error.includes('penerima') && (
                <FormHelperText error>{error}</FormHelperText>
              )}
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
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateDialog;