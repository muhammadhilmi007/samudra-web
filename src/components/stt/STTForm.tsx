// src/components/stt/STTForm.tsx
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
  InputAdornment,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getSenders, getRecipients } from '../../store/slices/customerSlice';
import { STT, ForwarderOption } from '../../types/stt';

// Validation schema
const sttSchema = z.object({
  cabangAsalId: z.string().min(1, 'Cabang asal harus dipilih'),
  cabangTujuanId: z.string().min(1, 'Cabang tujuan harus dipilih'),
  pengirimId: z.string().min(1, 'Pengirim harus dipilih'),
  penerimaId: z.string().min(1, 'Penerima harus dipilih'),
  namaBarang: z.string().min(1, 'Nama barang harus diisi'),
  komoditi: z.string().min(1, 'Komoditi harus diisi'),
  packing: z.string().min(1, 'Packing harus diisi'),
  jumlahColly: z.number().min(1, 'Jumlah colly minimal 1'),
  berat: z.number().min(0.1, 'Berat minimal 0.1 kg'),
  hargaPerKilo: z.number().min(0, 'Harga per kilo tidak boleh negatif'),
  harga: z.number().min(0, 'Harga tidak boleh negatif'),
  keterangan: z.string().optional(),
  kodePenerus: z.string().min(1, 'Kode penerus harus dipilih'),
  penerusId: z.string().optional(),
  paymentType: z.string().min(1, 'Metode pembayaran harus dipilih'),
});

type STTFormInputs = z.infer<typeof sttSchema>;

interface STTFormProps {
  initialData?: STT;
  onSubmit: (data: STTFormInputs) => void;
  loading?: boolean;
  forwarders?: ForwarderOption[];
}

