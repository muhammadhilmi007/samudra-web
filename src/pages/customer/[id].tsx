// src/pages/customer/[id].tsx
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../../store/slices/customerSlice';
import { getSTTsByCustomer } from '../../store/slices/sttSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import { Customer, CustomerFormInputs } from '../../types/customer';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import withAuth from '../../components/auth/withAuth';
import CustomerForm from '../../components/customer/CustomerForm';
import STTList from '../../components/stt/STTList';

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
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const CustomerDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  const { selectedCustomer } = useSelector((state: RootState) => state.customer);
  const { sttList } = useSelector((state: RootState) => state.stt);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  const [editMode, setEditMode] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(getCustomerById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && typeof id === 'string' && tabValue === 1) {
      dispatch(getSTTsByCustomer(id));
    }
  }, [dispatch, id, tabValue]);

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
      dispatch(deleteCustomer(id)).then(() => {
        router.push('/customer');
      });
    }
    setConfirmDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteDialog(false);
  };

  const handleUpdate = (data: CustomerFormInputs) => {
    if (id && typeof id === 'string') {
      dispatch(updateCustomer({ id, customerData: data }));
      setEditMode(false);
    }
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

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

  if (loading && !selectedCustomer) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedCustomer && !loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography variant="h6">Customer tidak ditemukan</Typography>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{selectedCustomer?.nama || 'Detail Customer'} - Samudra ERP</title>
      </Head>

      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Detail Customer</Typography>
        </Box>

        <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer tabs">
              <Tab label="Informasi" />
              <Tab label="Riwayat Pengiriman" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {editMode ? (
              <CustomerForm
                initialData={selectedCustomer || undefined}
                onSubmit={handleUpdate}
                onCancel={() => setEditMode(false)}
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
                          <PersonIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">Informasi Pelanggan</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Nama
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {selectedCustomer?.nama}
                          </Typography>
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Tipe
                          </Typography>
                          <Chip
                            label={selectedCustomer?.tipe}
                            color={getCustomerTypeColor(selectedCustomer?.tipe || '') as any}
                            size="small"
                          />
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Cabang
                          </Typography>
                          <Typography variant="body1">
                            {branches.find(branch => branch._id === selectedCustomer?.cabangId)?.namaCabang || '-'}
                          </Typography>
                        </Box>
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Perusahaan
                          </Typography>
                          <Typography variant="body1">
                            {selectedCustomer?.perusahaan || '-'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <LocationOnIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">Alamat & Kontak</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Alamat Lengkap
                          </Typography>
                          <Typography variant="body1">
                            {selectedCustomer?.alamat}
                          </Typography>
                          <Typography variant="body2">
                            {`${selectedCustomer?.kelurahan}, ${selectedCustomer?.kecamatan}`}
                          </Typography>
                          <Typography variant="body2">
                            {`${selectedCustomer?.kota}, ${selectedCustomer?.provinsi}`}
                          </Typography>
                        </Box>
                        
                        <Box mb={2} display="flex" alignItems="center">
                          <PhoneIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                          <Typography variant="body1">
                            {selectedCustomer?.telepon}
                          </Typography>
                        </Box>
                        
                        {selectedCustomer?.email && (
                          <Box mb={2} display="flex" alignItems="center">
                            <EmailIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                            <Typography variant="body1">
                              {selectedCustomer.email}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <BusinessIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">Informasi Tambahan</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary">
                            Dibuat Pada
                          </Typography>
                          <Typography variant="body1">
                            {new Date(selectedCustomer?.createdAt || '').toLocaleString('id-ID', {
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
                            {new Date(selectedCustomer?.updatedAt || '').toLocaleString('id-ID', {
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
              Riwayat Pengiriman
            </Typography>
            {sttList && sttList.length > 0 ? (
              <STTList
                sttList={sttList}
                loading={loading}
                createOnly={false}
              />
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                Belum ada riwayat pengiriman untuk customer ini.
              </Typography>
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
            Apakah Anda yakin ingin menghapus customer <strong>{selectedCustomer?.nama}</strong>?
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

export default withAuth(CustomerDetailPage);