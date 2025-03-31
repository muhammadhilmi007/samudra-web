import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getEmployeeById } from '../../store/slices/employeeSlice';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Box,
  Avatar,
  Chip,
  Button,
  Link,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  Badge as BadgeIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

interface EmployeeDetailProps {
  employeeId: string;
  onEdit?: () => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employeeId, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedEmployee, loading } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch employee data if not already in state
  useEffect(() => {
    if (!selectedEmployee || selectedEmployee._id !== employeeId) {
      dispatch(getEmployeeById(employeeId));
    }
  }, [dispatch, employeeId, selectedEmployee]);

  // Check if user can edit this employee
  const canEdit = user && (
    user.role === 'direktur' ||
    user.role === 'manajer_admin' ||
    user.role === 'manajer_sdm' ||
    (user.role === 'kepala_cabang' && 
     selectedEmployee?.cabangId && 
     (typeof selectedEmployee.cabangId === 'string' ? 
       selectedEmployee.cabangId === user.cabangId :
       selectedEmployee.cabangId._id === user.cabangId)) ||
    selectedEmployee?._id === user._id // User can edit own data
  );

  if (loading || !selectedEmployee) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Formatting data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card elevation={0}>
      <CardContent>
        <Grid container spacing={4}>
          {/* Left column: Profile picture and basic info */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Avatar
                alt={selectedEmployee.nama}
                src={selectedEmployee.fotoProfil || '/default-avatar.png'}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              <Typography variant="h5" gutterBottom textAlign="center">
                {selectedEmployee.nama}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom textAlign="center">
                {selectedEmployee.jabatan}
              </Typography>
              <Chip
                label={selectedEmployee.aktif ? 'Aktif' : 'Nonaktif'}
                color={selectedEmployee.aktif ? 'success' : 'error'}
                size="small"
                sx={{ mt: 1 }}
              />
              
              {/* Edit button */}
              {canEdit && onEdit && (
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />} 
                  sx={{ mt: 2 }}
                  onClick={onEdit}
                  size="small"
                >
                  Edit
                </Button>
              )}
            </Box>

            <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                <PersonIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Login Details
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" gutterBottom>
                <strong>Username:</strong> {selectedEmployee.username}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ wordBreak: 'break-word' }}>
                <strong>Last Login:</strong> {selectedEmployee.lastLogin ? formatDate(selectedEmployee.lastLogin) : 'Belum pernah login'}
              </Typography>
            </Paper>

            {/* Documents section */}
            {(selectedEmployee.dokumen?.ktp || selectedEmployee.dokumen?.npwp) && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  <BadgeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Dokumen
                </Typography>
                <Divider sx={{ my: 1 }} />
                {selectedEmployee.dokumen?.ktp && (
                  <Box mt={1}>
                    <Link href={selectedEmployee.dokumen.ktp} target="_blank" rel="noopener">
                      <Button size="small" variant="text" startIcon={<BadgeIcon />}>
                        Lihat KTP
                      </Button>
                    </Link>
                  </Box>
                )}
                {selectedEmployee.dokumen?.npwp && (
                  <Box mt={1}>
                    <Link href={selectedEmployee.dokumen.npwp} target="_blank" rel="noopener">
                      <Button size="small" variant="text" startIcon={<BadgeIcon />}>
                        Lihat NPWP
                      </Button>
                    </Link>
                  </Box>
                )}
              </Paper>
            )}
          </Grid>

          {/* Right column: Detailed information */}
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informasi Pegawai
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <WorkIcon color="action" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Jabatan
                      </Typography>
                      <Typography variant="body1">
                        {selectedEmployee.jabatan}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon color="action" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Role
                      </Typography>
                      <Typography variant="body1">
                        {typeof selectedEmployee.roleId === 'string' 
                          ? selectedEmployee.role || '-'
                          : selectedEmployee.roleId?.namaRole || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <BusinessIcon color="action" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Cabang
                      </Typography>
                      <Typography variant="body1">
                        {typeof selectedEmployee.cabangId === 'string'
                          ? '-'
                          : selectedEmployee.cabangId?.namaCabang || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <HomeIcon color="action" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Alamat
                      </Typography>
                      <Typography variant="body1">
                        {selectedEmployee.alamat}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <EmailIcon color="action" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {selectedEmployee.email || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PhoneIcon color="action" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Telepon
                      </Typography>
                      <Typography variant="body1">
                        {selectedEmployee.telepon}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* System information */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informasi Sistem
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Dibuat pada
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedEmployee.createdAt)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Terakhir diperbarui
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedEmployee.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EmployeeDetail;