const STTForm: React.FC<STTFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  forwarders = [],
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { senders, recipients } = useSelector((state: RootState) => state.customer);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<STTFormInputs>({
    resolver: zodResolver(sttSchema),
    defaultValues: {
      cabangAsalId: initialData?.cabangAsalId || '',
      cabangTujuanId: initialData?.cabangTujuanId || '',
      pengirimId: initialData?.pengirimId || '',
      penerimaId: initialData?.penerimaId || '',
      namaBarang: initialData?.namaBarang || '',
      komoditi: initialData?.komoditi || '',
      packing: initialData?.packing || 'Box',
      jumlahColly: initialData?.jumlahColly || 1,
      berat: initialData?.berat || 1,
      hargaPerKilo: initialData?.hargaPerKilo || 0,
      harga: initialData?.harga || 0,
      keterangan: initialData?.keterangan || '',
      kodePenerus: initialData?.kodePenerus || '70',
      penerusId: initialData?.penerusId || '',
      paymentType: initialData?.paymentType || 'CASH',
    },
  });

  // Watch for values that affect calculations
  const berat = watch('berat');
  const hargaPerKilo = watch('hargaPerKilo');
  const kodePenerus = watch('kodePenerus');

  // Load data
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getSenders());
    dispatch(getRecipients());
  }, [dispatch]);

  // Calculate price when weight or price per kg changes
  useEffect(() => {
    const calculatedPrice = berat * hargaPerKilo;
    setValue('harga', calculatedPrice);
  }, [berat, hargaPerKilo, setValue]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Cabang
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="cabangAsalId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.cabangAsalId}>
                      <InputLabel id="cabang-asal-label">Cabang Asal</InputLabel>
                      <Select
                        {...field}
                        labelId="cabang-asal-label"
                        label="Cabang Asal"
                        disabled={loading}
                      >
                        {branches.map((branch) => (
                          <MenuItem key={branch._id} value={branch._id}>
                            {branch.namaCabang}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.cabangAsalId && (
                        <FormHelperText>{errors.cabangAsalId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="cabangTujuanId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.cabangTujuanId}>
                      <InputLabel id="cabang-tujuan-label">Cabang Tujuan</InputLabel>
                      <Select
                        {...field}
                        labelId="cabang-tujuan-label"
                        label="Cabang Tujuan"
                        disabled={loading}
                      >
                        {branches.map((branch) => (
                          <MenuItem key={branch._id} value={branch._id}>
                            {branch.namaCabang}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.cabangTujuanId && (
                        <FormHelperText>{errors.cabangTujuanId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Pengirim & Penerima
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="pengirimId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.pengirimId}>
                      <InputLabel id="pengirim-label">Pengirim</InputLabel>
                      <Select
                        {...field}
                        labelId="pengirim-label"
                        label="Pengirim"
                        disabled={loading}
                      >
                        {senders.map((sender) => (
                          <MenuItem key={sender._id} value={sender._id}>
                            {sender.nama}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.pengirimId && (
                        <FormHelperText>{errors.pengirimId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="penerimaId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.penerimaId}>
                      <InputLabel id="penerima-label">Penerima</InputLabel>
                      <Select
                        {...field}
                        labelId="penerima-label"
                        label="Penerima"
                        disabled={loading}
                      >
                        {recipients.map((recipient) => (
                          <MenuItem key={recipient._id} value={recipient._id}>
                            {recipient.nama}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.penerimaId && (
                        <FormHelperText>{errors.penerimaId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Barang
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="namaBarang"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nama Barang"
                      variant="outlined"
                      fullWidth
                      error={!!errors.namaBarang}
                      helperText={errors.namaBarang?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="komoditi"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.komoditi}>
                      <InputLabel id="komoditi-label">Komoditi</InputLabel>
                      <Select
                        {...field}
                        labelId="komoditi-label"
                        label="Komoditi"
                        disabled={loading}
                      >
                        <MenuItem value="Elektronik">Elektronik</MenuItem>
                        <MenuItem value="Pakaian">Pakaian</MenuItem>
                        <MenuItem value="Makanan">Makanan</MenuItem>
                        <MenuItem value="Dokumen">Dokumen</MenuItem>
                        <MenuItem value="Sparepart">Sparepart</MenuItem>
                        <MenuItem value="Lainnya">Lainnya</MenuItem>
                      </Select>
                      {errors.komoditi && (
                        <FormHelperText>{errors.komoditi.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="packing"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.packing}>
                      <InputLabel id="packing-label">Packing</InputLabel>
                      <Select
                        {...field}
                        labelId="packing-label"
                        label="Packing"
                        disabled={loading}
                      >
                        <MenuItem value="Box">Box</MenuItem>
                        <MenuItem value="Dus">Dus</MenuItem>
                        <MenuItem value="Palet">Palet</MenuItem>
                        <MenuItem value="Plastik">Plastik</MenuItem>
                        <MenuItem value="Karung">Karung</MenuItem>
                        <MenuItem value="Tanpa Packing">Tanpa Packing</MenuItem>
                      </Select>
                      {errors.packing && (
                        <FormHelperText>{errors.packing.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="jumlahColly"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Jumlah Colly"
                      variant="outlined"
                      fullWidth
                      error={!!errors.jumlahColly}
                      helperText={errors.jumlahColly?.message}
                      disabled={loading}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          field.onChange(value);
                        }
                      }}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="berat"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Berat (kg)"
                      variant="outlined"
                      fullWidth
                      error={!!errors.berat}
                      helperText={errors.berat?.message}
                      disabled={loading}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          field.onChange(value);
                        }
                      }}
                      InputProps={{
                        inputProps: { min: 0.1, step: 0.1 },
                        endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="hargaPerKilo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Harga per Kilo"
                      variant="outlined"
                      fullWidth
                      error={!!errors.hargaPerKilo}
                      helperText={errors.hargaPerKilo?.message}
                      disabled={loading}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          field.onChange(value);
                        }
                      }}
                      InputProps={{
                        inputProps: { min: 0, step: 100 },
                        startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="harga"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Harga Total"
                      variant="outlined"
                      fullWidth
                      error={!!errors.harga}
                      helperText={errors.harga?.message}
                      disabled={true} // Calculated automatically
                      InputProps={{
                        readOnly: true,
                        startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="keterangan"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Keterangan"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={2}
                      error={!!errors.keterangan}
                      helperText={errors.keterangan?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
          
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Pengiriman
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Kode Penerus
                </Typography>
                <Controller
                  name="kodePenerus"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.kodePenerus}>
                      <RadioGroup
                        {...field}
                        row
                      >
                        <FormControlLabel 
                          value="70" 
                          control={<Radio />} 
                          label="70 - NO FORWARDING" 
                          disabled={loading}
                        />
                        <FormControlLabel 
                          value="71" 
                          control={<Radio />} 
                          label="71 - FORWARDING PAID BY SENDER" 
                          disabled={loading}
                        />
                        <FormControlLabel 
                          value="72" 
                          control={<Radio />} 
                          label="72 - FORWARDING PAID BY RECIPIENT" 
                          disabled={loading}
                        />
                        <FormControlLabel 
                          value="73" 
                          control={<Radio />} 
                          label="73 - FORWARDING ADVANCED BY RECIPIENT BRANCH" 
                          disabled={loading}
                        />
                      </RadioGroup>
                      {errors.kodePenerus && (
                        <FormHelperText>{errors.kodePenerus.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              {kodePenerus !== '70' && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="penerusId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.penerusId}>
                        <InputLabel id="penerus-label">Forwarder (Penerus)</InputLabel>
                        <Select
                          {...field}
                          labelId="penerus-label"
                          label="Forwarder (Penerus)"
                          disabled={loading}
                        >
                          {forwarders.map((forwarder) => (
                            <MenuItem key={forwarder._id} value={forwarder._id}>
                              {forwarder.namaPenerus}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.penerusId && (
                          <FormHelperText>{errors.penerusId.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              )}
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Metode Pembayaran
                </Typography>
                <Controller
                  name="paymentType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.paymentType}>
                      <RadioGroup
                        {...field}
                        row
                      >
                        <FormControlLabel 
                          value="CASH" 
                          control={<Radio />} 
                          label="CASH (Bayar Dimuka)" 
                          disabled={loading}
                        />
                        <FormControlLabel 
                          value="COD" 
                          control={<Radio />} 
                          label="COD (Cash On Delivery)" 
                          disabled={loading}
                        />
                        <FormControlLabel 
                          value="CAD" 
                          control={<Radio />} 
                          label="CAD (Cash After Delivery)" 
                          disabled={loading}
                        />
                      </RadioGroup>
                      {errors.paymentType && (
                        <FormHelperText>{errors.paymentType.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            fullWidth
          >
            {initialData ? 'Perbarui STT' : 'Buat STT'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default STTForm;