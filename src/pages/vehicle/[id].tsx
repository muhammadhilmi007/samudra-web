// src/pages/vehicle/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon,
  Contacts as ContactsIcon,
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from '../../store/slices/vehicleSlice';
import { getEmployeesByBranch } from '../../store/slices/employeeSlice';
import { getLoadingsByTruck } from '../../store/slices/loadingSlice';
import { getDeliveriesByVehicle } from '../../store/slices/deliverySlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { Vehicle, VehicleFormInputs } from '../../types/vehicle';
import withAuth from '../../components/auth/withAuth';
import VehicleForm from '../../components/vehicle/VehicleForm';
import LoadingList from '../../components/loading/LoadingList';
import DeliveryList from '../../components/delivery/DeliveryList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vehicle-tabpanel-${index}`}
      aria-labelledby={`vehicle-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const VehicleDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  const { vehicle } = useSelector((state: RootState) => state.vehicle);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { loadings } = useSelector((state: RootState) => state.loading);
  const { deliveries } = useSelector((state: RootState) => state.delivery);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  const [editMode, setEditMode] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(getVehicleById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (vehicle?.cabangId) {
      dispatch(getEmployeesByBranch(vehicle.cabangId));
    }
  }, [dispatch, vehicle?.cabangId]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      if (tabValue === 1 && vehicle?.tipe === 'Antar Cabang') {
        dispatch(getLoadingsByTruck(id));
      } else if (tabValue === 1 && vehicle?.tipe === 'Lansir') {
        dispatch(getDeliveriesByVehicle(id));
      }
    }
  }, [dispatch, id, tabValue, vehicle?.tipe]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleDeleteClick = () => {
    setConfirmDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (id && typeof id === 'string') {
      dispatch(deleteVehicle(id)).then(() => {
        router.push('/vehicle');
      });
    }
    setConfirmDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteDialog(false);
  };

  const handleUpdate = (data: VehicleFormInputs) => {
    if (id && typeof id === 'string') {
      const formData = new FormData();
      
      // Append all text fields
      formData.append('noPolisi', data.noPolisi);
      formData.append('namaKendaraan', data.namaKendaraan);
      formData.append('supirId', data.supirId);
      formData.append('noTeleponSupir', data.noTeleponSupir);
      formData.append('noKTPSupir', data.noKTPSupir);
      formData.append('alamatSupir', data.alamatSupir);
      formData.append('cabangId', data.cabangId);
      formData.append('tipe', data.tipe);
      
      if (data.grup) {
        formData.append('grup', data.grup);
      }
      
      if (data.kenekId) {
        formData.append('kenekId', data.kenekId);
      }
      
      if (data.noTeleponKenek) {
        formData.append('noTeleponKenek', data.noTeleponKenek);
      }
      
      if (data.noKTPKenek) {
        formData.append('noKTPKenek', data.noKTPKenek);
      }
      
      if (data.alamatKenek) {
        formData.append('alamatKenek', data.alamatKenek);
      }
      
      // Append file fields if present
      if (data.fotoKTPSupir && data.fotoKTPSupir instanceof File) {
        formData.append('fotoKTPSupir', data.fotoKTPSupir);
      }
      
      if (data.fotoSupir && data.fotoSupir instanceof File) {
        formData.append('fotoSupir', data.fotoSupir);
      }
      
      if (data.fotoKTPKenek && data.fotoKTPKenek instanceof File) {
        formData.append('fotoKTPKenek', data.fotoKTPKenek);
      }
      
      if (data.fotoKenek && data.fotoKenek instanceof File) {
        formData.append('fotoKenek', data.fotoKenek);
      }
      
      dispatch(updateVehicle({ id, vehicleData: formData }));
      setEditMode(false);
    }
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  // Filter employees to get drivers
  const drivers = employees.filter(employee => 
    employee.jabatan.toLowerCase().includes('supir') || 
    employee.jabatan.toLowerCase().includes('driver')
  );
  
  // Filter employees to get assistants
  const assistants = employees.filter(employee => 
    employee.jabatan.toLowerCase().includes('kenek') || 
    employee.jabatan.toLowerCase().includes('assistant')
  );

  if (loading && !vehicle) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!vehicle && !loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6">Kendaraan tidak ditemukan</Typography>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{vehicle?.namaKendaraan || 'Detail Kendaraan'} - Samudra ERP</title>
      </Head>

      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Detail Kendaraan</Typography>
        </Box>

        <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="vehicle tabs">
              <Tab label="Informasi" />
              <Tab label={vehicle?.tipe === 'Antar Cabang' ? 'Riwayat Muatan' : 'Riwayat Pengiriman'} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {editMode ? (
              <VehicleForm 
                initialData={vehicle as any} 
                onSubmit={handleUpdate} 
                onCancel={() => setEditMode(false)}
                drivers={drivers}
                assistants={assistants}
                loading={loading}
              />
            ) : (
              <Box>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditToggle}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteClick}
                  >
                    Hapus
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <DirectionsCarIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">Informasi Kendaraan</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Nama Kendaraan
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {vehicle?.namaKendaraan}
                          </Typography>
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Nomor Polisi
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {vehicle?.noPolisi}
                          </Typography>
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Tipe
                          </Typography>
                          <Chip 
                            label={vehicle?.tipe} 
                            color={vehicle?.tipe === 'Antar Cabang' ? 'primary' : 'success'} 
                            size="small" 
                          />
                        </Box>
                        
                        {vehicle?.grup && (
                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              Grup
                            </Typography>
                            <Typography variant="body1">
                              {vehicle.grup}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <PersonIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">Informasi Supir</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box display="flex" mb={2}>
                          {vehicle?.fotoSupir ? (
                            <Avatar 
                              src={vehicle.fotoSupir} 
                              alt={vehicle.supir?.nama || 'Supir'} 
                              sx={{ width: 60, height: 60, mr: 2 }} 
                            />
                          ) : (
                            <Avatar sx={{ width: 60, height: 60, mr: 2 }}>
                              <PersonIcon />
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {vehicle?.supir?.nama || 'Tidak tersedia'}
                            </Typography>
                            <Typography variant="body2">
                              Supir
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            No. Telepon
                          </Typography>
                          <Typography variant="body1">
                            {vehicle?.noTeleponSupir || '-'}
                          </Typography>
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            No. KTP
                          </Typography>
                          <Typography variant="body1">
                            {vehicle?.noKTPSupir || '-'}
                          </Typography>
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Alamat
                          </Typography>
                          <Typography variant="body1">
                            {vehicle?.alamatSupir || '-'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {vehicle?.kenekId && (
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={2}>
                            <PersonIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">Informasi Kenek</Typography>
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          
                          <Box display="flex" mb={2}>
                            {vehicle?.fotoKenek ? (
                              <Avatar 
                                src={vehicle.fotoKenek} 
                                alt={vehicle.kenek?.nama || 'Kenek'} 
                                sx={{ width: 60, height: 60, mr: 2 }} 
                              />
                            ) : (
                              <Avatar sx={{ width: 60, height: 60, mr: 2 }}>
                                <PersonIcon />
                              </Avatar>
                            )}
                            <Box>
                              <Typography variant="body1" fontWeight="bold">
                                {vehicle?.kenek?.nama || 'Tidak tersedia'}
                              </Typography>
                              <Typography variant="body2">
                                Kenek
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              No. Telepon
                            </Typography>
                            <Typography variant="body1">
                              {vehicle?.noTeleponKenek || '-'}
                            </Typography>
                          </Box>
                          
                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              No. KTP
                            </Typography>
                            <Typography variant="body1">
                              {vehicle?.noKTPKenek || '-'}
                            </Typography>
                          </Box>
                          
                          <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              Alamat
                            </Typography>
                            <Typography variant="body1">
                              {vehicle?.alamatKenek || '-'}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <ContactsIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">Informasi Tambahan</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Cabang
                          </Typography>
                          <Typography variant="body1">
                            {vehicle?.cabang?.namaCabang || '-'}
                          </Typography>
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Dibuat Pada
                          </Typography>
                          <Typography variant="body1">
                            {new Date(vehicle?.createdAt || '').toLocaleString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Terakhir Diperbarui
                          </Typography>
                          <Typography variant="body1">
                            {new Date(vehicle?.updatedAt || '').toLocaleString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {vehicle?.tipe === 'Antar Cabang' ? 'Riwayat Muatan' : 'Riwayat Pengiriman'}
            </Typography>
            
            {vehicle?.tipe === 'Antar Cabang' ? (
              loadings.length > 0 ? (
                <LoadingList loadings={loadings} loading={loading} />
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                  Belum ada riwayat muatan untuk kendaraan ini.
                </Typography>
              )
            ) : (
              deliveries.length > 0 ? (
                <DeliveryList deliveries={deliveries} loading={loading} />
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                  Belum ada riwayat pengiriman untuk kendaraan ini.
                </Typography>
              )
            )}
          </TabPanel>
        </Paper>
      </Box>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Konfirmasi Hapus
        </DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus kendaraan <strong>{vehicle?.namaKendaraan} ({vehicle?.noPolisi})</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Batal</Button>
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

export default withAuth(VehicleDetailPage);