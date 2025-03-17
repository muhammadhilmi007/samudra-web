// src/components/collection/CollectionForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  FormHelperText,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getCustomers } from '../../store/slices/customerSlice';
import { getSTTsByStatus } from '../../store/slices/sttSlice';
import { Collection, CollectionFormInputs } from '../../types/collection';
import { STT } from '../../types/stt';
import StatusBadge from '../shared/StatusBadge';

// Validation schema
const collectionSchema = z.object({
  pelangganId: z.string().min(1, 'Customer harus dipilih'),
  tipePelanggan: z.string().min(1, 'Tipe pelanggan harus dipilih'),
  sttIds: z.array(z.string()).min(1, 'Minimal satu STT harus dipilih'),
  cabangId: z.string().min(1, 'Cabang harus dipilih'),
  overdue: z.boolean().optional(),
  totalTagihan: z.number().min(0),
  status: z.string().min(1, 'Status harus dipilih'),
});

interface CollectionFormProps {
  initialData?: Collection;
  onSubmit: (data: CollectionFormInputs) => void;
  loading?: boolean;
}

const CollectionForm: React.FC<CollectionFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { customers } = useSelector((state: RootState) => state.customer);
  const { sttList } = useSelector((state: RootState) => state.stt);
  
  const [selectedSTTs, setSelectedSTTs] = useState<STT[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerType, setCustomerType] = useState(initialData?.tipePelanggan || 'Pengirim');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CollectionFormInputs>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      pelangganId: initialData?.pelangganId || '',
      tipePelanggan: initialData?.tipePelanggan || 'Pengirim',
      sttIds: initialData?.sttIds || [],
      cabangId: initialData?.cabangId || '',
      overdue: initialData?.overdue || false,
      totalTagihan: initialData?.totalTagihan || 0,
      status: initialData?.status || 'BELUM LUNAS',
    },
  });

  // Watch values
  const selectedCustomerId = watch('pelangganId');
  const selectedSttIds = watch('sttIds');
  const selectedCabangId = watch('cabangId');

  // Load data on component mount
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getCustomers());
    
    // Get unpaid STTs
    dispatch(getSTTsByStatus('TERKIRIM'));
  }, [dispatch]);

  // Filter STTs based on customer type and ID
  useEffect(() => {
    if (selectedCustomerId && customerType) {
      const relevantSTTs = sttList.filter(stt => {
        if (customerType === 'Pengirim') {
          return stt.pengirimId === selectedCustomerId;
        } else {
          return stt.penerimaId === selectedCustomerId;
        }
      });
      
      setSelectedSTTs(relevantSTTs);
      
      // If initialData is not provided, reset selected STTs
      if (!initialData) {
        setValue('sttIds', []);
      }
    }
  }, [selectedCustomerId, customerType, sttList, setValue, initialData]);

  // Calculate total amount when selected STTs change
  useEffect(() => {
    const totalAmount = sttList
      .filter(stt => selectedSttIds.includes(stt._id))
      .reduce((total, stt) => total + stt.harga, 0);
    
    setValue('totalTagihan', totalAmount);
  }, [selectedSttIds, sttList, setValue]);

  // Handle customer type change
  const handleCustomerTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomerType(value);
    setValue('tipePelanggan', value);
    setValue('sttIds', []);
  };

  // Handle STT selection
  const handleSTTSelection = (sttId: string) => {
    const currentSelected = [...selectedSttIds];
    const index = currentSelected.indexOf(sttId);
    
    if (index === -1) {
      currentSelected.push(sttId);
    } else {
      currentSelected.splice(index, 1);
    }
    
    setValue('sttIds', currentSelected);
  };

  // Filter STTs by search term
  const filteredSTTs = selectedSTTs.filter(stt => {
    if (!searchTerm) return true;
    
    return (
      stt.noSTT.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stt.namaBarang.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Penagihan
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="cabangId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.cabangId}>
                      <InputLabel id="cabang-label">Cabang</InputLabel>
                      <Select
                        {...field}
                        labelId="cabang-label"
                        label="Cabang"
                        disabled={loading}
                      >
                        {branches.map((branch) => (
                          <MenuItem key={branch._id} value={branch._id}>
                            {branch.namaCabang}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.cabangId && (
                        <FormHelperText>{errors.cabangId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel id="status-label">Status Penagihan</InputLabel>
                      <Select
                        {...field}
                        labelId="status-label"
                        label="Status Penagihan"
                        disabled={loading}
                      >
                        <MenuItem value="BELUM LUNAS">BELUM LUNAS</MenuItem>
                        <MenuItem value="LUNAS">LUNAS</MenuItem>
                      </Select>
                      {errors.status && (
                        <FormHelperText>{errors.status.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="overdue"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          disabled={loading}
                        />
                      }
                      label="Tandai sebagai Overdue (Jatuh Tempo)"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Customer
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle2" gutterBottom>
                    Tipe Customer
                  </Typography>
                  <Controller
                    name="tipePelanggan"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        {...field}
                        row
                        onChange={handleCustomerTypeChange}
                      >
                        <FormControlLabel
                          value="Pengirim"
                          control={<Radio />}
                          label="Pengirim (Sender)"
                          disabled={loading}
                        />
                        <FormControlLabel
                          value="Penerima"
                          control={<Radio />}
                          label="Penerima (Recipient)"
                          disabled={loading}
                        />
                      </RadioGroup>
                    )}
                  />
                  {errors.tipePelanggan && (
                    <FormHelperText error>{errors.tipePelanggan.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="pelangganId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.pelangganId}>
                      <InputLabel id="customer-label">Customer</InputLabel>
                      <Select
                        {...field}
                        labelId="customer-label"
                        label="Customer"
                        disabled={loading}
                      >
                        {customers
                          .filter(customer => {
                            if (customerType === 'Pengirim') {
                              return customer.tipe === 'Pengirim' || customer.tipe === 'Keduanya';
                            } else {
                              return customer.tipe === 'Penerima' || customer.tipe === 'Keduanya';
                            }
                          })
                          .map((customer) => (
                            <MenuItem key={customer._id} value={customer._id}>
                              {customer.nama} - {customer.telepon}
                            </MenuItem>
                          ))}
                      </Select>
                      {errors.pelangganId && (
                        <FormHelperText>{errors.pelangganId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Pilih STT untuk Penagihan
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box mb={2}>
              <TextField
                fullWidth
                placeholder="Cari STT berdasarkan nomor atau nama barang"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading || !selectedCustomerId}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Box>
            
            {selectedCustomerId ? (
              <>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            indeterminate={
                              selectedSttIds.length > 0 && selectedSttIds.length < filteredSTTs.length
                            }
                            checked={
                              filteredSTTs.length > 0 && selectedSttIds.length === filteredSTTs.length
                            }
                            onChange={() => {
                              if (selectedSttIds.length === filteredSTTs.length) {
                                setValue('sttIds', []);
                              } else {
                                setValue(
                                  'sttIds',
                                  filteredSTTs.map((stt) => stt._id)
                                );
                              }
                            }}
                            disabled={loading || filteredSTTs.length === 0}
                          />
                        </TableCell>
                        <TableCell>No. STT</TableCell>
                        <TableCell>Tanggal</TableCell>
                        <TableCell>Barang</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Jumlah</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSTTs.length > 0 ? (
                        filteredSTTs.map((stt) => (
                          <TableRow
                            key={stt._id}
                            hover
                            onClick={() => handleSTTSelection(stt._id)}
                            selected={selectedSttIds.includes(stt._id)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={selectedSttIds.includes(stt._id)}
                                onChange={() => handleSTTSelection(stt._id)}
                                disabled={loading}
                              />
                            </TableCell>
                            <TableCell>{stt.noSTT}</TableCell>
                            <TableCell>
                              {new Date(stt.createdAt).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>{stt.namaBarang}</TableCell>
                            <TableCell>
                              <StatusBadge status={stt.status} />
                            </TableCell>
                            <TableCell align="right">{formatCurrency(stt.harga)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                            Tidak ada STT tersedia untuk customer ini
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {errors.sttIds && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {errors.sttIds.message}
                  </FormHelperText>
                )}
                
                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">
                    STT terpilih: {selectedSttIds.length} dari {filteredSTTs.length}
                  </Typography>
                  <Typography variant="h6">
                    Total Tagihan: {formatCurrency(watch('totalTagihan'))}
                  </Typography>
                </Box>
              </>
            ) : (
              <Box py={3} textAlign="center">
                <Typography color="text.secondary">
                  Pilih customer terlebih dahulu untuk melihat daftar STT
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            fullWidth
          >
            {initialData ? 'Perbarui Penagihan' : 'Buat Penagihan'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CollectionForm;