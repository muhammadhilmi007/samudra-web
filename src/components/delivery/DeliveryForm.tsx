// src/components/delivery/DeliveryForm.tsx
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
  InputAdornment,
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getSTTsByStatus } from '../../store/slices/sttSlice';
import { getVehicleQueues } from '../../store/slices/deliverySlice';
import { getEmployeesByRole } from '../../store/slices/employeeSlice';
import { Delivery, DeliveryFormInputs, VehicleQueue } from '../../types/delivery';
import { STT } from '../../types/stt';
import StatusBadge from '../shared/StatusBadge';

// Validation schema for delivery form
const deliverySchema = z.object({
  sttIds: z.array(z.string()).min(1, 'Pilih minimal satu STT'),
  antrianKendaraanId: z.string().min(1, 'Kendaraan wajib dipilih'),
  checkerId: z.string().min(1, 'Checker wajib dipilih'),
  adminId: z.string().optional(),
  estimasiLansir: z.string().min(1, 'Estimasi waktu wajib diisi'),
  kilometerBerangkat: z.number().min(0, 'Kilometer awal tidak boleh negatif'),
  cabangId: z.string().min(1, 'Cabang wajib dipilih'),
});

interface DeliveryFormProps {
  initialData?: Delivery;
  onSubmit: (data: DeliveryFormInputs) => void;
  loading?: boolean;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { sttList } = useSelector((state: RootState) => state.stt);
  const { vehicleQueues } = useSelector((state: RootState) => state.delivery);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSTTs, setAvailableSTTs] = useState<STT[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DeliveryFormInputs>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      sttIds: initialData?.sttIds || [],
      antrianKendaraanId: initialData?.antrianKendaraanId || '',
      checkerId: initialData?.checkerId || '',
      adminId: initialData?.adminId || '',
      estimasiLansir: initialData?.estimasiLansir || '',
      kilometerBerangkat: initialData?.kilometerBerangkat || 0,
      cabangId: initialData?.cabangId || user?.cabangId || '',
    },
  });

  // Selected values from form
  const selectedCabangId = watch('cabangId');
  const selectedSttIds = watch('sttIds');

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getEmployeesByRole('checker'));
    
    // Get STTs in TRANSIT status (ready for delivery)
    dispatch(getSTTsByStatus('TRANSIT'));
    
    // Get available vehicle queues
    if (selectedCabangId) {
      dispatch(getVehicleQueues(selectedCabangId));
    }
  }, [dispatch, selectedCabangId]);

  // Filter STTs by cabang, status and search term
  useEffect(() => {
    // Filter STTs that are in status TRANSIT and belong to the selected branch
    let filteredSTTs = sttList.filter(
      (stt) => stt.status === 'TRANSIT' && stt.cabangTujuanId === selectedCabangId
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

  // Get checkers (employees with checker role)
  const checkers = employees.filter(
    (emp) => emp.role?.toLowerCase().includes('checker') || emp.jabatan?.toLowerCase().includes('checker')
  );

  // Get admin staff for optional admin field
  const admins = employees.filter(
    (emp) => emp.role?.toLowerCase().includes('admin') || emp.jabatan?.toLowerCase().includes('staff admin')
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get vehicle information from queue
  const getVehicleInfo = (queueId: string) => {
    const queue = vehicleQueues.find((q) => q._id === queueId);
    if (!queue) return null;
    
    return {
      vehicle: queue.kendaraan?.namaKendaraan,
      plate: queue.kendaraan?.noPolisi,
      driver: queue.supir?.nama,
      assistant: queue.kenek?.nama,
    };
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            Informasi Umum
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
            name="antrianKendaraanId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.antrianKendaraanId}>
                <InputLabel id="kendaraan-label">Kendaraan</InputLabel>
                <Select
                  {...field}
                  labelId="kendaraan-label"
                  label="Kendaraan"
                  disabled={loading || !selectedCabangId}
                >
                  {vehicleQueues
                    .filter((queue) => queue.status === 'MENUNGGU')
                    .map((queue) => (
                      <MenuItem key={queue._id} value={queue._id}>
                        {queue.kendaraan?.noPolisi} - {queue.kendaraan?.namaKendaraan} ({queue.supir?.nama})
                      </MenuItem>
                    ))}
                </Select>
                {errors.antrianKendaraanId && (
                  <FormHelperText>{errors.antrianKendaraanId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="checkerId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.checkerId}>
                <InputLabel id="checker-label">Petugas Checker</InputLabel>
                <Select
                  {...field}
                  labelId="checker-label"
                  label="Petugas Checker"
                  disabled={loading}
                >
                  {checkers.map((checker) => (
                    <MenuItem key={checker._id} value={checker._id}>
                      {checker.nama}
                    </MenuItem>
                  ))}
                </Select>
                {errors.checkerId && (
                  <FormHelperText>{errors.checkerId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="adminId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="admin-label">Admin (Opsional)</InputLabel>
                <Select
                  {...field}
                  labelId="admin-label"
                  label="Admin (Opsional)"
                  disabled={loading}
                >
                  <MenuItem value="">Pilih Admin...</MenuItem>
                  {admins.map((admin) => (
                    <MenuItem key={admin._id} value={admin._id}>
                      {admin.nama}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="estimasiLansir"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Estimasi Waktu Lansir"
                fullWidth
                error={!!errors.estimasiLansir}
                helperText={errors.estimasiLansir?.message}
                disabled={loading}
                placeholder="Contoh: 2 jam, 30 menit"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimerIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="kilometerBerangkat"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Kilometer Awal"
                type="number"
                fullWidth
                error={!!errors.kilometerBerangkat}
                helperText={errors.kilometerBerangkat?.message}
                disabled={loading}
                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SpeedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">km</InputAdornment>,
                }}
              />
            )}
          />
        </Grid>

        {/* Display vehicle information if selected */}
        {watch('antrianKendaraanId') && (
          <Grid item xs={12}>
            <Box my={2}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Informasi Kendaraan Terpilih
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {(() => {
                  const vehicleInfo = getVehicleInfo(watch('antrianKendaraanId'));
                  if (!vehicleInfo) return null;
                  
                  return (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Kendaraan
                        </Typography>
                        <Typography variant="body1">
                          {vehicleInfo.vehicle || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Nomor Polisi
                        </Typography>
                        <Typography variant="body1">
                          {vehicleInfo.plate || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Supir
                        </Typography>
                        <Typography variant="body1">
                          {vehicleInfo.driver || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Kenek
                        </Typography>
                        <Typography variant="body1">
                          {vehicleInfo.assistant || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  );
                })()}
              </Paper>
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" mt={2}>
            Pilih STT untuk Pengiriman
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
                Tidak ada STT yang tersedia untuk pengiriman di cabang ini
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
                      <TableCell>Pengirim</TableCell>
                      <TableCell>Penerima</TableCell>
                      <TableCell>Alamat Tujuan</TableCell>
                      <TableCell>Barang</TableCell>
                      <TableCell align="right">Colly</TableCell>
                      <TableCell align="right">Berat</TableCell>
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
                        <TableCell>{stt.pengirim?.nama || '-'}</TableCell>
                        <TableCell>{stt.penerima?.nama || '-'}</TableCell>
                        <TableCell>
                          {stt.penerima
                            ? `${stt.penerima.alamat}, ${stt.penerima.kota}`
                            : '-'}
                        </TableCell>
                        <TableCell>{stt.namaBarang}</TableCell>
                        <TableCell align="right">{stt.jumlahColly}</TableCell>
                        <TableCell align="right">{stt.berat} kg</TableCell>
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
                      Total Colly:{' '}
                      <strong>
                        {availableSTTs
                          .filter((stt) => selectedSttIds.includes(stt._id))
                          .reduce((sum, stt) => sum + stt.jumlahColly, 0)}
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
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LocalShippingIcon />}
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            {initialData ? 'Perbarui Pengiriman' : 'Buat Pengiriman'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeliveryForm;