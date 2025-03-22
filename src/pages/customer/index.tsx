// src/pages/customer/index.tsx
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
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomersByBranch
} from '../../store/slices/customerSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { Customer, CustomerFormInputs } from '../../types/customer';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import withAuth from '../../components/auth/withAuth';

// Schema for customer form validation
const customerSchema = z.object({
  nama: z.string().min(1, 'Nama customer wajib diisi'),
  tipe: z.enum(['Pengirim', 'Penerima', 'Keduanya'], {
    errorMap: () => ({ message: 'Tipe customer wajib dipilih' }),
  }),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  kelurahan: z.string().min(1, 'Kelurahan wajib diisi'),
  kecamatan: z.string().min(1, 'Kecamatan wajib diisi'),
  kota: z.string().min(1, 'Kota wajib diisi'),
  provinsi: z.string().min(1, 'Provinsi wajib diisi'),
  telepon: z.string().min(1, 'Telepon wajib diisi'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  perusahaan: z.string().optional().or(z.literal('')),
  cabangId: z.string().min(1, 'Cabang wajib dipilih'),
});

const CustomerPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Add default empty array for customers
  const { customers = [] } = useSelector((state: RootState) => state.customer);
  // Add default empty array for branches
  const { branches = [] } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterBranch, setFilterBranch] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormInputs>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      nama: '',
      tipe: 'Pengirim',
      alamat: '',
      kelurahan: '',
      kecamatan: '',
      kota: '',
      provinsi: '',
      telepon: '',
      email: '',
      perusahaan: '',
      cabangId: '',
    },
  });

  useEffect(() => {
    dispatch(getCustomers());
    dispatch(getBranches());
  }, [dispatch]);

  useEffect(() => {
    if (filterBranch) {
      dispatch(getCustomersByBranch(filterBranch));
    } else {
      dispatch(getCustomers());
    }
  }, [dispatch, filterBranch]);

  const handleOpenCustomerDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      reset({
        nama: customer.nama,
        tipe: customer.tipe as 'Pengirim' | 'Penerima' | 'Keduanya',
        alamat: customer.alamat,
        kelurahan: customer.kelurahan,
        kecamatan: customer.kecamatan,
        kota: customer.kota,
        provinsi: customer.provinsi,
        telepon: customer.telepon,
        email: customer.email,
        perusahaan: customer.perusahaan,
        cabangId: customer.cabangId,
      });
    } else {
      setEditingCustomer(null);
      reset({
        nama: '',
        tipe: 'Pengirim',
        alamat: '',
        kelurahan: '',
        kecamatan: '',
        kota: '',
        provinsi: '',
        telepon: '',
        email: '',
        perusahaan: '',
        cabangId: user?.cabangId || '',
      });
    }
    setOpenCustomerDialog(true);
  };

  const handleCloseCustomerDialog = () => {
    setOpenCustomerDialog(false);
    setEditingCustomer(null);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setCustomerToDelete(id);
    setConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog(false);
    setCustomerToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      dispatch(deleteCustomer(customerToDelete));
    }
    handleCloseDeleteDialog();
  };

  const onSubmit = (data: CustomerFormInputs) => {
    if (editingCustomer) {
      dispatch(updateCustomer({ id: editingCustomer._id, customerData: data }));
    } else {
      dispatch(createCustomer(data));
    }
    handleCloseCustomerDialog();
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

  const handleTypeFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Filter customers based on search term and filters
  const filteredCustomers = Array.isArray(customers) 
    ? customers.filter((customer) => {
        if (filterType && customer.tipe !== filterType && !(filterType === 'Keduanya' && (customer.tipe === 'Pengirim' || customer.tipe === 'Penerima'))) {
          return false;
        }
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            customer.nama.toLowerCase().includes(searchLower) ||
            customer.perusahaan.toLowerCase().includes(searchLower) ||
            customer.telepon.includes(searchTerm) ||
            customer.alamat.toLowerCase().includes(searchLower) ||
            customer.kota.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
    : [];

  // Pagination with safety check
  const paginatedCustomers = Array.isArray(filteredCustomers)
    ? filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];

  // Get chip color based on customer type
  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'Pengirim':
        return 'primary';
      case 'Penerima':
        return 'secondary';
      case 'Keduanya':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Head>
        <title>Customer - Samudra ERP</title>
      </Head>
      
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Manajemen Customer</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCustomerDialog()}
          >
            Tambah Customer
          </Button>
        </Box>
        
        <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cari Customer"
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="type-filter-label">Tipe Customer</InputLabel>
                <Select
                  labelId="type-filter-label"
                  value={filterType}
                  label="Tipe Customer"
                  onChange={handleTypeFilter as any}
                >
                  <MenuItem value="">Semua Tipe</MenuItem>
                  <MenuItem value="Pengirim">Pengirim</MenuItem>
                  <MenuItem value="Penerima">Penerima</MenuItem>
                  <MenuItem value="Keduanya">Keduanya</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="branch-filter-label">Cabang</InputLabel>
                <Select
                  labelId="branch-filter-label"
                  value={filterBranch}
                  label="Cabang"
                  onChange={handleBranchFilter as any}
                >
                  <MenuItem value="">Semua Cabang</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id}>
                      {branch.namaCabang}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nama</TableCell>
                  <TableCell>Tipe</TableCell>
                  <TableCell>Perusahaan</TableCell>
                  <TableCell>Telepon</TableCell>
                  <TableCell>Alamat</TableCell>
                  <TableCell>Kota</TableCell>
                  <TableCell>Cabang</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : paginatedCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Tidak ada data customer
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell>{customer.nama}</TableCell>
                      <TableCell>
                        <Chip 
                          label={customer.tipe} 
                          color={getCustomerTypeColor(customer.tipe) as any} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{customer.perusahaan || '-'}</TableCell>
                      <TableCell>{customer.telepon}</TableCell>
                      <TableCell>{customer.alamat}</TableCell>
                      <TableCell>{customer.kota}</TableCell>
                      <TableCell>
                        {branches.find((branch) => branch._id === customer.cabangId)?.namaCabang || '-'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleOpenCustomerDialog(customer)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus">
                          <IconButton onClick={() => handleOpenDeleteDialog(customer._id)}>
                            <DeleteIcon />
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
            count={filteredCustomers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
      
      {/* Customer Dialog */}
      <Dialog open={openCustomerDialog} onClose={handleCloseCustomerDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Tambah Customer'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="nama"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nama Customer"
                      fullWidth
                      margin="normal"
                      error={!!errors.nama}
                      helperText={errors.nama?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="tipe"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Tipe Customer"
                      fullWidth
                      margin="normal"
                      error={!!errors.tipe}
                      helperText={errors.tipe?.message}
                    >
                      <MenuItem value="Pengirim">Pengirim</MenuItem>
                      <MenuItem value="Penerima">Penerima</MenuItem>
                      <MenuItem value="Keduanya">Keduanya</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="telepon"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telepon"
                      fullWidth
                      margin="normal"
                      error={!!errors.telepon}
                      helperText={errors.telepon?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      margin="normal"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="perusahaan"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Perusahaan"
                      fullWidth
                      margin="normal"
                      error={!!errors.perusahaan}
                      helperText={errors.perusahaan?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
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
                      fullWidth
                      margin="normal"
                      error={!!errors.alamat}
                      helperText={errors.alamat?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="kelurahan"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kelurahan"
                      fullWidth
                      margin="normal"
                      error={!!errors.kelurahan}
                      helperText={errors.kelurahan?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="kecamatan"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kecamatan"
                      fullWidth
                      margin="normal"
                      error={!!errors.kecamatan}
                      helperText={errors.kecamatan?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="kota"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kota"
                      fullWidth
                      margin="normal"
                      error={!!errors.kota}
                      helperText={errors.kota?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="provinsi"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Provinsi"
                      fullWidth
                      margin="normal"
                      error={!!errors.provinsi}
                      helperText={errors.provinsi?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="cabangId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Cabang"
                      fullWidth
                      margin="normal"
                      error={!!errors.cabangId}
                      helperText={errors.cabangId?.message}
                    >
                      {branches.map((branch) => (
                        <MenuItem key={branch._id} value={branch._id}>
                          {branch.namaCabang}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCustomerDialog}>Batal</Button>
            <Button type="submit" variant="contained">
              {editingCustomer ? 'Perbarui' : 'Simpan'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Konfirmasi Hapus
        </DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus customer ini?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Batal</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Hapus
          </Button>
        </DialogActions>
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

export default withAuth(CustomerPage);