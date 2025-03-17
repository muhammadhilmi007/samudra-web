// src/pages/branch/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getBranchById, deleteBranch } from '../../store/slices/branchSlice';
import { getDivisions } from '../../store/slices/divisionSlice';
import { getEmployeesByBranch } from '../../store/slices/employeeSlice';
import { getCustomersByBranch } from '../../store/slices/customerSlice';
import { getVehiclesByBranch } from '../../store/slices/vehicleSlice';
import BranchForm from '../../components/branch/BranchForm';
import withAuth from '../../components/auth/withAuth';

const BranchDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  const { branch, loading: branchLoading } = useSelector((state: RootState) => state.branch);
  const { divisions } = useSelector((state: RootState) => state.division);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { customers } = useSelector((state: RootState) => state.customer);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Check if user has admin permissions
  const isAdmin = user?.role === 'admin' || user?.role === 'superAdmin' || user?.role === 'direktur';
  
  useEffect(() => {
    if (id) {
      dispatch(getBranchById(id as string));
      dispatch(getDivisions());
      dispatch(getEmployeesByBranch(id as string));
      dispatch(getCustomersByBranch(id as string));
      dispatch(getVehiclesByBranch(id as string));
    }
  }, [dispatch, id]);
  
  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  const handleDelete = async () => {
    if (id) {
      try {
        await dispatch(deleteBranch(id as string)).unwrap();
        router.push('/branch');
      } catch (error) {
        console.error('Failed to delete branch:', error);
      }
    }
    setOpenDeleteDialog(false);
  };
  
  if (branchLoading || !branch) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const divisionName = divisions.find(div => div._id === branch.divisiId)?.namaDivisi || 'Divisi tidak ditemukan';
  
  return (
    <>
      <Head>
        <title>{branch.namaCabang} - Detail Cabang | Samudra ERP</title>
      </Head>
      
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" passHref>
            <MuiLink underline="hover" color="inherit">Dashboard</MuiLink>
          </Link>
          <Link href="/branch" passHref>
            <MuiLink underline="hover" color="inherit">Cabang</MuiLink>
          </Link>
          <Typography color="text.primary">{branch.namaCabang}</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => router.push('/branch')}
              sx={{ mr: 2 }}
            >
              Kembali
            </Button>
            <Typography variant="h4">{branch.namaCabang}</Typography>
          </Box>
          
          {isAdmin && (
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />} 
                onClick={handleOpenEditDialog}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon />} 
                onClick={handleOpenDeleteDialog}
              >
                Hapus
              </Button>
            </Box>
          )}
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Informasi Cabang
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Nama Cabang</Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="body1">{branch.namaCabang}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">Divisi</Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Chip 
                    icon={<BusinessIcon />} 
                    label={divisionName} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Alamat</Typography>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <LocationOnIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                        <Typography variant="body1">
                          {branch.alamat}, {branch.kelurahan}, {branch.kecamatan}, {branch.kota}, {branch.provinsi}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Kontak Penanggung Jawab</Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {branch.kontakPenanggungJawab?.nama || 'Belum ada data'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {branch.kontakPenanggungJawab?.telepon || 'Belum ada data'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {branch.kontakPenanggungJawab?.email || 'Belum ada data'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Statistik Cabang
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">{employees.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Pegawai</Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">{customers.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Pelanggan</Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">{vehicles.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Kendaraan</Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">{vehicles.filter(v => v.tipe === 'Antar Cabang').length}</Typography>
                    <Typography variant="body2" color="text.secondary">Truck</Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Aktivitas Terbaru
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Belum ada data aktivitas terbaru
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Cabang</DialogTitle>
        <DialogContent>
          {branch && (
            <BranchForm 
              initialValues={branch} 
              onSubmit={() => handleCloseEditDialog()} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah anda yakin ingin menghapus cabang {branch.namaCabang}? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Batal</Button>
          <Button onClick={handleDelete} color="error">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default withAuth(BranchDetailPage);