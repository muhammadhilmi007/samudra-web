import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  MenuItem, 
  Box, 
  Typography,
  CircularProgress,
  Paper 
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Branch } from '../../types/branch';

// Direct interface that matches backend expectations
interface FormData {
  namaCabang: string;
  divisiId: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kontakPenanggungJawab: {
    nama: string;
    telepon: string;
    email: string;
  };
}

interface BranchFormProps {
  initialData?: Branch;
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({ initialData, onSubmit, loading = false }) => {
  const { divisions } = useSelector((state: RootState) => state.division);
  
  // Initialize form data with proper structure
  const [formData, setFormData] = useState<FormData>({
    namaCabang: initialData?.namaCabang || '',
    divisiId: initialData?.divisiId?._id || '',
    alamat: initialData?.alamat || '',
    kelurahan: initialData?.kelurahan || '',
    kecamatan: initialData?.kecamatan || '',
    kota: initialData?.kota || '',
    provinsi: initialData?.provinsi || '',
    kontakPenanggungJawab: {
      nama: initialData?.kontakPenanggungJawab?.nama || '',
      telepon: initialData?.kontakPenanggungJawab?.telepon || '',
      email: initialData?.kontakPenanggungJawab?.email || ''
    }
  });
  
  // Separate state for form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [debug, setDebug] = useState<{
    originalData: FormData;
    submissionData: FormData;
    hasKontakNama: boolean;
    hasKontakTelepon: boolean;
    timestamp: string;
  } | null>(null);
  
  // Handle input changes for regular fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle changes for nested kontakPenanggungJawab fields
  const handleKontakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Ensure we're updating the state correctly with the latest value
    const updatedKontak = {
      ...formData.kontakPenanggungJawab,
      [name]: value
    };
    
    setFormData({
      ...formData,
      kontakPenanggungJawab: updatedKontak
    });
    
