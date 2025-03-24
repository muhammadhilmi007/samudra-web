import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Alert,
  FormHelperText,
  Paper,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { getDivisions } from "../../store/slices/divisionSlice";
import { createBranch, updateBranch } from "../../store/slices/branchSlice";
import { Branch, BranchFormInputs } from "../../types/branch";
import { useNavigate } from "react-router-dom";

// Validation schema
const branchSchema = z.object({
  namaCabang: z.string().min(1, "Nama cabang harus diisi"),
  divisiId: z.string().min(1, "Divisi harus dipilih"),
  alamat: z.string().min(1, "Alamat harus diisi"),
  kelurahan: z.string().min(1, "Kelurahan harus diisi"),
  kecamatan: z.string().min(1, "Kecamatan harus diisi"),
  kota: z.string().min(1, "Kota harus diisi"),
  provinsi: z.string().min(1, "Provinsi harus diisi"),
  kontakPenanggungJawab: z.object({
    nama: z.string().default(""),
    telepon: z.string().default(""),
    email: z.string().email("Format email tidak valid").optional().default("")
  })
});

type FormInputs = z.infer<typeof branchSchema>;

interface BranchFormProps {
  initialData?: Branch;
  onSubmit?: (data: BranchFormInputs) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { divisions, loading: divisionsLoading } = useSelector((state: RootState) => state.division);
  const { error, loading: branchLoading } = useSelector((state: RootState) => state.branch);
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    setError,
    watch,
  } = useForm<FormInputs>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      namaCabang: initialData?.namaCabang || "",
      divisiId: typeof initialData?.divisiId === 'string' ? initialData.divisiId : initialData?.divisiId?._id || "",
      alamat: initialData?.alamat || "",
      kelurahan: initialData?.kelurahan || "",
      kecamatan: initialData?.kecamatan || "",
      kota: initialData?.kota || "",
      provinsi: initialData?.provinsi || "",
      kontakPenanggungJawab: {
        nama: initialData?.kontakPenanggungJawab?.nama || "",
        telepon: initialData?.kontakPenanggungJawab?.telepon || "",
        email: initialData?.kontakPenanggungJawab?.email || "",
      }
    },
  });

  // Watch form values for debugging
  const formValues = watch();
  
  useEffect(() => {
    console.log("Current form values:", formValues);
  }, [formValues]);

  useEffect(() => {
    dispatch(getDivisions());
  }, [dispatch]);

  // Reset form jika initialData berubah
  useEffect(() => {
    if (initialData) {
      reset({
        namaCabang: initialData.namaCabang || "",
        divisiId: initialData.divisiId?._id || "",
        alamat: initialData.alamat || "",
        kelurahan: initialData.kelurahan || "",
        kecamatan: initialData.kecamatan || "",
        kota: initialData.kota || "",
        provinsi: initialData.provinsi || "",
        kontakPenanggungJawab: {
          nama: initialData.kontakPenanggungJawab?.nama || "",
          telepon: initialData.kontakPenanggungJawab?.telepon || "",
          email: initialData.kontakPenanggungJawab?.email || ""
        }
      });
    }
  }, [initialData, reset]);

  const handleBranchSubmit = async (data: FormInputs) => {
    setSubmitError(null);
    
    // Log data untuk debugging
    console.log("Submitting branch form data:", data);

    try {
      // If custom onSubmit is provided, use it
      // Ensure all required fields are present with valid values
      // Prepare base data
      const formattedData: BranchFormInputs = {
        namaCabang: data.namaCabang,
        divisiId: data.divisiId,
        alamat: data.alamat,
        kelurahan: data.kelurahan,
        kecamatan: data.kecamatan,
        kota: data.kota,
        provinsi: data.provinsi,
        kontakPenanggungJawab: {
          nama: "",
          telepon: "",
          email: ""
        }
      };

      // Only include non-empty kontakPenanggungJawab fields
      const { nama, telepon, email } = data.kontakPenanggungJawab;
      if (nama || telepon || email) {
        formattedData.kontakPenanggungJawab = {
          nama: nama || "",
          telepon: telepon || "",
          email: email || ""
        };
      }

      if (onSubmit) {
        onSubmit(formattedData);
        return;
      }

      // Use Redux actions with formatted data
      if (initialData?._id) {
        await dispatch(updateBranch({ id: initialData._id, branchData: formattedData })).unwrap();
        navigate("/branch");
      } else {
        await dispatch(createBranch(formattedData)).unwrap();
        navigate("/branch");
      }
    } catch (err: any) {
      console.error("Failed to save branch:", err);
      
      // Handle different error formats
      if (typeof err === 'string') {
        setSubmitError(err);
      } else if (err.message) {
        setSubmitError(err.message);
      } else if (err.errors) {
        // Handle field-specific errors
        Object.entries(err.errors).forEach(([field, message]) => {
          setError(field as any, { 
            type: 'manual', 
            message: message as string 
          });
        });
        setSubmitError("Ada kesalahan pada form, silakan periksa kembali.");
      } else {
        setSubmitError("Terjadi kesalahan saat menyimpan data cabang");
      }
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        component="form"
        onSubmit={handleFormSubmit(handleBranchSubmit)}
        noValidate
      >
        {(error || submitError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError || error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Cabang
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="namaCabang"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nama Cabang"
                  variant="outlined"
                  fullWidth
                  error={!!errors.namaCabang}
                  helperText={errors.namaCabang?.message}
                  disabled={loading || isSubmitting || branchLoading}
                  autoFocus
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="divisiId"
              control={control}
              render={({ field }) => (
                <FormControl 
                  fullWidth 
                  error={!!errors.divisiId}
                  disabled={loading || isSubmitting || branchLoading || divisionsLoading}
                  required
                >
                  <InputLabel id="divisi-label">Divisi</InputLabel>
                  <Select
                    {...field}
                    labelId="divisi-label"
                    label="Divisi"
                    value={field.value || ""} // Ensure value is never undefined
                  >
                    <MenuItem value="" disabled>
                      {divisionsLoading ? 'Loading...' : 'Pilih Divisi'}
                    </MenuItem>
                    {divisions.map((division) => (
                      <MenuItem key={division._id} value={division._id}>
                        {division.namaDivisi}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.divisiId && (
                    <FormHelperText>{errors.divisiId.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="alamat"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Alamat"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.alamat}
                  helperText={errors.alamat?.message}
                  disabled={loading || isSubmitting || branchLoading}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="kelurahan"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Kelurahan"
                  variant="outlined"
                  fullWidth
                  error={!!errors.kelurahan}
                  helperText={errors.kelurahan?.message}
                  disabled={loading || isSubmitting || branchLoading}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="kecamatan"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Kecamatan"
                  variant="outlined"
                  fullWidth
                  error={!!errors.kecamatan}
                  helperText={errors.kecamatan?.message}
                  disabled={loading || isSubmitting || branchLoading}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="kota"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Kota"
                  variant="outlined"
                  fullWidth
                  error={!!errors.kota}
                  helperText={errors.kota?.message}
                  disabled={loading || isSubmitting || branchLoading}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="provinsi"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Provinsi"
                  variant="outlined"
                  fullWidth
                  error={!!errors.provinsi}
                  helperText={errors.provinsi?.message}
                  disabled={loading || isSubmitting || branchLoading}
                  required
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Informasi Penanggung Jawab
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Controller
            name="kontakPenanggungJawab"
            control={control}
            render={({ field }) => (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    value={field.value.nama || ""}
                    onChange={(e) => field.onChange({ ...field.value, nama: e.target.value })}
                    label="Nama Penanggung Jawab"
                    variant="outlined"
                    fullWidth
                    error={!!errors.kontakPenanggungJawab?.nama}
                    helperText={errors.kontakPenanggungJawab?.nama?.message}
                    disabled={loading || isSubmitting || branchLoading}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    value={field.value.telepon || ""}
                    onChange={(e) => field.onChange({ ...field.value, telepon: e.target.value })}
                    label="Telepon Penanggung Jawab"
                    variant="outlined"
                    fullWidth
                    error={!!errors.kontakPenanggungJawab?.telepon}
                    helperText={errors.kontakPenanggungJawab?.telepon?.message}
                    disabled={loading || isSubmitting || branchLoading}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    value={field.value.email || ""}
                    onChange={(e) => field.onChange({ ...field.value, email: e.target.value })}
                    label="Email Penanggung Jawab"
                    variant="outlined"
                    fullWidth
                    error={!!errors.kontakPenanggungJawab?.email}
                    helperText={errors.kontakPenanggungJawab?.email?.message}
                    disabled={loading || isSubmitting || branchLoading}
                  />
                </Grid>
              </>
            )}
          />

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              {onCancel && (
                <Button
                  onClick={onCancel}
                  disabled={loading || isSubmitting || branchLoading}
                >
                  Batal
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || isSubmitting || branchLoading || (!isDirty && !!initialData)}
                startIcon={
                  (loading || isSubmitting || branchLoading) ? <CircularProgress size={20} color="inherit" /> : null
                }
              >
                {(loading || isSubmitting || branchLoading) 
                  ? 'Menyimpan...' 
                  : initialData 
                    ? 'Perbarui' 
                    : 'Simpan'
                }
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default BranchForm;