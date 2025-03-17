// src/components/collection/CollectionForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Typography,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  InputAdornment,
  MenuItem,
  Autocomplete,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ReceiptLong as ReceiptLongIcon,
  Info as InfoIcon,
  Clear as ClearIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getCustomers, getCustomersByType } from '../../store/slices/customerSlice';
import { getSTTsByCustomer, getSTTsByPaymentType } from '../../store/slices/sttSlice';
import { Collection, CollectionFormInputs } from '../../types/collection';
import { Customer } from '../../types/customer';
import { STT } from '../../types/stt';

// Validation schema
const collectionSchema = z.object({
  pelangganId: z.string().min(1, 'Pelanggan wajib dipilih'),
  tipePelanggan: z.enum(['Pengirim', 'Penerima'], {
    errorMap: () => ({ message: 'Tipe pelanggan wajib dipilih' }),
  }),
  sttIds: z.array(z.string()).min(1, 'Minimal satu STT harus dipilih'),
  cabangId: z.string().min(1, 'Cabang wajib dipilih'),
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
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [availableSTTs, setAvailableSTTs] = useState<STT[]>([]);
  const [selectedCustomerData, setSelectedCustomerData] = useState<Customer | null>(null);
  const [sttSearchTerm, setSTTSearchTerm] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string | null>(null);
  
  // Form setup with validation
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
      cabangId: initialData?.cabangId || user?.cabangId || '',
    },
  });
  
  // Watch form values
  const selectedPelangganId = watch('pelangganId');
  const selectedTipePelanggan = watch('tipePelanggan');
  const selectedSTTIds = watch('sttIds');
  const selectedCabangId = watch('cabangId');
  
  // Fetch initial data
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getCustomers());
    
    // If we have initial data, load related STTs
    if (initialData) {
      if (initialData.pelangganId) {
        dispatch(getSTTsByCustomer(initialData.pelangganId));
      }
      
      // Set selected customer data
      const customer = customers.find(c => c._id === initialData.pelangganId);
      if (customer) {
        setSelectedCustomerData(customer);
      }
    }
  }, [dispatch, initialData]);
  
  // When customer changes, fetch their STTs
  useEffect(() => {
    if (selectedPelangganId) {
      // Set selected customer data
      const customer = customers.find(c => c._id === selectedPelangganId);
      setSelectedCustomerData(customer || null);
      
      // Load STTs for this customer
      dispatch(getSTTsByCustomer(selectedPelangganId));
    } else {
      setSelectedCustomerData(null);
      setAvailableSTTs([]);
    }
  }, [dispatch, selectedPelangganId, customers]);
  
  // Filter available STTs based on payment type
  useEffect(() => {
    if (paymentTypeFilter) {
      dispatch(getSTTsByPaymentType(paymentTypeFilter));
    }
  }, [dispatch, paymentTypeFilter]);
  
  // Filter STTs by customer type, payment status and search term
  useEffect(() => {
    // Start with all STTs for this customer
    let filteredSTTs = [...sttList];
    
    // Filter by customer type
    if (selectedTipePelanggan === 'Pengirim') {
      filteredSTTs = filteredSTTs.filter(stt => stt.pengirimId === selectedPelangganId);
    } else if (selectedTipePelanggan === 'Penerima') {
      filteredSTTs = filteredSTTs.filter(stt => stt.penerimaId === selectedPelangganId);
    }
    
    // Filter by payment type
    if (paymentTypeFilter) {
      filteredSTTs = filteredSTTs.filter(stt => stt.paymentType === paymentTypeFilter);
    }
    
    // Filter by payment status - only show STTs that haven't been fully paid
    filteredSTTs = filteredSTTs.filter(stt => {
      // If the STT is already in a collection that's not this one, exclude it
      // Real implementation would check if it's already in a collection that's fully paid
      
      // For now, just exclude STTs that are already in a collection
      if (initialData) {
        // If we're editing, keep the STTs that are already in this collection
        return !stt.collectionIds || 
              !stt.collectionIds.length || 
              (initialData.sttIds && initialData.sttIds.includes(stt._id));
      } else {
        // If we're creating, exclude STTs that are already in any collection
        return !stt.collectionIds || !stt.collectionIds.length;
      }
    });
    
    // Search filter
    if (sttSearchTerm) {
      const term = sttSearchTerm.toLowerCase();
      filteredSTTs = filteredSTTs.filter(
        stt => 
          stt.noSTT.toLowerCase().includes(term) ||
          stt.namaBarang.toLowerCase().includes(term) ||
          (stt.pengirim?.nama && stt.pengirim.nama.toLowerCase().includes(term)) ||
          (stt.penerima?.nama && stt.penerima.nama.toLowerCase().includes(term))
      );
    }
    
    setAvailableSTTs(filteredSTTs);
  }, [sttList, selectedPelangganId, selectedTipePelanggan, paymentTypeFilter, sttSearchTerm, initialData]);
  
  // When customer type changes, reset STT selection
  useEffect(() => {
    // Reset selected STTs when customer type changes
    setValue('sttIds', []);
  }, [selectedTipePelanggan, setValue]);
  
  // Handle payment type filter change
  const handlePaymentTypeFilterChange = (type: string | null) => {
    setPaymentTypeFilter(type);
  };
  
  // Handle STT selection
  const handleSTTSelection = (sttId: string) => {
    const currentSelection = [...selectedSTTIds];
    const index = currentSelection.indexOf(sttId);
    
    if (index === -1) {
      // Add to selection
      setValue('sttIds', [...currentSelection, sttId]);
    } else {
      // Remove from selection
      currentSelection.splice(index, 1);
      setValue('sttIds', currentSelection);
    }
  };
  
  // Handle select all STTs
  const handleSelectAllSTTs = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setValue(
        'sttIds',
        availableSTTs.map(stt => stt._id)
      );
    } else {
      setValue('sttIds', []);
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
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Calculate total amount
  const calculateTotal = () => {
    return availableSTTs
      .filter(stt => selectedSTTIds.includes(stt._id))
      .reduce((total, stt) => total + stt.harga, 0);
  };
  
  // Reset form
  const handleReset = () => {
    reset({
      pelangganId: '',
      tipePelanggan: 'Pengirim',
      sttIds: [],
      cabangId: user?.cabangId || '',
    });
    setSTTSearchTerm('');
    setPaymentTypeFilter(null);
  };
  
  // Filter customers based on type
  const filteredCustomers = customers.filter(
    customer => 
      selectedTipePelanggan === 'Pengirim' 
        ? (customer.tipe === 'Pengirim' || customer.tipe === 'Keduanya')
        : (customer.tipe === 'Penerima' || customer.tipe === 'Keduanya')
  );
  
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            Informasi Penagihan
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="tipePelanggan"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.tipePelanggan} disabled={loading}>
                <InputLabel id="customer-type-label">Tipe Pelanggan *</InputLabel>
                <Select
                  {...field}
                  labelId="customer-type-label"
                  label="Tipe Pelanggan *"
                >
                  <MenuItem value="Pengirim">Pengirim</MenuItem>
                  <MenuItem value="Penerima">Penerima</MenuItem>
                </Select>
                {errors.tipePelanggan && (
                  <FormHelperText>{errors.tipePelanggan.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="pelangganId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={filteredCustomers}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.nama + (option.perusahaan ? ` - ${option.perusahaan}` : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pilih Pelanggan *"
                    error={!!errors.pelangganId}
                    helperText={errors.pelangganId?.message}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                onChange={(_, newValue) => {
                  field.onChange(newValue ? newValue._id : '');
                }}
                disabled={loading}
                isOptionEqualToValue={(option, value) => 
                  option._id === value._id
                }
                value={filteredCustomers.find(c => c._id === field.value) || null}
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="cabangId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.cabangId} disabled={loading || !!user?.cabangId}>
                <InputLabel id="branch-label">Cabang *</InputLabel>
                <Select
                  {...field}
                  labelId="branch-label"
                  label="Cabang *"
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id}>
                      {branch.namaCabang}
                    </MenuItem>
                  ))}
                </Select>
                {errors.cabangId && <FormHelperText>{errors.cabangId.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
        
        {selectedCustomerData && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom>
                Informasi Pelanggan
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Nama:</strong> {selectedCustomerData.nama}
                    </Typography>
                  </Box>
                  
                  {selectedCustomerData.perusahaan && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Perusahaan:</strong> {selectedCustomerData.perusahaan}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Telepon:</strong> {selectedCustomerData.telepon}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="flex-start" mb={1}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      <strong>Alamat:</strong> {selectedCustomerData.alamat}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" mt={2}>
            Pilih STT untuk Penagihan
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={2}
            gap={2}
            flexDirection={{ xs: 'column', sm: 'row' }}
          >
            <TextField
              fullWidth
              size="small"
              label="Cari STT"
              variant="outlined"
              value={sttSearchTerm}
              onChange={(e) => setSTTSearchTerm(e.target.value)}
              disabled={!selectedPelangganId || loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box display="flex" gap={1}>
              <Button
                variant={paymentTypeFilter === 'CASH' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handlePaymentTypeFilterChange(paymentTypeFilter === 'CASH' ? null : 'CASH')}
                disabled={!selectedPelangganId || loading}
                startIcon={<AttachMoneyIcon />}
              >
                CASH
              </Button>
              
              <Button
                variant={paymentTypeFilter === 'COD' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handlePaymentTypeFilterChange(paymentTypeFilter === 'COD' ? null : 'COD')}
                disabled={!selectedPelangganId || loading}
                startIcon={<AttachMoneyIcon />}
              >
                COD
              </Button>
              
              <Button
                variant={paymentTypeFilter === 'CAD' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handlePaymentTypeFilterChange(paymentTypeFilter === 'CAD' ? null : 'CAD')}
                disabled={!selectedPelangganId || loading}
                startIcon={<AttachMoneyIcon />}
              >
                CAD
              </Button>
              
              <Tooltip title="Reset Filter">
                <IconButton 
                  size="small" 
                  onClick={() => {
                    setPaymentTypeFilter(null);
                    setSTTSearchTerm('');
                  }}
                  disabled={!selectedPelangganId || loading}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {!selectedPelangganId ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Pilih pelanggan terlebih dahulu untuk melihat daftar STT
              </Typography>
            </Paper>
          ) : loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : availableSTTs.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Tidak ada STT yang tersedia untuk penagihan
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {paymentTypeFilter ? 'Coba ubah filter tipe pembayaran' : 'Pelanggan ini tidak memiliki STT yang belum dibayar'}
              </Typography>
            </Paper>
          ) : (
            <Paper variant="outlined">
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          indeterminate={
                            selectedSTTIds.length > 0 && selectedSTTIds.length < availableSTTs.length
                          }
                          checked={
                            availableSTTs.length > 0 && selectedSTTIds.length === availableSTTs.length
                          }
                          onChange={handleSelectAllSTTs}
                          disabled={loading}
                        />
                      </TableCell>
                      <TableCell>No. STT</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Barang</TableCell>
                      <TableCell>Pengirim</TableCell>
                      <TableCell>Penerima</TableCell>
                      <TableCell>Pembayaran</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Jumlah</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableSTTs.map((stt) => (
                      <TableRow
                        key={stt._id}
                        hover
                        selected={selectedSTTIds.includes(stt._id)}
                        onClick={() => handleSTTSelection(stt._id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={selectedSTTIds.includes(stt._id)}
                            onChange={() => handleSTTSelection(stt._id)}
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <ReceiptIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            {stt.noSTT}
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(stt.createdAt)}</TableCell>
                        <TableCell>{stt.namaBarang}</TableCell>
                        <TableCell>{stt.pengirim?.nama || '-'}</TableCell>
                        <TableCell>{stt.penerima?.nama || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={stt.paymentType} 
                            size="small" 
                            color={
                              stt.paymentType === 'CASH' ? 'success' : 
                              stt.paymentType === 'COD' ? 'primary' : 
                              'warning'
                            }
                          />
                        </TableCell>
                        <TableCell>{stt.status}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium">
                            {formatCurrency(stt.harga)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {errors.sttIds && (
                <Box p={2} color="error.main">
                  <Typography variant="body2" color="inherit">
                    {errors.sttIds.message}
                  </Typography>
                </Box>
              )}
              
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                bgcolor="background.default"
                borderTop={1}
                borderColor="divider"
              >
                <Typography variant="body2">
                  {selectedSTTIds.length} dari {availableSTTs.length} STT dipilih
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total: {formatCurrency(calculateTotal())}
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AttachMoneyIcon />}
            disabled={loading || !selectedPelangganId || selectedSTTIds.length === 0}
          >
            {initialData ? 'Perbarui Penagihan' : 'Buat Penagihan'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CollectionForm;