    // Debug log untuk memastikan nilai tersimpan dengan benar
    console.log(`Field ${name} diubah menjadi: ${value}`);
    console.log('Current kontakPenanggungJawab state:', updatedKontak);
  };
  
  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check all required fields
    if (!formData.namaCabang) newErrors.namaCabang = 'Nama cabang wajib diisi';
    if (!formData.divisiId) newErrors.divisiId = 'Divisi wajib dipilih';
    if (!formData.alamat) newErrors.alamat = 'Alamat wajib diisi';
    if (!formData.kelurahan) newErrors.kelurahan = 'Kelurahan wajib diisi';
    if (!formData.kecamatan) newErrors.kecamatan = 'Kecamatan wajib diisi';
    if (!formData.kota) newErrors.kota = 'Kota wajib diisi';
    if (!formData.provinsi) newErrors.provinsi = 'Provinsi wajib diisi';
    
    // Check kontakPenanggungJawab fields - ensure we're checking for empty strings too
    if (!formData.kontakPenanggungJawab.nama || formData.kontakPenanggungJawab.nama.trim() === '') {
      newErrors['kontakPenanggungJawab.nama'] = 'Nama penanggung jawab wajib diisi';
    }
    
    if (!formData.kontakPenanggungJawab.telepon || formData.kontakPenanggungJawab.telepon.trim() === '') {
      newErrors['kontakPenanggungJawab.telepon'] = 'Telepon penanggung jawab wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Run validation first
    if (!validateForm()) {
      return;
    }
    
    // Create clean data for submission
    const submissionData: FormData = {
      namaCabang: formData.namaCabang.trim(),
      divisiId: formData.divisiId,
      alamat: formData.alamat.trim(),
      kelurahan: formData.kelurahan.trim(),
      kecamatan: formData.kecamatan.trim(),
      kota: formData.kota.trim(),
      provinsi: formData.provinsi.trim(),
      kontakPenanggungJawab: {
        nama: formData.kontakPenanggungJawab.nama?.trim() || '',
        telepon: formData.kontakPenanggungJawab.telepon?.trim() || '',
        email: formData.kontakPenanggungJawab.email?.trim() || ''
      }
    };
    
    // Final validation for required contact fields
    if (!submissionData.kontakPenanggungJawab.nama) {
      console.error('Nama penanggung jawab masih kosong setelah validasi');
      setErrors(prev => ({
        ...prev,
        'kontakPenanggungJawab.nama': 'Nama penanggung jawab wajib diisi'
      }));
      return;
    }
    
    if (!submissionData.kontakPenanggungJawab.telepon) {
      console.error('Telepon penanggung jawab masih kosong setelah validasi');
      setErrors(prev => ({
        ...prev,
        'kontakPenanggungJawab.telepon': 'Telepon penanggung jawab wajib diisi'
      }));
      return;
    }
    
    // Save debug info
    setDebug({
      originalData: formData,
      submissionData: submissionData,
      hasKontakNama: !!submissionData.kontakPenanggungJawab.nama,
      hasKontakTelepon: !!submissionData.kontakPenanggungJawab.telepon,
      timestamp: new Date().toISOString()
    });
    
    console.log('Submitting branch data:', JSON.stringify(submissionData, null, 2));
    onSubmit(submissionData);
  };
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Branch Info Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informasi Cabang
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="namaCabang"
                label="Nama Cabang"
                value={formData.namaCabang}
                onChange={handleChange}
                fullWidth
                error={!!errors.namaCabang}
                helperText={errors.namaCabang}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="divisiId"
                select
                label="Divisi"
                value={formData.divisiId}
                onChange={handleChange}
                fullWidth
                error={!!errors.divisiId}
                helperText={errors.divisiId}
                required
              >
                {divisions.map((division) => (
                  <MenuItem key={division._id} value={division._id}>
                    {division.namaDivisi}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="alamat"
                label="Alamat"
                value={formData.alamat}
                onChange={handleChange}
                fullWidth
                error={!!errors.alamat}
                helperText={errors.alamat}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="kelurahan"
                label="Kelurahan"
                value={formData.kelurahan}
                onChange={handleChange}
                fullWidth
                error={!!errors.kelurahan}
                helperText={errors.kelurahan}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="kecamatan"
                label="Kecamatan"
                value={formData.kecamatan}
                onChange={handleChange}
                fullWidth
                error={!!errors.kecamatan}
                helperText={errors.kecamatan}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="kota"
                label="Kota"
                value={formData.kota}
                onChange={handleChange}
                fullWidth
                error={!!errors.kota}
                helperText={errors.kota}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="provinsi"
                label="Provinsi"
                value={formData.provinsi}
                onChange={handleChange}
                fullWidth
                error={!!errors.provinsi}
                helperText={errors.provinsi}
                required
              />
            </Grid>
            
            {/* Contact Person Section */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informasi Penanggung Jawab
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="nama"
                label="Nama Penanggung Jawab"
                value={formData.kontakPenanggungJawab.nama}
                onChange={handleKontakChange}
                fullWidth
                error={!!errors['kontakPenanggungJawab.nama']}
                helperText={errors['kontakPenanggungJawab.nama']}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="telepon"
                label="Telepon Penanggung Jawab"
                value={formData.kontakPenanggungJawab.telepon}
                onChange={handleKontakChange}
                fullWidth
                error={!!errors['kontakPenanggungJawab.telepon']}
                helperText={errors['kontakPenanggungJawab.telepon']}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email Penanggung Jawab"
                value={formData.kontakPenanggungJawab.email}
                onChange={handleKontakChange}
                fullWidth
                error={!!errors['kontakPenanggungJawab.email']}
                helperText={errors['kontakPenanggungJawab.email']}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : initialData ? 'Perbarui' : 'Simpan'}
            </Button>
          </Box>
        </form>
      </Paper>
      
      {debug && (
        <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle2">Debug Information</Typography>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(debug, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default BranchForm;