// src/components/delivery/VehicleQueueForm.tsx
import React, { useEffect } from 'react';
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
  InputAdornment,
} from '@mui/material';
import {
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getVehiclesByType } from '../../store/slices/vehicleSlice';
import { getEmployeesByRole } from '../../store/slices/employeeSlice';
import { VehicleQueue, VehicleQueueFormInputs } from '../../types/delivery';

// Validation schema for vehicle queue form
const vehicleQueueSchema = z.object({
  kendaraanId: z.string().min(1, 'Kendaraan wajib dipilih'),
  supirId: z.string().min(1, 'Supir wajib dipilih'),
  kenekId: z.string().optional(),
  cabangId: z.string().min(1, 'Cabang wajib dipilih'),
});

interface VehicleQueueFormProps {
  initialData?: VehicleQueue;
  onSubmit: (data: VehicleQueueFormInputs) => void;
  loading?: boolean;
}

const VehicleQueueForm: React.FC<VehicleQueueFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<VehicleQueueFormInputs>({
    resolver: zodResolver(vehicleQueueSchema),
    defaultValues: {
      kendaraanId: initialData?.kendaraanId || '',
      supirId: initialData?.supirId || '',
      kenekId: initialData?.kenekId || '',
      cabangId: initialData?.cabangId || user?.cabangId || '',
    },
  });

  // Selected branch
  const selectedCabangId = watch('cabangId');
  const selectedVehicleId = watch('kendaraanId');

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getVehiclesByType('Lansir'));
    dispatch(getEmployeesByRole('supir'));
    dispatch(getEmployeesByRole('kenek'));
  }, [dispatch]);

  // Auto-set driver and assistant if vehicle is selected
  useEffect(() => {
    if (selectedVehicleId) {
      const selectedVehicle = vehicles.find(v => v._id === selectedVehicleId);
      if (selectedVehicle) {
        // Auto set driver if the vehicle has a default driver
        if (selectedVehicle.supirId && !initialData?.supirId) {
          setValue('supirId', selectedVehicle.supirId);
        }
        
        // Auto set assistant if the vehicle has a default assistant
        if (selectedVehicle.kenekId && !initialData?.kenekId) {
          setValue('kenekId', selectedVehicle.kenekId);
        }
      }
    }
  }, [selectedVehicleId, vehicles, setValue, initialData]);

  // Filter vehicles by branch
  const filteredVehicles = vehicles.filter(
    vehicle => !selectedCabangId || vehicle.cabangId === selectedCabangId
  );

  // Filter drivers and assistants
  const drivers = employees.filter(
    emp => emp.jabatan === 'Supir' || emp.role === 'supir'
  );

  const assistants = employees.filter(
    emp => emp.jabatan === 'Kenek' || emp.role === 'kenek'
  );

  // Get vehicle details
  const getVehicleDetails = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    return vehicle || null;
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            Informasi Antrian Kendaraan
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
            name="kendaraanId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.kendaraanId}>
                <InputLabel id="kendaraan-label">Kendaraan</InputLabel>
                <Select
                  {...field}
                  labelId="kendaraan-label"
                  label="Kendaraan"
                  disabled={loading}
                >
                  {filteredVehicles.map((vehicle) => (
                    <MenuItem key={vehicle._id} value={vehicle._id}>
                      {vehicle.noPolisi} - {vehicle.namaKendaraan}
                    </MenuItem>
                  ))}
                </Select>
                {errors.kendaraanId && (
                  <FormHelperText>{errors.kendaraanId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        {/* Display vehicle details if selected */}
        {selectedVehicleId && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              {(() => {
                const vehicleDetails = getVehicleDetails(selectedVehicleId);
                if (!vehicleDetails) return null;
                
                return (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Detail Kendaraan
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Nama Kendaraan
                        </Typography>
                        <Typography variant="body1">
                          {vehicleDetails.namaKendaraan}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Nomor Polisi
                        </Typography>
                        <Typography variant="body1">
                          {vehicleDetails.noPolisi}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Tipe
                        </Typography>
                        <Typography variant="body1">
                          {vehicleDetails.tipe}
                        </Typography>
                      </Grid>
                      {vehicleDetails.grup && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Grup
                          </Typography>
                          <Typography variant="body1">
                            {vehicleDetails.grup}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </>
                );
              })()}
            </Paper>
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Controller
            name="supirId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.supirId}>
                <InputLabel id="supir-label">Supir</InputLabel>
                <Select
                  {...field}
                  labelId="supir-label"
                  label="Supir"
                  disabled={loading}
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver._id} value={driver._id}>
                      {driver.nama}
                    </MenuItem>
                  ))}
                </Select>
                {errors.supirId && (
                  <FormHelperText>{errors.supirId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="kenekId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="kenek-label">Kenek (Opsional)</InputLabel>
                <Select
                  {...field}
                  labelId="kenek-label"
                  label="Kenek (Opsional)"
                  disabled={loading}
                >
                  <MenuItem value="">Pilih Kenek...</MenuItem>
                  {assistants.map((assistant) => (
                    <MenuItem key={assistant._id} value={assistant._id}>
                      {assistant.nama}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
            Catatan: Kendaraan akan masuk dalam antrian dan siap digunakan untuk pengiriman lokal (lansir).
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DirectionsCarIcon />}
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            {initialData ? 'Perbarui Antrian' : 'Tambah ke Antrian'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleQueueForm;