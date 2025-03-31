import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Avatar,
  CircularProgress,
  Box
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  PhotoCamera as PhotoCameraIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Employee, employeeFormSchema, EmployeeFormInputs, MAX_FILE_SIZE, ALLOWED_FILE_TYPES, ALLOWED_DOCUMENT_TYPES } from '../../types/employee';

interface EmployeeFormProps {
  initialData?: Employee;
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  loading
}) => {
  // Get roles and branches from store
  const { roles } = useSelector((state: RootState) => state.employee);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [ktpDocument, setKtpDocument] = useState<File | null>(null);
  const [npwpDocument, setNpwpDocument] = useState<File | null>(null);
  
  // File previews
  const [profilePreview, setProfilePreview] = useState<string | null>(initialData?.fotoProfil || null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(initialData?.dokumen?.ktp || null);
  const [npwpPreview, setNpwpPreview] = useState<string | null>(initialData?.dokumen?.npwp || null);
  
  // File errors
  const [fileErrors, setFileErrors] = useState<{
    fotoProfil?: string;
    'dokumen.ktp'?: string;
    'dokumen.npwp'?: string;
  }>({});

  // Setup react-hook-form
  const { 
    control, 
    handleSubmit, 
    watch,
    setValue,
    formState: { errors } 
  } = useForm<EmployeeFormInputs>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      nama: initialData?.nama || '',
      jabatan: initialData?.jabatan || '',
      roleId: typeof initialData?.roleId === 'string' ? initialData.roleId : (initialData?.roleId as any)?._id || '',
      email: initialData?.email || '',
      telepon: initialData?.telepon || '',
      alamat: initialData?.alamat || '',
      username: initialData?.username || '',
      password: '', // Never pre-fill password
      confirmPassword: '',
      cabangId: typeof initialData?.cabangId === 'string' ? initialData.cabangId : (initialData?.cabangId as any)?._id || (user?.cabangId || ''),
      aktif: initialData?.aktif ?? true,
    }
  });
  
  // Handle toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
  
  // Handle file changes
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'profile' | 'ktp' | 'npwp') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileErrors(prev => ({
        ...prev,
        [fileType === 'profile' ? 'fotoProfil' : `dokumen.${fileType}`]: 'Ukuran file maksimal 5MB'
      }));
      return;
    }
    
    // Validate file type
    const allowedTypes = fileType === 'profile' ? ALLOWED_FILE_TYPES : ALLOWED_DOCUMENT_TYPES;
    if (!allowedTypes.includes(file.type)) {
      setFileErrors(prev => ({
        ...prev,
        [fileType === 'profile' ? 'fotoProfil' : `dokumen.${fileType}`]: fileType === 'profile' 
          ? 'Format file harus berupa JPG, JPEG, atau PNG'
          : 'Format file harus berupa JPG, JPEG, PNG, atau PDF'
      }));
      return;
    }
    
    // Clear previous error
    setFileErrors(prev => ({
      ...prev,
      [fileType === 'profile' ? 'fotoProfil' : `dokumen.${fileType}`]: undefined
    }));
    
    // Set file and preview
    if (fileType === 'profile') {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'ktp') {
      setKtpDocument(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setKtpPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs
        setKtpPreview('/icons/pdf-icon.png');
      }
    } else if (fileType === 'npwp') {
      setNpwpDocument(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setNpwpPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs
        setNpwpPreview('/icons/pdf-icon.png');
      }
    }
  };
  
  // Handle form submission
  const onFormSubmit = (data: EmployeeFormInputs) => {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'confirmPassword' && value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Add files if they exist
    if (profilePicture) {
      formData.append('fotoProfil', profilePicture);
    }
    
    if (ktpDocument) {
      formData.append('dokumen.ktp', ktpDocument);
    }
    
    if (npwpDocument) {
      formData.append('dokumen.npwp', npwpDocument);
    }
    
    // Submit form
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Card elevation={0} sx={{ mt: 2 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Profile photo */}
            <Grid item xs={12} display="flex" flexDirection="column" alignItems="center" mb={2}>
              <Avatar
                alt="Foto Profil"
                src={profilePreview || '/default-avatar.png'}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                disabled={loading}
              >
                {profilePicture ? 'Ganti Foto' : 'Upload Foto'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  hidden
                  onChange={(e) => handleFileChange(e, 'profile')}
                  disabled={loading}
                />
              </Button>
              {fileErrors.fotoProfil && (
                <Typography variant="caption" color="error" mt={1}>
                  {fileErrors.fotoProfil}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informasi Pegawai
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            {/* Employee name */}
            <Grid item xs={12} md={6}>
              <Controller
                name="nama"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nama Lengkap"
                    fullWidth
                    error={!!errors.nama}
                    helperText={errors.nama?.message}
                    disabled={loading}
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
            
            {/* Employee position */}
            <Grid item xs={12} md={6}>
              <Controller
                name="jabatan"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Jabatan"
                    fullWidth
                    error={!!errors.jabatan}
                    helperText={errors.jabatan?.message}
                    disabled={loading}
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
            
            {/* Email */}
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={loading}
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
            
            {/* Phone */}
            <Grid item xs={12} md={6}>
              <Controller
                name="telepon"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nomor Telepon"
                    fullWidth
                    error={!!errors.telepon}
                    helperText={errors.telepon?.message}
                    disabled={loading}
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
            
            {/* Address */}
            <Grid item xs={12}>
              <Controller
                name="alamat"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Alamat"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.alamat}
                    helperText={errors.alamat?.message}
                    disabled={loading}
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
              <Typography variant="h6" gutterBottom>
                Role dan Cabang
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            {/* Role */}
            <Grid item xs={12} md={6}>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.roleId} disabled={loading}>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      {...field}
                      labelId="role-label"
                      label="Role"
                      startAdornment={
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      }
                    >
                      {roles.filter(role => {
                        // Filter roles based on user's role
                        if (user?.role === 'direktur') return true;
                        
                        // Admin and HR managers can't assign direktur
                        if (['manajer_admin', 'manajer_sdm'].includes(user?.role || '') && role.kodeRole === 'direktur') {
                          return false;
                        }
                        
                        // Kepala cabang can only assign staff roles
                        if (user?.role === 'kepala_cabang') {
                          return ['staff_admin', 'staff_penjualan', 'kasir', 'checker', 'supir'].includes(role.kodeRole);
                        }
                        
                        return true;
                      }).map(role => (
                        <MenuItem key={role._id} value={role._id}>
                          {role.namaRole}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.roleId?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Branch */}
            <Grid item xs={12} md={6}>
              <Controller
                name="cabangId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.cabangId} disabled={loading || (!!user?.cabangId && user?.role !== 'direktur')}>
                    <InputLabel id="branch-label">Cabang</InputLabel>
                    <Select
                      {...field}
                      labelId="branch-label"
                      label="Cabang"
                      startAdornment={
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      }
                    >
                      {branches.map(branch => (
                        <MenuItem key={branch._id} value={branch._id}>
                          {branch.namaCabang}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.cabangId?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            
            {/* Active status */}
            <Grid item xs={12} md={6}>
              <Controller
                name="aktif"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={loading}
                      />
                    }
                    label="Aktif"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Login Credentials
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            {/* Username */}
            <Grid item xs={12} md={6}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    fullWidth
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    disabled={loading || !!initialData} // Disable if editing
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
            
            {/* Password */}
            <Grid item xs={12} md={6}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={initialData ? "Password (Kosongkan jika tidak diubah)" : "Password"}
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            disabled={loading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            {/* Confirm Password */}
            <Grid item xs={12} md={6}>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Konfirmasi Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                            disabled={loading}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Dokumen Pendukung
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            {/* KTP Document */}
            <Grid item xs={12} md={6}>
              <Box display="flex" flexDirection="column" alignItems="center">
                {ktpPreview && (
                  <Box mb={2} display="flex" justifyContent="center">
                    {ktpPreview.endsWith('.pdf') || ktpPreview.includes('pdf-icon') ? (
                      <img src="/icons/pdf-icon.png" alt="PDF" width="100" />
                    ) : (
                      <img src={ktpPreview} alt="KTP" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                    )}
                  </Box>
                )}
                
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={loading}
                  fullWidth
                >
                  {ktpDocument ? 'Ganti KTP' : 'Upload KTP'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    hidden
                    onChange={(e) => handleFileChange(e, 'ktp')}
                    disabled={loading}
                  />
                </Button>
                {fileErrors['dokumen.ktp'] && (
                  <Typography variant="caption" color="error" mt={1}>
                    {fileErrors['dokumen.ktp']}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            {/* NPWP Document */}
            <Grid item xs={12} md={6}>
              <Box display="flex" flexDirection="column" alignItems="center">
                {npwpPreview && (
                  <Box mb={2} display="flex" justifyContent="center">
                    {npwpPreview.endsWith('.pdf') || npwpPreview.includes('pdf-icon') ? (
                      <img src="/icons/pdf-icon.png" alt="PDF" width="100" />
                    ) : (
                      <img src={npwpPreview} alt="NPWP" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                    )}
                  </Box>
                )}
                
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  disabled={loading}
                  fullWidth
                >
                  {npwpDocument ? 'Ganti NPWP' : 'Upload NPWP'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    hidden
                    onChange={(e) => handleFileChange(e, 'npwp')}
                    disabled={loading}
                  />
                </Button>
                {fileErrors['dokumen.npwp'] && (
                  <Typography variant="caption" color="error" mt={1}>
                    {fileErrors['dokumen.npwp']}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
          
          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Simpan'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </form>
  );
};

export default EmployeeForm;