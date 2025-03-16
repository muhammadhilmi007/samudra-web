// src/components/division/DivisionForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TextField, Button, Grid, Box, CircularProgress } from '@mui/material';
import { Division } from '../../types/division';

// Validation schema
const divisionSchema = z.object({
  namaDivisi: z.string().min(1, 'Nama divisi harus diisi'),
});

type DivisionFormInputs = z.infer<typeof divisionSchema>;

interface DivisionFormProps {
  initialData?: Division;
  onSubmit: (data: DivisionFormInputs) => void;
  loading?: boolean;
}

const DivisionForm: React.FC<DivisionFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DivisionFormInputs>({
    resolver: zodResolver(divisionSchema),
    defaultValues: {
      namaDivisi: initialData?.namaDivisi || '',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="namaDivisi"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nama Divisi"
                variant="outlined"
                fullWidth
                error={!!errors.namaDivisi}
                helperText={errors.namaDivisi?.message}
                disabled={loading}
                autoFocus
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
          >
            {initialData ? 'Perbarui' : 'Simpan'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DivisionForm;