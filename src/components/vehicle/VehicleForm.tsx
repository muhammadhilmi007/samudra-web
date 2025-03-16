// src/components/vehicle/VehicleForm.tsx
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
  Tab,
  Tabs,
  Avatar,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getEmployeesByBranch } from '../../store/slices/employeeSlice';
import { Vehicle } from '../../types/vehicle';

// File size validation (max 2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Validation schema
const vehicleSchema = z.object({
  noPolisi: z.string().min(1, 'Nomor polisi harus diisi'),
  namaKendaraan: z.string().min(1, 'Nama kendaraan harus diisi'),
  cabangId: z.string().min(1, 'Cabang harus dipilih'),
  tipe: z.string().min(1, 'Tipe kendaraan harus dipilih'),
  grup: z.string().optional(),
  
  // Supir fields
  supirId: z.string().optional(),
  noTeleponSupir: z.string().optional(),
  noKTPSupir: z.string().optional(),
  alamatSupir: z.string().optional(),
  
  // Kenek fields
  kenekId: z.string().optional(),
  noTeleponKenek: z.string().optional(),
  noKTPKenek: z.string().optional(),
  alamatKenek: z.string().optional(),
});

type VehicleFormInputs = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  initialData?: Vehicle;
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<string>(initialData?.cabangId || '');
  
  // File state
  const [fotoSupir, setFotoSupir] = useState<File | null>(null);
  const [fotoKTPSupir, setFotoKTPSupir] = useState<File | null>(null);
  const [fotoKenek, setFotoKenek] = useState<File | null>(null);
  const [fotoKTPKenek, setFotoKTPKenek] = useState<File | null>(null);
  
  // Preview URLs
  const [fotoSupirPreview, setFotoSupirPreview] = useState<string | null>(initialData?.fotoSupir || null);
  const [fotoKTPSupirPreview, setFotoKTPSupirPreview] = useState<string | null>(initialData?.fotoKTPSupir || null);
  const [fotoKenekPreview, setFotoKenekPreview] = useState<string | null>(initialData?.fotoKenek || null);
  const [fotoKTPKenekPreview, setFotoKTPKenekPreview] = useState<string | null>(initialData?.fotoKTPKenek || null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<VehicleFormInputs>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      noPolisi: initialData?.noPolisi || '',
      namaKendaraan: initialData?.namaKendaraan || '',
      cabangId: initialData?.cabangId || '',
      tipe: initialData?.tipe || '',
      grup: initialData?.grup || '',
      
      supirId: initialData?.supirId || '',
      noTeleponSupir: initialData?.noTeleponSupir || '',
      noKTPSupir: initialData?.noKTPSupir || '',
      alamatSupir: initialData?.alamatSupir || '',
      
      kenekId: initialData?.kenekId || '',
      noTeleponKenek: initialData?.noTeleponKenek || '',
      noKTPKenek: initialData?.noKTPKenek || '',
      alamatKenek: initialData?.alamatKenek || '',
    },
  });

  // Watch selected values
  const selectedCabangId = watch('cabangId');
  const selectedTipe = watch('tipe');
  const selectedSupirId = watch('supirId');
  const selectedKenekId = watch('kenekId');

  // Fetch branches on component mount
  useEffect(() => {
    dispatch(getBranches());
  }, [dispatch]);

  // Fetch employees when branch is selected
  useEffect(() => {
    if (selectedCabangId) {
      dispatch(getEmployeesByBranch(selectedCabangId));
      setSelectedBranch(selectedCabangId);
    }
  }, [dispatch, selectedCabangId]);

  // Set employee details when selected
  useEffect(() => {
    if (selectedSupirId) {
      const supir = employees.find(emp => emp._id === selectedSupirId);
      if (supir) {
        setValue('noTeleponSupir', supir.telepon || '');
        setValue('alamatSupir', supir.alamat || '');
      }
    }
  }, [employees, selectedSupirId, setValue]);

  useEffect(() => {
    if (selectedKenekId) {
      const kenek = employees.find(emp => emp._id === selectedKenekId);
      if (kenek) {
        setValue('noTeleponKenek', kenek.telepon || '');
        setValue('alamatKenek', kenek.alamat || '');
      }
    }
  }, [employees, selectedKenekId, setValue]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle file changes
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Submit handler
  const handleFormSubmit = (data: VehicleFormInputs) => {
    const formData = new FormData();
    
    // Append basic fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    
    // Append files if selected
    if (fotoSupir) formData.append('fotoSupir', fotoSupir);
    if (fotoKTPSupir) formData.append('fotoKTPSupir', fotoKTPSupir);
    if (fotoKenek) formData.append('fotoKenek', fotoKenek);
    if (fotoKTPKenek) formData.append('fotoKTPKenek', fotoKTPKenek);
    
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 3 }}>
        <Tab label="Informasi Kendaraan" />
        <Tab label="Informasi Supir" />
        <Tab label="Informasi Kenek" />
      </Tabs>

      {/* Tab 1: Informasi Kendaraan */}
      {tabValue === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Kendaraan
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="noPolisi"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nomor Polisi"
                  variant="outlined"
                  fullWidth
                  error={!!errors.noPolisi}
                  helperText={errors.noPolisi?.message}
                  disabled={loading}
                  autoFocus
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="namaKendaraan"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nama Kendaraan"
                  variant="outlined"
                  fullWidth
                  error={!!errors.namaKendaraan}
                  helperText={errors.namaKendaraan?.message}
                  disabled={loading}
                />
              )}
            />
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
              name="tipe"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipe}>
                  <InputLabel id="tipe-label">Tipe Kendaraan</InputLabel>
                  <Select
                    {...field}
                    labelId="tipe-label"
                    label="Tipe Kendaraan"
                    disabled={loading}
                  >
                    <MenuItem value="Lansir">Lansir (Pengiriman Lokal)</MenuItem>
                    <MenuItem value="Antar Cabang">Antar Cabang</MenuItem>
                  </Select>
                  {errors.tipe && (
                    <FormHelperText>{errors.tipe.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {selectedTipe === 'Antar Cabang' && (
            <Grid item xs={12} md={6}>
              <Controller
                name="grup"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Grup Armada (Opsional)"
                    variant="outlined"
                    fullWidth
                    error={!!errors.grup}
                    helperText={errors.grup?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
          )}
        </Grid>
      )}

      {/* Tab 2: Informasi Supir */}
      {tabValue === 1 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Supir
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

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
                    disabled={loading || !selectedBranch}
                  >
                    <MenuItem value="">-- Pilih Supir --</MenuItem>
                    {employees
                      .filter(emp => ['supir', 'driver'].includes(emp.jabatan.toLowerCase()))
                      .map((employee) => (
                        <MenuItem key={employee._id} value={employee._id}>
                          {employee.nama}
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
              name="noTeleponSupir"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nomor Telepon Supir"
                  variant="outlined"
                  fullWidth
                  error={!!errors.noTeleponSupir}
                  helperText={errors.noTeleponSupir?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="noKTPSupir"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nomor KTP Supir"
                  variant="outlined"
                  fullWidth
                  error={!!errors.noKTPSupir}
                  helperText={errors.noKTPSupir?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="alamatSupir"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Alamat Supir"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.alamatSupir}
                  helperText={errors.alamatSupir?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Foto KTP Supir
            </Typography>
            <input
              accept="image/*"
              id="foto-ktp-supir"
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, setFotoKTPSupir, setFotoKTPSupirPreview)}
              disabled={loading}
            />
            <label htmlFor="foto-ktp-supir">
              <Button
                variant="outlined"
                component="span"
                disabled={loading}
                sx={{ mb: 1 }}
              >
                Upload Foto KTP
              </Button>
            </label>
            {fotoKTPSupirPreview && (
              <Box mt={1}>
                <img
                  src={fotoKTPSupirPreview}
                  alt="KTP Supir"
                  width="100%"
                  style={{ maxWidth: 300, maxHeight: 200, objectFit: 'contain' }}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Foto Supir
            </Typography>
            <input
              accept="image/*"
              id="foto-supir"
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, setFotoSupir, setFotoSupirPreview)}
              disabled={loading}
            />
            <label htmlFor="foto-supir">
              <Button
                variant="outlined"
                component="span"
                disabled={loading}
                sx={{ mb: 1 }}
              >
                Upload Foto Supir
              </Button>
            </label>
            {fotoSupirPreview && (
              <Box mt={1}>
                <Avatar
                  src={fotoSupirPreview}
                  alt="Supir"
                  sx={{ width: 100, height: 100 }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Informasi Kenek */}
      {tabValue === 2 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Kenek
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="kenekId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.kenekId}>
                  <InputLabel id="kenek-label">Kenek</InputLabel>
                  <Select
                    {...field}
                    labelId="kenek-label"
                    label="Kenek"
                    disabled={loading || !selectedBranch}
                  >
                    <MenuItem value="">-- Pilih Kenek --</MenuItem>
                    {employees
                      .filter(emp => ['kenek', 'asisten driver'].includes(emp.jabatan.toLowerCase()))
                      .map((employee) => (
                        <MenuItem key={employee._id} value={employee._id}>
                          {employee.nama}
                        </MenuItem>
                      ))}
                  </Select>
                  {errors.kenekId && (
                    <FormHelperText>{errors.kenekId.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="noTeleponKenek"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nomor Telepon Kenek"
                  variant="outlined"
                  fullWidth
                  error={!!errors.noTeleponKenek}
                  helperText={errors.noTeleponKenek?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="noKTPKenek"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nomor KTP Kenek"
                  variant="outlined"
                  fullWidth
                  error={!!errors.noKTPKenek}
                  helperText={errors.noKTPKenek?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="alamatKenek"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Alamat Kenek"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.alamatKenek}
                  helperText={errors.alamatKenek?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Foto KTP Kenek
            </Typography>
            <input
              accept="image/*"
              id="foto-ktp-kenek"
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, setFotoKTPKenek, setFotoKTPKenekPreview)}
              disabled={loading}
            />
            <label htmlFor="foto-ktp-kenek">
              <Button
                variant="outlined"
                component="span"
                disabled={loading}
                sx={{ mb: 1 }}
              >
                Upload Foto KTP
              </Button>
            </label>
            {fotoKTPKenekPreview && (
              <Box mt={1}>
                <img
                  src={fotoKTPKenekPreview}
                  alt="KTP Kenek"
                  width="100%"
                  style={{ maxWidth: 300, maxHeight: 200, objectFit: 'contain' }}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Foto Kenek
            </Typography>
            <input
              accept="image/*"
              id="foto-kenek"
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, setFotoKenek, setFotoKenekPreview)}
              disabled={loading}
            />
            <label htmlFor="foto-kenek">
              <Button
                variant="outlined"
                component="span"
                disabled={loading}
                sx={{ mb: 1 }}
              >
                Upload Foto Kenek
              </Button>
            </label>
            {fotoKenekPreview && (
              <Box mt={1}>
                <Avatar
                  src={fotoKenekPreview}
                  alt="Kenek"
                  sx={{ width: 100, height: 100 }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      <Box mt={3} display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          disabled={loading || tabValue === 0}
          onClick={() => setTabValue(tabValue - 1)}
        >
          Sebelumnya
        </Button>
        
        {tabValue < 2 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setTabValue(tabValue + 1)}
          >
            Selanjutnya
          </Button>
        ) : (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {initialData ? 'Perbarui' : 'Simpan'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default VehicleForm;