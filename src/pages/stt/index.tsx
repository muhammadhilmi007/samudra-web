// src/pages/stt/index.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  TablePagination,
  CircularProgress,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getSTTs,
  createSTT,
  updateSTT,
  getSTTsByBranch,
  getSTTsByStatus
} from '../../store/slices/sttSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { getSenders, getRecipients } from '../../store/slices/customerSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { STT, STTFormInputs } from '../../types/stt';
import sttService from '../../services/sttService';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import withAuth from '../../components/auth/withAuth';
import { useRouter } from 'next/router';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Schema for STT form validation
const sttSchema = z.object({
  cabangAsalId: z.string().min(1, 'Cabang asal wajib dipilih'),
  cabangTujuanId: z.string().min(1, 'Cabang tujuan wajib dipilih'),
  pengirimId: z.string().min(1, 'Pengirim wajib dipilih'),
  penerimaId: z.string().min(1, 'Penerima wajib dipilih'),
  namaBarang: z.string().min(1, 'Nama barang wajib diisi'),
  komoditi: z.string().min(1, 'Komoditi wajib diisi'),
  packing: z.string().min(1, 'Packing wajib diisi'),
  jumlahColly: z.number().min(1, 'Jumlah colly minimal 1'),
  berat: z.number().min(0.1, 'Berat minimal 0.1 kg'),
  hargaPerKilo: z.number().min(0, 'Harga per kilo minimal 0'),
  harga: z.number().min(0, 'Harga minimal 0'),
  keterangan: z.string().min(1, 'Keterangan wajib diisi'),
  kodePenerus: z.string().min(1, 'Kode penerus wajib dipilih'),
  penerusId: z.string().optional(),
  paymentType: z.enum(['CASH', 'COD', 'CAD'], {
    errorMap: () => ({ message: 'Metode pembayaran wajib dipilih' }),
  }),
}) satisfies z.ZodType<STTFormInputs>;

const STTListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { sttList } = useSelector((state: RootState) => state.stt);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { senders, recipients } = useSelector((state: RootState) => state.customer);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  const [tabValue, setTabValue] = useState(0);
  const [openSTTDialog, setOpenSTTDialog] = useState(false);
  const [editingSTT, setEditingSTT] = useState<STT | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterBranch, setFilterBranch] = useState<string>(user?.cabangId || '');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch
  } = useForm<STTFormInputs>({
    resolver: zodResolver(sttSchema),
    defaultValues: {
      cabangAsalId: user?.cabangId || '',
      cabangTujuanId: '',
      pengirimId: '',
      penerimaId: '',
      namaBarang: '',
      komoditi: '',
      packing: '',
      jumlahColly: 1,
      berat: 0,
      hargaPerKilo: 0,
      harga: 0,
      keterangan: '',
      kodePenerus: '70', // Default: NO FORWARDING
      penerusId: '',
      paymentType: 'CASH',
    },
  });

  // Watch form fields for calculations
  const berat = watch('berat');
  const hargaPerKilo = watch('hargaPerKilo');
  const kodePenerus = watch('kodePenerus');

  useEffect(() => {
    // Calculate harga based on berat and hargaPerKilo
    if (berat && hargaPerKilo) {
      setValue('harga', Number((berat * hargaPerKilo).toFixed(2)));
    }
  }, [berat, hargaPerKilo, setValue]);

  useEffect(() => {
    // Reset penerusId when kodePenerus changes
    if (kodePenerus === '70') {
      setValue('penerusId', '');
    }
  }, [kodePenerus, setValue]);

  useEffect(() => {
    // Load initial data
    dispatch(getBranches());
    dispatch(getSenders());
    dispatch(getRecipients());
    
    // Load STTs based on filter
    if (filterBranch) {
      dispatch(getSTTsByBranch(filterBranch));
    } else {
      dispatch(getSTTs());
    }
    
    if (filterStatus) {
      dispatch(getSTTsByStatus(filterStatus));
    }
  }, [dispatch, filterBranch, filterStatus]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Set filter status based on tab
    switch (newValue) {
      case 0: // Semua
        setFilterStatus('');
        break;
      case 1: // Pending
        setFilterStatus('PENDING');
        break;
      case 2: // Muat
        setFilterStatus('MUAT');
        break;
      case 3: // Transit
        setFilterStatus('TRANSIT');
        break;
      case 4: // Lansir
        setFilterStatus('LANSIR');
        break;
      case 5: // Terkirim
        setFilterStatus('TERKIRIM');
        break;
      case 6: // Return
        setFilterStatus('RETURN');
        break;
      default:
        setFilterStatus('');
    }
  };

  const handleOpenSTTDialog = (stt?: STT) => {
    if (stt) {
      setEditingSTT(stt);
      reset({
        cabangAsalId: stt.cabangAsalId,
        cabangTujuanId: stt.cabangTujuanId,
        pengirimId: stt.pengirimId,
        penerimaId: stt.penerimaId,
        namaBarang: stt.namaBarang,
        komoditi: stt.komoditi,
        packing: stt.packing,
        jumlahColly: stt.jumlahColly,
        berat: stt.berat,
        hargaPerKilo: stt.hargaPerKilo,
        harga: stt.harga,
        keterangan: stt.keterangan,
        kodePenerus: stt.kodePenerus,
        penerusId: stt.penerusId || '',
        paymentType: stt.paymentType as 'CASH' | 'COD' | 'CAD',
      });
    } else {
      setEditingSTT(null);
      reset({
        cabangAsalId: user?.cabangId || '',
        cabangTujuanId: '',
        pengirimId: '',
        penerimaId: '',
        namaBarang: '',
        komoditi: '',
        packing: '',
        jumlahColly: 1,
        berat: 0,
        hargaPerKilo: 0,
        harga: 0,
        keterangan: '',
        kodePenerus: '70', // Default: NO FORWARDING
        penerusId: '',
        paymentType: 'CASH',
      });
    }
    setOpenSTTDialog(true);
  };

  const handleCloseSTTDialog = () => {
    setOpenSTTDialog(false);
    setEditingSTT(null);
  };

  const onSubmit = (data: STTFormInputs) => {
    if (editingSTT) {
      dispatch(updateSTT({ id: editingSTT._id, sttData: data }));
    } else {
      dispatch(createSTT(data));
    }
    handleCloseSTTDialog();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  const handleBranchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterBranch(event.target.value);
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Filter STTs based on search term
  const filteredSTTs = sttList.filter((stt) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        stt.noSTT.toLowerCase().includes(searchLower) ||
        stt.namaBarang.toLowerCase().includes(searchLower) ||
        stt.pengirim?.nama.toLowerCase().includes(searchLower) ||
        stt.penerima?.nama.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Pagination
  const paginatedSTTs = filteredSTTs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Get status chip color
  type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

  const getStatusColor = (status: STT['status']): ChipColor => {
    switch (status) {
      case 'PENDING':
        return 'default';
      case 'MUAT':
        return 'primary';
      case 'TRANSIT':
        return 'info';
      case 'LANSIR':
        return 'warning';
      case 'TERKIRIM':
        return 'success';
      case 'RETURN':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get payment type chip color
  const getPaymentTypeColor = (type: STTFormInputs['paymentType']): ChipColor => {
    switch (type) {
      case 'CASH':
        return 'success';
      case 'COD':
        return 'primary';
      case 'CAD':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Handle PDF generation
  const handlePrintSTT = async (id: string) => {
    try {
      const response = await sttService.generatePDF(id);
      if (response?.url) {
        window.open(response.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  return (
    <>
      <Head>
        <title>STT - Samudra ERP</title>
      </Head>
      
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Surat Tanda Terima (STT)</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenSTTDialog()}
          >
            Buat STT Baru
          </Button>
        </Box>
        
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="STT status tabs"
            >
              <Tab label="Semua" />
              <Tab label="Pending" />
              <Tab label="Muat" />
              <Tab label="Transit" />
              <Tab label="Lansir" />
              <Tab label="Terkirim" />
              <Tab label="Return" />
            </Tabs>
          </Box>
          
          <Box p={2}>
            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cari STT"
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="branch-filter-label">Cabang</InputLabel>
                  <Select
                    labelId="branch-filter-label"
                    value={filterBranch}
                    label="Cabang"
                    onChange={handleBranchFilter as any}
                  >
                    <MenuItem value="">Semua Cabang</MenuItem>
                    {Array.isArray(branches) ? branches.map((branch) => (
                      <MenuItem key={branch._id} value={branch._id}>
                        {branch.namaCabang}
                      </MenuItem>
                    )) : null}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <TabPanel value={tabValue} index={tabValue}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>No. STT</TableCell>
                      <TableCell>Tgl. Dibuat</TableCell>
                      <TableCell>Pengirim</TableCell>
                      <TableCell>Penerima</TableCell>
                      <TableCell>Barang</TableCell>
                      <TableCell>Cabang Asal</TableCell>
                      <TableCell>Cabang Tujuan</TableCell>
                      <TableCell>Berat (kg)</TableCell>
                      <TableCell>Harga</TableCell>
                      <TableCell>Pembayaran</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : paginatedSTTs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center">
                          Tidak ada data STT
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSTTs.map((stt) => (
                        <TableRow key={stt._id}>
                          <TableCell>{stt.noSTT}</TableCell>
                          <TableCell>
                            {new Date(stt.createdAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>{stt.pengirim?.nama || '-'}</TableCell>
                          <TableCell>{stt.penerima?.nama || '-'}</TableCell>
                          <TableCell>{stt.namaBarang}</TableCell>
                          <TableCell>{stt.cabangAsal?.namaCabang || '-'}</TableCell>
                          <TableCell>{stt.cabangTujuan?.namaCabang || '-'}</TableCell>
                          <TableCell>{stt.berat}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(stt.harga)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={stt.paymentType}
                              color={getPaymentTypeColor(stt.paymentType)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={stt.status}
                              color={getStatusColor(stt.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Lihat Detail">
                              <IconButton 
                                size="small"
                                onClick={() => router.push(`/stt/${stt._id}`)}
                              >
                                <AssignmentIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit STT">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenSTTDialog(stt)}
                                disabled={stt.status !== 'PENDING'}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cetak STT">
                              <IconButton 
                                size="small"
                                onClick={() => handlePrintSTT(stt._id)}
                              >
                                <PrintIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredSTTs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TabPanel>
          </Box>
        </Paper>
      </Box>
      
      {/* STT Form Dialog */}
      <Dialog open={openSTTDialog} onClose={handleCloseSTTDialog} maxWidth="lg" fullWidth>
        <DialogTitle>{editingSTT ? 'Edit STT' : 'Buat STT Baru'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Informasi Cabang</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="cabangAsalId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Cabang Asal"
                      fullWidth
                      margin="normal"
                      error={!!errors.cabangAsalId}
                      helperText={errors.cabangAsalId?.message}
                      disabled={!!user?.cabangId}
                    >
                      {Array.isArray(branches) ? branches.map((branch) => (
                        <MenuItem key={branch._id} value={branch._id}>
                          {branch.namaCabang}
                        </MenuItem>
                      )) : null}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="cabangTujuanId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Cabang Tujuan"
                      fullWidth
                      margin="normal"
                      error={!!errors.cabangTujuanId}
                      helperText={errors.cabangTujuanId?.message}
                    >
                      <MenuItem value="">Semua Cabang</MenuItem>
                      {Array.isArray(branches) ? branches.map((branch) => (
                        <MenuItem key={branch._id} value={branch._id}>
                          {branch.namaCabang}
                        </MenuItem>
                      )) : null}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" mt={2}>Informasi Pengirim & Penerima</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="pengirimId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Pengirim"
                      fullWidth
                      margin="normal"
                      error={!!errors.pengirimId}
                      helperText={errors.pengirimId?.message}
                    >
                      {Array.isArray(senders) ? senders.map((sender) => (
                        <MenuItem key={sender._id} value={sender._id}>
                          {sender.nama} {sender.perusahaan ? ` - ${sender.perusahaan}` : ''}
                        </MenuItem>
                      )) : (
                        <MenuItem value="">No senders available</MenuItem>
                      )}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="penerimaId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Penerima"
                      fullWidth
                      margin="normal"
                      error={!!errors.penerimaId}
                      helperText={errors.penerimaId?.message}
                    >
                      {Array.isArray(recipients) ? recipients.map((recipient) => (
                        <MenuItem key={recipient._id} value={recipient._id}>
                          {recipient.nama} {recipient.perusahaan ? ` - ${recipient.perusahaan}` : ''}
                        </MenuItem>
                      )) : (
                        <MenuItem value="">No recipients available</MenuItem>
                      )}
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" mt={2}>Informasi Barang</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="namaBarang"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nama Barang"
                      fullWidth
                      margin="normal"
                      error={!!errors.namaBarang}
                      helperText={errors.namaBarang?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="komoditi"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Komoditi"
                      fullWidth
                      margin="normal"
                      error={!!errors.komoditi}
                      helperText={errors.komoditi?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="packing"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Packing"
                      fullWidth
                      margin="normal"
                      error={!!errors.packing}
                      helperText={errors.packing?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="jumlahColly"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Jumlah Colly"
                      fullWidth
                      margin="normal"
                      type="number"
                      inputProps={{ min: 1 }}
                      error={!!errors.jumlahColly}
                      helperText={errors.jumlahColly?.message}
                      onChange={(e) => field.setOnChange(Number(e.target.value))}
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
                      label="Berat (kg)"
                      fullWidth
                      margin="normal"
                      type="number"
                      inputProps={{ step: "0.1", min: 0.1 }}
                      error={!!errors.berat}
                      helperText={errors.berat?.message}
                      onChange={(e) => field.setOnChange(Number(e.target.value))}
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
                      label="Harga Per Kilo"
                      fullWidth
                      margin="normal"
                      type="number"
                      inputProps={{ min: 0 }}
                      error={!!errors.hargaPerKilo}
                      helperText={errors.hargaPerKilo?.message}
                      onChange={(e) => field.setOnChange(Number(e.target.value))}
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
                      label="Total Harga"
                      fullWidth
                      margin="normal"
                      type="number"
                      inputProps={{ min: 0 }}
                      error={!!errors.harga}
                      helperText={errors.harga?.message}
                      onChange={(e) => field.setOnChange(Number(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Controller
                  name="keterangan"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Keterangan (Opsional)"
                      fullWidth
                      margin="normal"
                      multiline
                      rows={1}
                      error={!!errors.keterangan}
                      helperText={errors.keterangan?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" mt={2}>Informasi Pembayaran & Pengiriman</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="paymentType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Metode Pembayaran"
                      fullWidth
                      margin="normal"
                      error={!!errors.paymentType}
                      helperText={errors.paymentType?.message}
                    >
                      <MenuItem value="CASH">CASH (Dibayar di Muka)</MenuItem>
                      <MenuItem value="COD">COD (Cash On Delivery)</MenuItem>
                      <MenuItem value="CAD">CAD (Cash After Delivery)</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="kodePenerus"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Kode Penerus"
                      fullWidth
                      margin="normal"
                      error={!!errors.kodePenerus}
                      helperText={errors.kodePenerus?.message}
                    >
                      <MenuItem value="70">70 - NO FORWARDING</MenuItem>
                      <MenuItem value="71">71 - FORWARDING PAID BY SENDER</MenuItem>
                      <MenuItem value="72">72 - FORWARDING PAID BY RECIPIENT</MenuItem>
                      <MenuItem value="73">73 - FORWARDING ADVANCED BY RECIPIENT BRANCH</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              
              {kodePenerus !== '70' && (
                <Grid item xs={12} md={4}>
                  <Controller
                    name="penerusId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Penerus"
                        fullWidth
                        margin="normal"
                        error={!!errors.penerusId}
                        helperText={errors.penerusId?.message}
                      >
                        <MenuItem value="">Pilih Penerus...</MenuItem>
                        {/* Placeholder for forwarders data */}
                        <MenuItem value="penerus1">Penerus 1</MenuItem>
                        <MenuItem value="penerus2">Penerus 2</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSTTDialog}>Batal</Button>
            <Button type="submit" variant="contained">
              {editingSTT ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      
      {/* Snackbar untuk notifikasi */}
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default withAuth(STTListPage);