// src/pages/vehicle/index.tsx
import React, { useEffect, useState, useRef } from 'react';
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
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  DirectionsCar as DirectionsCarIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  PhotoCamera as PhotoCameraIcon,
  Badge as BadgeIcon,
  Group as GroupIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehiclesByBranch,
  getTrucks,
  getDeliveryVehicles
} from '../../store/slices/vehicleSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { getEmployees } from '../../store/slices/employeeSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { Vehicle, VehicleFormInputs } from '../../types/vehicle';
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

// Schema for vehicle form validation
const vehicleSchema = z.object({
  noPolisi: z.string().min(1, 'Nomor Polisi wajib diisi'),
  namaKendaraan: z.string().min(1, 'Nama Kendaraan wajib diisi'),
  supirId: z.string().min(1, 'Supir wajib dipilih'),
  noTeleponSupir: z.string().min(1, 'Nomor Telepon Supir wajib diisi'),
  noKTPSupir: z.string().min(1, 'Nomor KTP Supir wajib diisi'),
  alamatSupir: z.string().min(1, 'Alamat Supir wajib diisi'),
  kenekId: z.string().optional(),
  noTeleponKenek: z.string().optional(),
  noKTPKenek: z.string().optional(),
  alamatKenek: z.string().optional(),
  cabangId: z.string().min(1, 'Cabang wajib dipilih'),
  tipe: z.enum(['Lansir', 'Antar Cabang'], {
    errorMap: () => ({ message: 'Tipe kendaraan wajib dipilih' }),
  }),
  grup: z.string().optional(),
});

const VehiclePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  const [tabValue, setTabValue] = useState(0);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterBranch, setFilterBranch] = useState<string>(user?.cabangId || '');
  const [filterType, setFilterType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Refs for file inputs
  const fotoSupirRef = useRef<HTMLInputElement>(null);
  const fotoKTPSupirRef = useRef<HTMLInputElement>(null);
  const fotoKenekRef = useRef<HTMLInputElement>(null);
  const fotoKTPKenekRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      noPolisi: '',
      namaKendaraan: '',
      supirId: '',
      noTeleponSupir: '',
      noKTPSupir: '',
      alamatSupir: '',
      kenekId: '',
      noTeleponKenek: '',
      noKTPKenek: '',
      alamatKenek: '',
      cabangId: user?.cabangId || '',
      tipe: 'Lansir',
      grup: '',
      fotoSupir: null,
      fotoKTPSupir: null,
      fotoKenek: null,
      fotoKTPKenek: null,
    },
  });

  // Watch tipe field to filter drivers/assistants
  const tipe = watch('tipe');

  useEffect(() => {
    // Load initial data
    dispatch(getBranches());
    dispatch(getEmployees());
    
    // Load vehicles based on filter
    if (filterBranch) {
      dispatch(getVehiclesByBranch(filterBranch));
    } else {
      dispatch(getVehicles());
    }
    
    if (filterType) {
      if (filterType === 'Antar Cabang') {
        dispatch(getTrucks());
      } else if (filterType === 'Lansir') {
        dispatch(getDeliveryVehicles());
      }
    }
  }, [dispatch, filterBranch, filterType]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Set filter type based on tab
    switch (newValue) {
      case 0: // Semua
        setFilterType('');
        break;
      case 1: // Lansir
        setFilterType('Lansir');
        break;
      case 2: // Antar Cabang
        setFilterType('Antar Cabang');
        break;
      default:
        setFilterType('');
    }
  };

  const handleOpenVehicleDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      reset({
        noPolisi: vehicle.noPolisi,
        namaKendaraan: vehicle.namaKendaraan,
        supirId: vehicle.supirId,
        noTeleponSupir: vehicle.noTeleponSupir,
        noKTPSupir: vehicle.noKTPSupir,
        alamatSupir: vehicle.alamatSupir,
        kenekId: vehicle.kenekId || '',
        noTeleponKenek: vehicle.noTeleponKenek || '',
        noKTPKenek: vehicle.noKTPKenek || '',
        alamatKenek: vehicle.alamatKenek || '',
        cabangId: vehicle.cabangId,
        tipe: vehicle.tipe,
        grup: vehicle.grup || '',
        fotoSupir: null,
        fotoKTPSupir: null,
        fotoKenek: null,
        fotoKTPKenek: null,
      });
    } else {
      setEditingVehicle(null);
      reset({
        noPolisi: '',
        namaKendaraan: '',
        supirId: '',
        noTeleponSupir: '',
        noKTPSupir: '',
        alamatSupir: '',
        kenekId: '',
        noTeleponKenek: '',
        noKTPKenek: '',
        alamatKenek: '',
        cabangId: user?.cabangId || '',
        tipe: 'Lansir',
        grup: '',
        fotoSupir: null,
        fotoKTPSupir: null,
        fotoKenek: null,
        fotoKTPKenek: null,
      });
    }
    setOpenVehicleDialog(true);
  };

  const handleCloseVehicleDialog = () => {
    setOpenVehicleDialog(false);
    setEditingVehicle(null);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setVehicleToDelete(id);
    setConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog(false);
    setVehicleToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (vehicleToDelete) {
      dispatch(deleteVehicle(vehicleToDelete));
    }
    handleCloseDeleteDialog();
  };

  const onSubmit = (data: any) => {
    // Create FormData
    const formData = new FormData();
    
    // Append all text fields
    formData.append('noPolisi', data.noPolisi);
    formData.append('namaKendaraan', data.namaKendaraan);
    formData.append('supirId', data.supirId);
    formData.append('noTeleponSupir', data.noTeleponSupir);
    formData.append('noKTPSupir', data.noKTPSupir);
    formData.append('alamatSupir', data.alamatSupir);
    
    if (data.kenekId) formData.append('kenekId', data.kenekId);
    if (data.noTeleponKenek) formData.append('noTeleponKenek', data.noTeleponKenek);
    if (data.noKTPKenek) formData.append('noKTPKenek', data.noKTPKenek);
    if (data.alamatKenek) formData.append('alamatKenek', data.alamatKenek);
    
    formData.append('cabangId', data.cabangId);
    formData.append('tipe', data.tipe);
    if (data.grup) formData.append('grup', data.grup);
    
    // Append files if they exist
    if (data.fotoSupir?.[0]) formData.append('fotoSupir', data.fotoSupir[0]);
    if (data.fotoKTPSupir?.[0]) formData.append('fotoKTPSupir', data.fotoKTPSupir[0]);
    if (data.fotoKenek?.[0]) formData.append('fotoKenek', data.fotoKenek[0]);
    if (data.fotoKTPKenek?.[0]) formData.append('fotoKTPKenek', data.fotoKTPKenek[0]);
    
    if (editingVehicle) {
      dispatch(updateVehicle({ id: editingVehicle._id, vehicleData: formData }));
    } else {
      dispatch(createVehicle(formData));
    }
    handleCloseVehicleDialog();
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

  // Filter vehicles based on search term and filters
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Filter by type if set
    if (filterType && vehicle.tipe !== filterType) {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        vehicle.noPolisi.toLowerCase().includes(searchLower) ||
        vehicle.namaKendaraan.toLowerCase().includes(searchLower) ||
        (vehicle.supir?.nama || '').toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Pagination
  const paginatedVehicles = filteredVehicles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Filter employees to get drivers and assistants
  const drivers = employees.filter(emp => 
    emp.jabatan === 'Supir' || emp.role === 'supir'
  );
  
  const assistants = employees.filter(emp => 
    emp.jabatan === 'Kenek' || emp.role === 'kenek'
  );

  return (
    <>
      <Head>
        <title>Kendaraan - Samudra ERP</title>
      </Head>
      
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Manajemen Kendaraan</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenVehicleDialog()}
          >
            Tambah Kendaraan
          </Button>
        </Box>
        
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="vehicle type tabs"
            >
              <Tab icon={<DirectionsCarIcon />} label="Semua" />
              <Tab icon={<DirectionsCarIcon />} label="Kendaraan Lansir" />
              <Tab icon={<LocalShippingIcon />} label="Truk Antar Cabang" />
            </Tabs>
          </Box>
          
          <Box p={2}>
            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  label="Cari Kendaraan"
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
              <Grid item xs={12} md={5}>
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
            
            <TabPanel value={tabValue} index={tabValue}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>No. Polisi</TableCell>
                      <TableCell>Nama Kendaraan</TableCell>
                      <TableCell>Tipe</TableCell>
                      <TableCell>Supir</TableCell>
                      <TableCell>Kenek</TableCell>
                      <TableCell>Cabang</TableCell>
                      <TableCell>Grup</TableCell>
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
                    ) : paginatedVehicles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Tidak ada data kendaraan
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedVehicles.map((vehicle) => (
                        <TableRow key={vehicle._id}>
                          <TableCell>{vehicle.noPolisi}</TableCell>
                          <TableCell>{vehicle.namaKendaraan}</TableCell>
                          <TableCell>
                            <Chip 
                              label={vehicle.tipe} 
                              color={vehicle.tipe === 'Lansir' ? 'primary' : 'secondary'} 
                              size="small" 
                              icon={vehicle.tipe === 'Lansir' ? <DirectionsCarIcon /> : <LocalShippingIcon />}
                            />
                          </TableCell>
                          <TableCell>{vehicle.supir?.nama || '-'}</TableCell>
                          <TableCell>{vehicle.kenek?.nama || '-'}</TableCell>
                          <TableCell>
                            {branches.find((branch) => branch._id === vehicle.cabangId)?.namaCabang || '-'}
                          </TableCell>
                          <TableCell>{vehicle.grup || '-'}</TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleOpenVehicleDialog(vehicle)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Hapus">
                              <IconButton onClick={() => handleOpenDeleteDialog(vehicle._id)}>
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
                count={filteredVehicles.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TabPanel>
          </Box>
        </Paper>
      </Box>
      
      {/* Vehicle Form Dialog */}
      <Dialog open={openVehicleDialog} onClose={handleCloseVehicleDialog} maxWidth="lg" fullWidth>
        <DialogTitle>{editingVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">Informasi Kendaraan</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="noPolisi"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nomor Polisi"
                      fullWidth
                      margin="normal"
                      error={!!errors.noPolisi}
                      helperText={errors.noPolisi?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="namaKendaraan"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nama Kendaraan"
                      fullWidth
                      margin="normal"
                      error={!!errors.namaKendaraan}
                      helperText={errors.namaKendaraan?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Controller
                  name="tipe"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Tipe Kendaraan"
                      fullWidth
                      margin="normal"
                      error={!!errors.tipe}
                      helperText={errors.tipe?.message}
                    >
                      <MenuItem value="Lansir">Lansir</MenuItem>
                      <MenuItem value="Antar Cabang">Antar Cabang</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
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
                      disabled={!!user?.cabangId}
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
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="grup"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Grup (Opsional)"
                      fullWidth
                      margin="normal"
                      error={!!errors.grup}
                      helperText={errors.grup?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" mt={2}>Informasi Supir</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="supirId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Supir"
                      fullWidth
                      margin="normal"
                      error={!!errors.supirId}
                      helperText={errors.supirId?.message}
                    >
                      {drivers.map((driver) => (
                        <MenuItem key={driver._id} value={driver._id}>
                          {driver.nama}
                        </MenuItem>
                      ))}
                    </TextField>
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
                      fullWidth
                      margin="normal"
                      error={!!errors.noTeleponSupir}
                      helperText={errors.noTeleponSupir?.message}
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
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="noKTPSupir"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nomor KTP Supir"
                      fullWidth
                      margin="normal"
                      error={!!errors.noKTPSupir}
                      helperText={errors.noKTPSupir?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon />
                          </InputAdornment>
                        ),
                      }}
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
                      fullWidth
                      margin="normal"
                      error={!!errors.alamatSupir}
                      helperText={errors.alamatSupir?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="fotoSupir"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <>
                      <input
                        {...field}
                        ref={fotoSupirRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(e.target.files);
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<PhotoCameraIcon />}
                        fullWidth
                        sx={{ mt: 2, height: '56px' }}
                        onClick={() => fotoSupirRef.current?.click()}
                      >
                        {value?.[0]?.name || (editingVehicle?.fotoSupir ? 'Ganti Foto Supir' : 'Upload Foto Supir')}
                      </Button>
                    </>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="fotoKTPSupir"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <>
                      <input
                        {...field}
                        ref={fotoKTPSupirRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(e.target.files);
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<BadgeIcon />}
                        fullWidth
                        sx={{ mt: 2, height: '56px' }}
                        onClick={() => fotoKTPSupirRef.current?.click()}
                      >
                        {value?.[0]?.name || (editingVehicle?.fotoKTPSupir ? 'Ganti Foto KTP Supir' : 'Upload Foto KTP Supir')}
                      </Button>
                    </>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" mt={2}>Informasi Kenek (Opsional)</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="kenekId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Kenek"
                      fullWidth
                      margin="normal"
                      error={!!errors.kenekId}
                      helperText={errors.kenekId?.message}
                    >
                      <MenuItem value="">Pilih Kenek...</MenuItem>
                      {assistants.map((assistant) => (
                        <MenuItem key={assistant._id} value={assistant._id}>
                          {assistant.nama}
                        </MenuItem>
                      ))}
                    </TextField>
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
                      fullWidth
                      margin="normal"
                      error={!!errors.noTeleponKenek}
                      helperText={errors.noTeleponKenek?.message}
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
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="noKTPKenek"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nomor KTP Kenek"
                      fullWidth
                      margin="normal"
                      error={!!errors.noKTPKenek}
                      helperText={errors.noKTPKenek?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon />
                          </InputAdornment>
                        ),
                      }}
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
                      fullWidth
                      margin="normal"
                      error={!!errors.alamatKenek}
                      helperText={errors.alamatKenek?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="fotoKenek"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <>
                      <input
                        {...field}
                        ref={fotoKenekRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(e.target.files);
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<PhotoCameraIcon />}
                        fullWidth
                        sx={{ mt: 2, height: '56px' }}
                        onClick={() => fotoKenekRef.current?.click()}
                      >
                        {value?.[0]?.name || (editingVehicle?.fotoKenek ? 'Ganti Foto Kenek' : 'Upload Foto Kenek')}
                      </Button>
                    </>
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="fotoKTPKenek"
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <>
                      <input
                        {...field}
                        ref={fotoKTPKenekRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(e.target.files);
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<BadgeIcon />}
                        fullWidth
                        sx={{ mt: 2, height: '56px' }}
                        onClick={() => fotoKTPKenekRef.current?.click()}
                      >
                        {value?.[0]?.name || (editingVehicle?.fotoKTPKenek ? 'Ganti Foto KTP Kenek' : 'Upload Foto KTP Kenek')}
                      </Button>
                    </>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseVehicleDialog}>Batal</Button>
            <Button type="submit" variant="contained">
              {editingVehicle ? 'Perbarui' : 'Simpan'}
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
            Apakah Anda yakin ingin menghapus kendaraan ini?
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

export default withAuth(VehiclePage);