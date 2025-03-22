// src/pages/collection/create.tsx
import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Divider,
  Autocomplete,
  Chip,
  Alert,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  PersonOutline as PersonIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { createCollection } from "../../store/slices/collectionSlice";
import {
  getCustomers,
  getSenders,
  getRecipients,
} from "../../store/slices/customerSlice";
import { getSTTs, getSTTsByStatus } from "../../store/slices/sttSlice";
import { getBranches } from "../../store/slices/branchSlice";
import { clearError, clearSuccess } from "../../store/slices/uiSlice";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import withAuth from "../../components/auth/withAuth";

// Schema for collection form validation
const collectionSchema = z.object({
  pelangganId: z.string().min(1, "Pelanggan wajib dipilih"),
  tipePelanggan: z.enum(["Pengirim", "Penerima"], {
    errorMap: () => ({ message: "Tipe Pelanggan wajib dipilih" }),
  }),
  sttIds: z.array(z.string()).min(1, "Minimal satu STT wajib dipilih"),
  cabangId: z.string().min(1, "Cabang wajib dipilih"),
});

type CollectionFormInputs = z.infer<typeof collectionSchema>;

const CreateCollectionPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { sttList } = useSelector((state: RootState) => state.stt);
  const { user } = useSelector((state: RootState) => state.auth);
  const { senders, recipients } = useSelector(
    (state: RootState) => state.customer
  );
  const { branches } = useSelector((state: RootState) => state.branch);
  const { loading, error, success } = useSelector(
    (state: RootState) => state.ui
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormInputs>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      pelangganId: "",
      tipePelanggan: "Pengirim",
      sttIds: [],
      cabangId: user?.cabangId || "",
    },
  });

  const tipePelanggan = watch("tipePelanggan");
  const cabangId = watch("cabangId");
  const pelangganId = watch("pelangganId");

  useEffect(() => {
    dispatch(getBranches());
    dispatch(getSenders());
    dispatch(getRecipients());
    dispatch(getSTTsByStatus("TERKIRIM"));
  }, [dispatch]);

  useEffect(() => {
    // Reset pelangganId when customer type changes
    setValue("pelangganId", "");
  }, [tipePelanggan, setValue]);

  const handleCloseAlert = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  const onSubmit = (data: CollectionFormInputs) => {
    dispatch(createCollection(data))
      .unwrap()
      .then((res) => {
        router.push(`/collection/${res._id}`);
      })
      .catch((err) => {
        console.error("Failed to create collection:", err);
      });
  };

  // Filter STTs based on selected customer and type
  const filteredSTTs = sttList.filter((stt) => {
    if (!pelangganId) return false;

    if (tipePelanggan === "Pengirim") {
      return stt.pengirimId === pelangganId && stt.status === "TERKIRIM";
    } else {
      return stt.penerimaId === pelangganId && stt.status === "TERKIRIM";
    }
  });

  // Get appropriate customer list based on type
  const customerOptions = (tipePelanggan === 'Pengirim' ? senders : recipients) || [];

  // Get customer display name
  const getCustomerName = (id: string) => {
    if (!Array.isArray(customerOptions)) return '';
    const customer = customerOptions.find((c) => c._id === id);
    return customer ? customer.nama : '';
  };
  

  // Calculate total for selected STTs
  const calculateTotal = (selectedSTTIds: string[]) => {
    return filteredSTTs
      .filter((stt) => selectedSTTIds.includes(stt._id))
      .reduce((sum, stt) => sum + stt.harga, 0);
  };

  // Get STT list with selected ones
  const selectedSTTIds = watch("sttIds") || [];
  const totalAmount = calculateTotal(selectedSTTIds);

  return (
    <>
      <Head>
        <title>Buat Penagihan Baru | Samudra ERP</title>
      </Head>

      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" passHref>
            <MuiLink underline="hover" color="inherit">
              Dashboard
            </MuiLink>
          </Link>
          <Link href="/collection" passHref>
            <MuiLink underline="hover" color="inherit">
              Penagihan
            </MuiLink>
          </Link>
          <Typography color="text.primary">Buat Penagihan</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/collection")}
            sx={{ mr: 2 }}
          >
            Kembali
          </Button>
          <Typography variant="h4">Buat Penagihan Baru</Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Detail Pelanggan
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="tipePelanggan"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.tipePelanggan}>
                          <InputLabel id="tipe-pelanggan-label">
                            Tipe Pelanggan
                          </InputLabel>
                          <Select
                            {...field}
                            labelId="tipe-pelanggan-label"
                            label="Tipe Pelanggan"
                          >
                            <MenuItem value="Pengirim">Pengirim</MenuItem>
                            <MenuItem value="Penerima">Penerima</MenuItem>
                          </Select>
                          {errors.tipePelanggan && (
                            <FormHelperText>
                              {errors.tipePelanggan.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="pelangganId"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <Autocomplete
                          {...field}
                          options={Array.isArray(customerOptions) ? customerOptions : []}
                          getOptionLabel={(option) => typeof option === 'string' ? getCustomerName(option) : option.nama}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={`Pilih ${tipePelanggan}`}
                              error={!!errors.pelangganId}
                              helperText={errors.pelangganId?.message}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    <PersonIcon color="action" sx={{ mr: 1 }} />
                                    {params.InputProps.startAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          value={Array.isArray(customerOptions) ? customerOptions.find((c) => c._id === value) || null : null}
                          onChange={(_, newValue) => {
                            onChange(newValue ? newValue._id : '');
                            // Reset selected STTs when customer changes
                            setValue('sttIds', []);
                          }}
                          isOptionEqualToValue={(option, value) => option?._id === value?._id}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
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
                          >
                            {branches.map((branch) => (
                              <MenuItem key={branch._id} value={branch._id}>
                                {branch.namaCabang}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.cabangId && (
                            <FormHelperText>
                              {errors.cabangId.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Pilih STT untuk Ditagih
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {!pelangganId ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Silahkan pilih pelanggan terlebih dahulu untuk melihat STT
                    yang tersedia.
                  </Alert>
                ) : filteredSTTs.length === 0 ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Tidak ada STT yang tersedia untuk ditagih untuk pelanggan
                    ini.
                  </Alert>
                ) : (
                  <>
                    <Controller
                      name="sttIds"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <FormControl fullWidth error={!!errors.sttIds}>
                          <InputLabel id="stt-label">Pilih STT</InputLabel>
                          <Select
                            {...field}
                            labelId="stt-label"
                            label="Pilih STT"
                            multiple
                            value={value}
                            onChange={onChange}
                            renderValue={(selected) => (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                }}
                              >
                                {selected.map((value) => {
                                  const stt = filteredSTTs.find(
                                    (s) => s._id === value
                                  );
                                  return (
                                    <Chip
                                      key={value}
                                      label={stt ? stt.noSTT : value}
                                      icon={<ReceiptIcon />}
                                    />
                                  );
                                })}
                              </Box>
                            )}
                          >
                            {filteredSTTs.map((stt) => (
                              <MenuItem key={stt._id} value={stt._id}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={value.includes(stt._id)}
                                    />
                                  }
                                  label={
                                    <Box>
                                      <Typography variant="body1">
                                        {stt.noSTT}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Rp {stt.harga.toLocaleString("id-ID")}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.sttIds && (
                            <FormHelperText>
                              {errors.sttIds.message}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1">STT Terpilih:</Typography>
                      {selectedSTTIds.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Belum ada STT yang dipilih
                        </Typography>
                      ) : (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          {selectedSTTIds.map((id) => {
                            const stt = filteredSTTs.find((s) => s._id === id);
                            return stt ? (
                              <Grid item xs={12} sm={6} md={4} key={id}>
                                <Card variant="outlined">
                                  <CardContent>
                                    <Typography variant="subtitle2">
                                      {stt.noSTT}
                                    </Typography>
                                    <Typography variant="body2">
                                      Rp {stt.harga.toLocaleString("id-ID")}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ) : null;
                          })}
                        </Grid>
                      )}
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, position: "sticky", top: "80px" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ringkasan Penagihan
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pelanggan
                  </Typography>
                  <Typography variant="body1">
                    {pelangganId ? getCustomerName(pelangganId) : "-"}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipe Pelanggan
                  </Typography>
                  <Chip
                    label={tipePelanggan}
                    size="small"
                    color={
                      tipePelanggan === "Pengirim" ? "primary" : "secondary"
                    }
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Jumlah STT
                  </Typography>
                  <Typography variant="body1">
                    {selectedSTTIds.length}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Tagihan
                  </Typography>
                  <Typography
                    variant="h5"
                    color="primary.main"
                    fontWeight="bold"
                  >
                    Rp {totalAmount.toLocaleString("id-ID")}
                  </Typography>
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<SaveIcon />}
                    disabled={loading || selectedSTTIds.length === 0}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Buat Penagihan"
                    )}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default withAuth(CreateCollectionPage);