// src/pages/delivery/index.tsx
import React, { useEffect, useState } from 'react';
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
  Chip,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  FilterList as FilterListIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getDeliveries, getDeliveriesByBranch, generateDeliveryForm, clearPDFUrl } from '../../store/slices/deliverySlice';
import { getBranches } from '../../store/slices/branchSlice';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import withAuth from '../../components/auth/withAuth';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';

const DeliveryPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { deliveries, pdfUrl, loading } = useSelector((state: RootState) => state.delivery);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);
  const { error, success } = useSelector((state: RootState) => state.ui);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>(user?.cabangId || '');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  useEffect(() => {
    dispatch(getBranches());
    if (branchFilter) {
      dispatch(getDeliveriesByBranch(branchFilter));
    } else {
      dispatch(getDeliveries());
    }
  }, [dispatch, branchFilter]);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      dispatch(clearPDFUrl());
    };
  }, [dispatch]);
  
  useEffect(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl]);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleCloseAlert = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };
  
  const handleGenerateForm = (id: string) => {
    dispatch(generateDeliveryForm(id));
  };
  
  // Format the date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy HH:mm', { locale: idLocale });
  };
  
  // Filter deliveries by search term and status
  const filteredDeliveries = Array.isArray(deliveries) ? deliveries.filter((delivery) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      delivery.idLansir.toLowerCase().includes(searchLower) ||
      (delivery.checker?.nama?.toLowerCase() || '').includes(searchLower) ||
      (delivery.antrianKendaraan?.kendaraan?.noPolisi?.toLowerCase() || '').includes(searchLower);
    
    const matchesStatus = statusFilter ? delivery.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  }) : [];
  
  // Get status chip color
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'LANSIR':
        return 'info';
      case 'TERKIRIM':
        return 'success';
      case 'BELUM SELESAI':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Paginated data
  const paginatedDeliveries = filteredDeliveries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <>
      <Head>
        <title>Pengiriman | Samudra ERP</title>
      </Head>
      
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" passHref>
            <MuiLink underline="hover" color="inherit">Dashboard</MuiLink>
          </Link>
          <Typography color="text.primary">Pengiriman</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Manajemen Pengiriman</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/delivery/create')}
          >
            Buat Pengiriman
          </Button>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Total Pengiriman</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                {Array.isArray(deliveries) ? deliveries.length : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pengiriman
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, backgroundColor: '#e8f5e9', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Pengiriman Selesai</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', my: 1 }}>
              {Array.isArray(deliveries) ? deliveries.filter(d => d.status === 'TERKIRIM').length : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Terkirim
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, backgroundColor: '#fff8e1', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Pengiriman Dalam Proses</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main', my: 1 }}>
                {Array.isArray(deliveries) ? deliveries.filter(d => d.status === 'LANSIR' || d.status === 'BELUM SELESAI').length : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sedang Berlangsung
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                label="Cari Pengiriman"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="branch-filter-label">Cabang</InputLabel>
                <Select
                  labelId="branch-filter-label"
                  value={branchFilter}
                  label="Cabang"
                  onChange={(e) => setBranchFilter(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  }
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Semua Status</MenuItem>
                  <MenuItem value="LANSIR">Lansir</MenuItem>
                  <MenuItem value="TERKIRIM">Terkirim</MenuItem>
                  <MenuItem value="BELUM SELESAI">Belum Selesai</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID Lansir</TableCell>
                  <TableCell>Kendaraan</TableCell>
                  <TableCell>Supir</TableCell>
                  <TableCell>Jumlah STT</TableCell>
                  <TableCell>Waktu Berangkat</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Cabang</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress size={40} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : paginatedDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        Tidak ada data pengiriman
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDeliveries.map((delivery) => (
                    <TableRow key={delivery._id} hover>
                      <TableCell>{delivery.idLansir}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CarIcon sx={{ fontSize: 'small', mr: 1, color: 'text.secondary' }} />
                          {delivery.antrianKendaraan?.kendaraan?.namaKendaraan || 'N/A'}
                          <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                            ({delivery.antrianKendaraan?.kendaraan?.noPolisi || 'N/A'})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ fontSize: 'small', mr: 1, color: 'text.secondary' }} />
                          {delivery.antrianKendaraan?.supir?.nama || 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {delivery.sttIds?.length || 0}
                      </TableCell>
                      <TableCell>{formatDate(delivery.berangkat)}</TableCell>
                      <TableCell>
                        <Chip
                          label={delivery.status}
                          size="small"
                          color={getStatusColor(delivery.status)}
                        />
                      </TableCell>
                      <TableCell>{delivery.cabang?.namaCabang || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Lihat Detail">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/delivery/${delivery._id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cetak Form">
                          <IconButton
                            size="small"
                            onClick={() => handleGenerateForm(delivery._id)}
                          >
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                        {delivery.status !== 'TERKIRIM' && (
                          <Tooltip title="Update Status">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/delivery/${delivery._id}`)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
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
            count={filteredDeliveries.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar open={!!error || !!success} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert 
          onClose={handleCloseAlert} 
          severity={error ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default withAuth(DeliveryPage);