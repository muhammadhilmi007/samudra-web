// src/components/finance/CashForm.tsx
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
  InputAdornment
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { createCashTransaction, updateCashTransaction } from '../../store/slices/financeSlice';
import { CashTransaction } from '../../types/finance';

// Validation schema
const cashFormSchema = z.object({
  tanggal: z.string().min(1, 'Tanggal harus diisi'),
  tipeKas: z.enum(['Awal', 'Akhir', 'Kecil', 'Rekening', 'Tangan'], {
    errorMap: () => ({ message: 'Tipe kas harus dipilih' })
  }),
  cabangId: z.string().optional(),
  keterangan: z.string().min(1, 'Keterangan harus diisi'),
  debet: z.number().min(0, 'Debet tidak boleh negatif'),
  kredit: z.number().min(0, 'Kredit tidak boleh negatif')
});

type CashFormInputs = z.infer<typeof cashFormSchema>;

interface CashFormProps {
  initialData?: CashTransaction;
  onSubmit: (data: CashFormInputs) => void;
  loading?: boolean;
}

const CashForm: React.FC<CashFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);

  // Fetch branches on component mount
  useEffect(() => {
    dispatch(getBranches());
  }, [dispatch]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CashFormInputs>({
    resolver: zodResolver(cashFormSchema),
    defaultValues: {
      tanggal: initialData ? new Date(initialData.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      tipeKas: initialData?.tipeKas || 'Kecil',
      cabangId: initialData?.cabangId || '',
      keterangan: initialData?.keterangan || '',
      debet: initialData?.debet || 0,
      kredit: initialData?.kredit || 0,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Informasi Transaksi Kas
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="tanggal"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="Tanggal"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.tanggal}
                helperText={errors.tanggal?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="tipeKas"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.tipeKas}>
                <InputLabel id="tipe-kas-label">Tipe Kas</InputLabel>
                <Select
                  {...field}
                  labelId="tipe-kas-label"
                  label="Tipe Kas"
                  disabled={loading}
                >
                  <MenuItem value="Awal">Kas Awal</MenuItem>
                  <MenuItem value="Akhir">Kas Akhir</MenuItem>
                  <MenuItem value="Kecil">Kas Kecil</MenuItem>
                  <MenuItem value="Rekening">Kas Rekening</MenuItem>
                  <MenuItem value="Tangan">Kas Tangan</MenuItem>
                </Select>
                {errors.tipeKas && (
                  <Typography variant="caption" color="error">
                    {errors.tipeKas.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="cabangId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel id="cabang-label">Cabang (Opsional)</InputLabel>
                <Select
                  {...field}
                  labelId="cabang-label"
                  label="Cabang (Opsional)"
                  disabled={loading}
                >
                  <MenuItem value="">Pilih Cabang</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id}>
                      {branch.namaCabang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="keterangan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Keterangan"
                variant="outlined"
                fullWidth
                error={!!errors.keterangan}
                helperText={errors.keterangan?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="debet"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Debet"
                variant="outlined"
                fullWidth
                error={!!errors.debet}
                helperText={errors.debet?.message}
                disabled={loading}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  field.onChange(isNaN(value) ? 0 : value);
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  inputProps: { min: 0, step: 1000 }
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="kredit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Kredit"
                variant="outlined"
                fullWidth
                error={!!errors.kredit}
                helperText={errors.kredit?.message}
                disabled={loading}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  field.onChange(isNaN(value) ? 0 : value);
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  inputProps: { min: 0, step: 1000 }
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            fullWidth
            sx={{ mt: 2 }}
          >
            {initialData ? 'Perbarui Transaksi Kas' : 'Tambah Transaksi Kas'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CashForm;