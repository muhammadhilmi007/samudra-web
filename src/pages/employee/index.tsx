// src/pages/employee/index.tsx
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
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  PhotoCamera as PhotoCameraIcon,
  VpnKey as VpnKeyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByBranch,
  getRoles
} from '../../store/slices/employeeSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { Employee } from '../../types/employee';
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

// Schema for employee form validation
const employeeSchema = z.object({
  nama: z.string().min(1, 'Nama pegawai wajib diisi'),
  jabatan: z.string().min(1, 'Jabatan wajib diisi'),
  roleId: z.string().min(1, 'Role wajib dipilih'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  telepon: z.string().min(1, 'Nomor telepon wajib diisi'),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  confirmPassword: z.string().optional(),
  cabangId: z.string().min(1, 'Cabang wajib dipilih'),
  aktif: z.boolean(),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

const EmployeePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { employees, roles } = useSelector((state: RootState) => state.employee);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  const [tabValue, setTabValue] = useState(0);
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterBranch, setFilterBranch] = useState<string>(user?.cabangId || '');
  const [filterRole, setFilterRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  // Refs for file inputs
  const fotoProfilRef = useRef<HTMLInputElement>(null);
  const ktpRef = useRef<HTMLInputElement>(null);
  const npwpRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nama: '',
      jabatan: '',
      roleId: user?.roleId || '',
      email: '',
      telepon: '',
      alamat: '',
      username: '',
      password: '',
      confirmPassword: '',
      cabangId: user?.cabangId || '',
      aktif: true,
      fotoProfil: null,
      'dokumen.ktp': null,
      'dokumen.npwp': null,
    },
  });
  

  useEffect(() => {
    // Load initial data
    dispatch(getBranches());
    dispatch(getRoles());
    
    // Load employees based on filter
    if (filterBranch) {
      dispatch(getEmployeesByBranch(filterBranch));
    } else {
      dispatch(getEmployees({}));
    }
  }, [dispatch, filterBranch]);

  useEffect(() => {
    console.log("Current employees data:", employees);
  }, [employees]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Set filter role based on tab
    switch (newValue) {
      case 0: // Semua
        setFilterRole('');
        break;
      case 1: // Admin
        setFilterRole('admin');
        break;
      case 2: // Operasional
        setFilterRole('operasional');
        break;
      default:
        setFilterRole('');
    }
  };

  const handleOpenEmployeeDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      reset({
        nama: employee.nama,
        jabatan: employee.jabatan,
        roleId: typeof employee.roleId === 'string' ? employee.roleId : '',
        email: employee.email || '',
        telepon: employee.telepon,
        alamat: employee.alamat,
        username: employee.username,
        password: '', // Don't populate password for edit
        confirmPassword: '',
        cabangId: typeof employee.cabangId === 'string' ? employee.cabangId : '',
        aktif: employee.aktif,
        fotoProfil: null,
        'dokumen.ktp': null,
        'dokumen.npwp': null,
      });
    } else {
      setEditingEmployee(null);
      reset({
        nama: '',
        jabatan: '',
        roleId: '',
        email: '',
        telepon: '',
        alamat: '',
        username: '',
        password: '',
        confirmPassword: '',
        cabangId: user?.cabangId || '',
        aktif: true,
        fotoProfil: null,
        'dokumen.ktp': null,
        'dokumen.npwp': null,
      });
    }
    setOpenEmployeeDialog(true);
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
    setEditingEmployee(null);
    setShowPassword(false);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setEmployeeToDelete(id);
    setConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog(false);
    setEmployeeToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (employeeToDelete) {
      dispatch(deleteEmployee(employeeToDelete));
    }
    handleCloseDeleteDialog();
  };

  const onSubmit = (data: any) => {
    // Create FormData
    const formData = new FormData();
    
    // Append all text fields
    formData.append('nama', data.nama);
    formData.append('jabatan', data.jabatan);
    formData.append('roleId', data.roleId);
    if (data.email) formData.append('email', data.email);
    formData.append('telepon', data.telepon);
    formData.append('alamat', data.alamat);
    formData.append('username', data.username);
    if (data.password) formData.append('password', data.password);
    formData.append('cabangId', data.cabangId);
    formData.append('aktif', data.aktif ? 'true' : 'false');
    
    // Append files if they exist
    if (data.fotoProfil?.[0]) formData.append('fotoProfil', data.fotoProfil[0]);
    if (data['dokumen.ktp']?.[0]) formData.append('dokumen.ktp', data['dokumen.ktp'][0]);
    if (data['dokumen.npwp']?.[0]) formData.append('dokumen.npwp', data['dokumen.npwp'][0]);
    
    if (editingEmployee) {
      dispatch(updateEmployee({ id: editingEmployee._id, employeeData: formData }));
    } else {
      dispatch(createEmployee(formData));
    }
    handleCloseEmployeeDialog();
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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Filter employees based on search term and filters
  const filteredEmployees = (employees || []).filter((employee) => {
    // Filter by role if set
    if (filterRole) {
      const employeeRole = (roles || []).find(r => r._id === employee.roleId)?.namaRole?.toLowerCase() || '';
      if (!employeeRole.includes(filterRole)) {
        return false;
      }
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        employee.nama.toLowerCase().includes(searchLower) ||
        employee.jabatan.toLowerCase().includes(searchLower) ||
        employee.username.toLowerCase().includes(searchLower) ||
        (employee.email || '').toLowerCase().includes(searchLower) ||
        (employee.telepon || '').includes(searchTerm)
      );
    }
    return true;
  });

  // Pagination
  const paginatedEmployees = filteredEmployees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Get role name by ID
  const getRoleName = (roleId: string) => {
    const role = (roles || []).find(r => r._id === roleId);
    return role?.namaRole || '-';
  };

  return (
    <>
      <Head>
        <title>Manajemen Pengguna - Samudra ERP</title>
      </Head>

      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Manajemen Pengguna
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Kelola data pegawai dan hak akses pengguna sistem
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenEmployeeDialog()}
          >
            Tambah Pegawai
          </Button>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label="Daftar Pegawai" />
          <Tab label="Admin" />
          <Tab label="Operasional" />
        </Tabs>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Box p={2}>
            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  label="Cari Pegawai"
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
                      <TableCell>Nama</TableCell>
                      <TableCell>Jabatan</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Telepon</TableCell>
                      <TableCell>Cabang</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : paginatedEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          Tidak ada data pegawai
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedEmployees.map((employee) => (
                        <TableRow key={employee._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar 
                                src={employee.fotoProfil} 
                                alt={employee.nama} 
                                sx={{ mr: 1 }}
                              >
                                {employee.nama.charAt(0)}
                              </Avatar>
                              {employee.nama}
                            </Box>
                          </TableCell>
                          <TableCell>{employee.jabatan}</TableCell>
                          <TableCell>{getRoleName(employee.roleId)}</TableCell>
                          <TableCell>{employee.username}</TableCell>
                          <TableCell>{employee.email || '-'}</TableCell>
                          <TableCell>{employee.telepon}</TableCell>
                          <TableCell>
                            {branches.find((branch) => branch._id === employee.cabangId)?.namaCabang || '-'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={employee.aktif ? 'Aktif' : 'Nonaktif'} 
                              color={employee.aktif ? 'success' : 'error'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleOpenEmployeeDialog(employee)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Hapus">
                              <IconButton onClick={() => handleOpenDeleteDialog(employee._id)}>
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
                count={filteredEmployees.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TabPanel>
          </Box>
        </Paper>

        {/* Employee Form Dialog */}
        <Dialog 
          open={openEmployeeDialog} 
          onClose={handleCloseEmployeeDialog}
          maxWidth="md"
          fullWidth
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle>
              {editingEmployee ? 'Edit Pegawai' : 'Tambah Pegawai'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">Informasi Pegawai</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="nama"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nama Pegawai"
                        fullWidth
                        margin="normal"
                        error={!!errors.nama}
                        helperText={errors.nama?.message?.toString()}
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
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="roleId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Role"
                        fullWidth
                        margin="normal"
                        error={!!errors.roleId}
                        helperText={errors.roleId?.message?.toString()}
                        value={typeof field.value === 'string' ? field.value : ''}
                      >
                        {(roles || []).map((role) => (
                          <MenuItem key={role._id} value={role._id}>
                            {role.namaRole}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="jabatan"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Jabatan"
                        fullWidth
                        margin="normal"
                        error={!!errors.jabatan}
                        helperText={errors.jabatan?.message?.toString()}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
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
                        helperText={errors.cabangId?.message?.toString()}
                        disabled={!!user?.cabangId}
                        value={typeof field.value === 'string' ? field.value : ''} // Ensure value is a string
                      >
                        <MenuItem value="">Pilih Cabang</MenuItem>
                        {branches.map((branch) => (
                          <MenuItem key={branch._id} value={branch._id}>
                            {branch.namaCabang}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="telepon"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nomor Telepon"
                        fullWidth
                        margin="normal"
                        error={!!errors.telepon}
                        helperText={errors.telepon?.message?.toString()}
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
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        error={!!errors.email}
                        helperText={errors.email?.message?.toString()}
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
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="aktif"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={field.onChange} />}
                        label="Aktif"
                        sx={{ mt: 3 }}
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
                        multiline
                        rows={2}
                        error={!!errors.alamat}
                        helperText={errors.alamat?.message?.toString()}
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
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" mt={2}>Credentials</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Username"
                        fullWidth
                        margin="normal"
                        error={!!errors.username}
                        helperText={errors.username?.message?.toString()}
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
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={editingEmployee ? 'Password (Kosongkan jika tidak diubah)' : 'Password'}
                        fullWidth
                        margin="normal"
                        type={showPassword ? 'text' : 'password'}
                        error={!!errors.password}
                        helperText={errors.password?.message?.toString()}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <VpnKeyIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={toggleShowPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Konfirmasi Password"
                        fullWidth
                        margin="normal"
                        type={showPassword ? 'text' : 'password'}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message?.toString()}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <VpnKeyIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold" mt={2}>Dokumen</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="fotoProfil"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <>
                        <input
                          {...field}
                          ref={fotoProfilRef}
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
                          onClick={() => fotoProfilRef.current?.click()}
                        >
                          {value?.[0]?.name || (editingEmployee?.fotoProfil ? 'Ganti Foto Profil' : 'Upload Foto Profil')}
                        </Button>
                      </>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="dokumen.ktp"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <>
                        <input
                          {...field}
                          ref={ktpRef}
                          type="file"
                          accept="image/*,.pdf"
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
                          onClick={() => ktpRef.current?.click()}
                        >
                          {value?.[0]?.name || (editingEmployee?.dokumen?.ktp ? 'Ganti KTP' : 'Upload KTP')}
                        </Button>
                      </>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="dokumen.npwp"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <>
                        <input
                          {...field}
                          ref={npwpRef}
                          type="file"
                          accept="image/*,.pdf"
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
                          onClick={() => npwpRef.current?.click()}
                        >
                          {value?.[0]?.name || (editingEmployee?.dokumen?.npwp ? 'Ganti NPWP' : 'Upload NPWP')}
                        </Button>
                      </>
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEmployeeDialog}>Batal</Button>
              <Button type="submit" variant="contained">
                {editingEmployee ? 'Perbarui' : 'Simpan'}
              </Button>
            </DialogActions>
          </form>
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
              Apakah Anda yakin ingin menghapus pegawai ini?
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
        <Snackbar 
          open={!!error || !!success} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={error ? 'error' : 'success'} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {error || success}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default withAuth(EmployeePage);