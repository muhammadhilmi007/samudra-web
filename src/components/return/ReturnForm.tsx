// src/components/return/ReturnForm.tsx
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getSTTsByStatus } from '../../store/slices/sttSlice';
import { Return, ReturnFormInputs } from '../../types/return';
import { STT } from '../../types/stt';
import StatusBadge from '../shared/StatusBadge';

// Validation schema for return form
const returnSchema = z.object({
  sttIds: z.array(z.string()).min(1, 'Pilih minimal satu STT untuk diretur'),
  tanggalKirim: z.string().min(1, 'Tanggal kirim retur wajib diisi'),
  cabangId: z.string().min(1, 'Cabang wajib dipilih'),
});

interface ReturnFormProps {
  initialData?: Return;
  onSubmit: (data: ReturnFormInputs) => void;
  loading?: boolean;
}

const ReturnForm: React.FC<ReturnFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { sttList } = useSelector((state: RootState) => state.stt);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSTTs, setAvailableSTTs] = useState<STT[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReturnFormInputs>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      sttIds: initialData?.sttIds || [],
      tanggalKirim: initialData?.tanggalKirim 
        ? new Date(initialData.tanggalKirim).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      cabangId: initialData?.cabangId || user?.cabangId || '',
    },
  });

  // Selected branch
  const selectedCabangId = watch('cabangId');
  const selectedSttIds = watch('sttIds');

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getBranches());
    
    // Get STTs in TERKIRIM status that can be returned
    dispatch(getSTTsByStatus('TERKIRIM'));
  }, [dispatch]);

  // Filter STTs by search term and branch
  useEffect(() => {
    // Filter STTs that are in status TERKIRIM and belong to the selected branch
    let filteredSTTs = sttList.filter(
      (stt) => stt.status === 'TERKIRIM' && stt.cabangTujuanId === selectedCabangId
    );

    // Apply search filter if any
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filteredSTTs = filteredSTTs.filter(
        (stt) =>
          stt.noSTT.toLowerCase().includes(lowercaseSearch) ||
          stt.namaBarang.toLowerCase().includes(lowercaseSearch) ||
          stt.pengirim?.nama.toLowerCase().includes(lowercaseSearch) ||
          stt.penerima?.nama.toLowerCase().includes(lowercaseSearch)
      );
    }

    setAvailableSTTs(filteredSTTs);
  }, [sttList, selectedCabangId, searchTerm]);

  // Handle STT selection/deselection
  const handleSTTSelection = (sttId: string) => {
    const currentSelection = [...selectedSttIds];
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
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            Informasi Retur
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

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
                  disabled={loading || !!user?.cabangId}
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
            name="tanggalKirim"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="Tanggal Kirim Retur"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.tanggalKirim}
                helperText={errors.tanggalKirim?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" mt={2}>
            Pilih STT untuk Retur
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box mb={2}>
            <TextField
              fullWidth
              placeholder="Cari STT berdasarkan nomor, nama barang, pengirim, atau penerima"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading || !selectedCabangId}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          {!selectedCabangId ? (
            <Box display="flex" alignItems="center" justifyContent="center" p={3}>
              <Typography color="text.secondary">
                Pilih cabang terlebih dahulu untuk melihat STT yang tersedia
              </Typography>
            </Box>
          ) : availableSTTs.length === 0 ? (
            <Box display="flex" alignItems="center" justifyContent="center" p={3}>
              <Typography color="text.secondary">
                Tidak ada STT yang tersedia untuk retur di cabang ini
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          indeterminate={
                            selectedSttIds.length > 0 && selectedSttIds.length < availableSTTs.length
                          }
                          checked={
                            availableSTTs.length > 0 && selectedSttIds.length === availableSTTs.length
                          }
                          onChange={() => {
                            if (selectedSttIds.length === availableSTTs.length) {
                              setValue('sttIds', []);
                            } else {
                              setValue(
                                'sttIds',
                                availableSTTs.map((stt) => stt._id)
                              );
                            }
                          }}
                          disabled={loading}
                        />
                      </TableCell>
                      <TableCell>No. STT</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Pengirim</TableCell>
                      <TableCell>Penerima</TableCell>
                      <TableCell>Barang</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Nilai</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableSTTs.map((stt) => (
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
                        <TableCell>{formatDate(stt.createdAt)}</TableCell>
                        <TableCell>{stt.pengirim?.nama || '-'}</TableCell>
                        <TableCell>{stt.penerima?.nama || '-'}</TableCell>
                        <TableCell>{stt.namaBarang}</TableCell>
                        <TableCell>
                          <StatusBadge status={stt.status} />
                        </TableCell>
                        <TableCell align="right">{formatCurrency(stt.harga)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {errors.sttIds && (
                <FormHelperText error sx={{ mt: 1 }}>
                  {errors.sttIds.message}
                </FormHelperText>
              )}
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Typography variant="body2" color="text.secondary">
                  {selectedSttIds.length} dari {availableSTTs.length} STT dipilih
                </Typography>
                {selectedSttIds.length > 0 && (
                  <Box>
                    <Typography variant="body2">
                      Total Nilai:{' '}
                      <strong>
                        {formatCurrency(
                          availableSTTs
                            .filter((stt) => selectedSttIds.includes(stt._id))
                            .reduce((sum, stt) => sum + stt.harga, 0)
                        )}
                      </strong>
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SwapHorizIcon />}
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            {initialData ? 'Perbarui Retur' : 'Buat Retur'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReturnForm;