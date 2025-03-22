// src/components/vehicle/VehicleDetail.tsx
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
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Edit as EditIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  BusinessCenter as BusinessIcon,
  DriveEta as TruckIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { getVehicleById } from '../../store/slices/vehicleSlice';
import StatusBadge from '../shared/StatusBadge';
import { Image } from 'lucide-react';

interface VehicleDetailProps {
  id: string;
  onEdit: () => void;
}

const VehicleDetail: React.FC<VehicleDetailProps> = ({ id, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicle, loading } = useSelector((state: RootState) => state.vehicle);
  const { branches } = useSelector((state: RootState) => state.branch);
  const [tabValue, setTabValue] = React.useState(0);

  useEffect(() => {
    if (id) {
      dispatch(getVehicleById(id));
    }
  }, [dispatch, id]);

  // Find branch name
  const branchName = React.useMemo(() => {
    if (!vehicle || !branches.length) return '-';
    const branch = branches.find(b => b._id === vehicle.cabangId);
    return branch ? branch.namaCabang : '-';
  }, [vehicle, branches]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading || !vehicle) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Vehicle Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {vehicle.namaKendaraan} ({vehicle.noPolisi})
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <StatusBadge 
                  status={vehicle.tipe} 
                  customColors={{
                    'Lansir': { color: '#2e7d32', backgroundColor: '#e8f5e9' },
                    'Antar Cabang': { color: '#0288d1', backgroundColor: '#e1f5fe' },
                  }}
                />
                <Chip 
                  icon={<BusinessIcon />} 
                  label={branchName} 
                  size="small" 
                  color="default" 
                  variant="outlined"
                />
                {vehicle.grup && (
                  <Chip 
                    icon={vehicle.tipe === 'Antar Cabang' ? <TruckIcon /> : <ShippingIcon />} 
                    label={`Grup: ${vehicle.grup}`} 
                    size="small" 
                    color="default" 
                    variant="outlined"
                  />
                )}
              </Box>
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
          
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Informasi Kendaraan" />
            <Tab label="Informasi Supir" />
            <Tab label="Informasi Kenek" />
          </Tabs>

          {/* Tab 1: Vehicle Info */}
          {tabValue === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <CarIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
                    Detail Kendaraan
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: '40%', fontWeight: 500 }}>
                            Nomor Polisi
                          </TableCell>
                          <TableCell>{vehicle.noPolisi}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>
                            Nama Kendaraan
                          </TableCell>
                          <TableCell>{vehicle.namaKendaraan}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>
                            Tipe
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={vehicle.tipe} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>
                            Cabang
                          </TableCell>
                          <TableCell>{branchName}</TableCell>
                        </TableRow>
                        {vehicle.grup && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>
                              Grup
                            </TableCell>
                            <TableCell>{vehicle.grup}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Informasi Tambahan
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: '40%', fontWeight: 500 }}>
                            ID Kendaraan
                          </TableCell>
                          <TableCell>{vehicle._id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>
                            Tanggal Dibuat
                          </TableCell>
                          <TableCell>
                            {new Date(vehicle.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>
                            Terakhir Diperbarui
                          </TableCell>
                          <TableCell>
                            {new Date(vehicle.updatedAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Tab 2: Driver Info */}
          {tabValue === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center"
                  p={2}
                >
                  {vehicle.fotoSupir ? (
                    <Avatar 
                      src={vehicle.fotoSupir} 
                      alt="Foto Supir" 
                      sx={{ width: 150, height: 150, mb: 2 }}
                    />
                  ) : (
                    <Avatar 
                      sx={{ width: 150, height: 150, mb: 2, bgcolor: 'primary.main' }}
                    >
                      <PersonIcon sx={{ fontSize: 80 }} />
                    </Avatar>
                  )}
                  <Typography variant="h6" align="center">
                    {vehicle.supirId || 'Belum Ada Supir'}
                  </Typography>
                  {vehicle.noTeleponSupir && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {vehicle.noTeleponSupir}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
                    Detail Supir
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: '30%', fontWeight: 500 }}>
                            Nama Supir
                          </TableCell>
                          <TableCell>{vehicle.supirId || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>
                            Nomor Telepon
                          </TableCell>
                          <TableCell>{vehicle.noTeleponSupir || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>
                            Nomor KTP
                          </TableCell>
                          <TableCell>{vehicle.noKTPSupir || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>
                            Alamat
                          </TableCell>
                          <TableCell>{vehicle.alamatSupir || '-'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {vehicle.fotoKTPSupir && (
                    <Box mt={3}>
                      <Typography variant="subtitle2" gutterBottom>
                        <BadgeIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
                        Foto KTP Supir
                      </Typography>
                      <img 
                        src={vehicle.fotoKTPSupir} 
                        alt="KTP Supir" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 200, 
                          objectFit: 'contain',
                          border: '1px solid #ddd',
                          borderRadius: 4
                        }} 
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Tab 3: Kenek Info */}
          {tabValue === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center"
                  p={2}
                >
                  {vehicle.fotoKenek ? (
                    <Avatar 
                      src={vehicle.fotoKenek} 
                      alt="Foto Kenek" 
                      sx={{ width: 150, height: 150, mb: 2 }}
                    />
                  ) : (
                    <Avatar 
                      sx={{ width: 150, height: 150, mb: 2, bgcolor: 'secondary.main' }}
                    >
                      <PersonIcon sx={{ fontSize: 80 }} />
                    </Avatar>
                  )}
                  <Typography variant="h6" align="center">
                    {vehicle.kenekId || 'Belum Ada Kenek'}
                  </Typography>
                  {vehicle.noTeleponKenek && (
                    <Box display="flex" alignItems="center" mt={1}>
                      <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {vehicle.noTeleponKenek}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
                    Detail Kenek
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: '30%', fontWeight: 500 }}>
                            Nama Kenek
                          </TableCell>
                          <TableCell>{vehicle.kenekId || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>
                            Nomor Telepon
                          </TableCell>
                          <TableCell>{vehicle.noTeleponKenek || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>
                            Nomor KTP
                          </TableCell>
                          <TableCell>{vehicle.noKTPKenek || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>
                            Alamat
                          </TableCell>
                          <TableCell>{vehicle.alamatKenek || '-'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {vehicle.fotoKTPKenek && (
                    <Box mt={3}>
                      <Typography variant="subtitle2" gutterBottom>
                        <BadgeIcon sx={{ mr: 1, verticalAlign: 'middle' }} fontSize="small" />
                        Foto KTP Kenek
                      </Typography>
                      <Image 
                        src={vehicle.fotoKTPKenek} 
                        alt="KTP Kenek" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 200, 
                          objectFit: 'contain',
                          border: '1px solid #ddd',
                          borderRadius: 4
                        }} 
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VehicleDetail;