// src/components/branch/BranchDetail.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { getBranchById } from '../../store/slices/branchSlice';
import { getEmployeesByBranch } from '../../store/slices/employeeSlice';
import { getVehiclesByBranch } from '../../store/slices/vehicleSlice';

interface BranchDetailProps {
  id: string;
  onEdit: () => void;
}

const BranchDetail: React.FC<BranchDetailProps> = ({ id, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branch, loading } = useSelector((state: RootState) => state.branch);
  const { divisions } = useSelector((state: RootState) => state.division);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);

  useEffect(() => {
    if (id) {
      dispatch(getBranchById(id));
      dispatch(getEmployeesByBranch(id));
      dispatch(getVehiclesByBranch(id));
    }
  }, [dispatch, id]);

  // Find division name
  const divisionName = React.useMemo(() => {
    if (!branch || !divisions.length) return '-';
    const division = divisions.find(div => div._id === branch.divisiId);
    return division ? division.namaDivisi : '-';
  }, [branch, divisions]);

  if (loading || !branch) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Branch Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {branch.namaCabang}
              </Typography>
              <Chip 
                icon={<BusinessIcon />} 
                label={divisionName} 
                size="small" 
                color="primary" 
                variant="outlined" 
                sx={{ mr: 1 }}
              />
            </Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEdit}
            >
              Edit
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            {/* Location Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
                Informasi Lokasi
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Alamat Lengkap
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {branch.alamat}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Kelurahan
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {branch.kelurahan}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Kecamatan
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {branch.kecamatan}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Kota
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {branch.kota}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Provinsi
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {branch.provinsi}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Contact Person */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
                Penanggung Jawab
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Nama
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body2">
                    {branch.kontakPenanggungJawab?.nama || '-'}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Telepon
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Box display="flex" alignItems="center">
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {branch.kontakPenanggungJawab?.telepon || '-'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Box display="flex" alignItems="center">
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {branch.kontakPenanggungJawab?.email || '-'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                ID Cabang
              </Typography>
              <Typography variant="body1">
                {branch._id}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Tanggal Dibuat
              </Typography>
              <Typography variant="body1">
                {new Date(branch.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Terakhir Diperbarui
              </Typography>
              <Typography variant="body1">
                {new Date(branch.updatedAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Branch Employees Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pegawai ({employees.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {employees.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nama</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Jabatan</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Telepon</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.slice(0, 5).map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell>{employee.nama}</TableCell>
                      <TableCell>{employee.jabatan}</TableCell>
                      <TableCell>{employee.telepon}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" color="text.secondary" align="center" py={3}>
              Tidak ada pegawai di cabang ini
            </Typography>
          )}
          
          {employees.length > 5 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Button variant="text" size="small">
                Lihat semua {employees.length} pegawai
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Branch Vehicles Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Kendaraan ({vehicles.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {vehicles.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>No. Polisi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nama Kendaraan</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipe</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Supir</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicles.slice(0, 5).map((vehicle) => (
                    <TableRow key={vehicle._id}>
                      <TableCell>{vehicle.noPolisi}</TableCell>
                      <TableCell>{vehicle.namaKendaraan}</TableCell>
                      <TableCell>{vehicle.tipe}</TableCell>
                      <TableCell>{vehicle.supirId || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" color="text.secondary" align="center" py={3}>
              Tidak ada kendaraan di cabang ini
            </Typography>
          )}
          
          {vehicles.length > 5 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Button variant="text" size="small">
                Lihat semua {vehicles.length} kendaraan
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BranchDetail;