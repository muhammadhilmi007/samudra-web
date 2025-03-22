// src/pages/collection/index.tsx
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
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getCollections, getCollectionsByBranch, getCollectionsByStatus, generateInvoice, clearPDFUrl } from '../../store/slices/collectionSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { format } from 'date-fns';
import idLocale from 'date-fns/locale/id';
import withAuth from '../../components/auth/withAuth';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';

const CollectionPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Add default empty array for collections
  const { collections = [], pdfUrl, loading } = useSelector((state: RootState) => state.collection);
  const { branches = [] } = useSelector((state: RootState) => state.branch);
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
      dispatch(getCollectionsByBranch(branchFilter));
    } else if (statusFilter) {
      dispatch(getCollectionsByStatus(statusFilter as 'LUNAS' | 'BELUM LUNAS'));
    } else {
      dispatch(getCollections());
    }
  }, [dispatch, branchFilter, statusFilter]);
  
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
  
  const handleGenerateInvoice = (id: string) => {
    dispatch(generateInvoice(id));
  };
  
  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy', { locale: idLocale });
  };
  
  // Filter collections by search term
  // Update the filter function with safety check
  const filteredCollections = Array.isArray(collections) 
    ? collections.filter((collection) => {
        const searchLower = searchTerm.toLowerCase();
        const customerName = collection.pelanggan?.nama?.toLowerCase() || '';
        
        return (
          collection.noPenagihan.toLowerCase().includes(searchLower) ||
          customerName.includes(searchLower)
        );
      })
    : [];
  
  // Update calculation functions with safety checks
  const calculateTotalAmount = () => {
    return Array.isArray(filteredCollections)
      ? filteredCollections.reduce((total, collection) => total + collection.totalTagihan, 0)
      : 0;
  };
  
  const calculateTotalPaid = () => {
    return Array.isArray(filteredCollections)
      ? filteredCollections
          .filter((collection) => collection.status === 'LUNAS')
          .reduce((total, collection) => total + collection.totalTagihan, 0)
      : 0;
  };
  
  const calculateTotalUnpaid = () => {
    return Array.isArray(filteredCollections)
      ? filteredCollections
          .filter((collection) => collection.status === 'BELUM LUNAS')
          .reduce((total, collection) => total + collection.totalTagihan, 0)
      : 0;
  };
  
  // Get status chip color
  const getStatusColor = (status: string) => {
    return status === 'LUNAS' ? 'success' : 'warning';
  };
  
  // Paginated data
  const paginatedCollections = filteredCollections.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <>
      <Head>
        <title>Penagihan | Samudra ERP</title>
      </Head>
      
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" passHref>
            <MuiLink underline="hover" color="inherit">Dashboard</MuiLink>
          </Link>
          <Typography color="text.primary">Penagihan</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Manajemen Penagihan</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/collection/create')}
          >
            Buat Penagihan
          </Button>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Total Tagihan</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                Rp {calculateTotalAmount().toLocaleString('id-ID')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredCollections.length} Penagihan
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, backgroundColor: '#e8f5e9', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Total Terbayar</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main', my: 1 }}>
                Rp {calculateTotalPaid().toLocaleString('id-ID')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredCollections.filter(c => c.status === 'LUNAS').length} Penagihan Lunas
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, backgroundColor: '#fff8e1', height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">Total Belum Terbayar</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main', my: 1 }}>
                Rp {calculateTotalUnpaid().toLocaleString('id-ID')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredCollections.filter(c => c.status === 'BELUM LUNAS').length} Penagihan Belum Lunas
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
                label="Cari Penagihan"
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
                  <MenuItem value="LUNAS">Lunas</MenuItem>
                  <MenuItem value="BELUM LUNAS">Belum Lunas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  <TableCell>No. Penagihan</TableCell>
                  <TableCell>Pelanggan</TableCell>
                  <TableCell>Tipe Pelanggan</TableCell>
                  <TableCell>Total Tagihan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tanggal Dibuat</TableCell>
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
                ) : paginatedCollections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        Tidak ada data penagihan
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCollections.map((collection) => (
                    <TableRow key={collection._id} hover>
                      <TableCell>{collection.noPenagihan}</TableCell>
                      <TableCell>{collection.pelanggan?.nama || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={collection.tipePelanggan}
                          size="small"
                          color={collection.tipePelanggan === 'Pengirim' ? 'primary' : 'secondary'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        Rp {collection.totalTagihan.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={collection.status}
                          size="small"
                          color={getStatusColor(collection.status) as any}
                        />
                      </TableCell>
                      <TableCell>{formatDate(collection.createdAt)}</TableCell>
                      <TableCell>{collection.cabang?.namaCabang || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Lihat Detail">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/collection/${collection._id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cetak Invoice">
                          <IconButton
                            size="small"
                            onClick={() => handleGenerateInvoice(collection._id)}
                          >
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                        {collection.status === 'BELUM LUNAS' && (
                          <Tooltip title="Tambah Pembayaran">
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/collection/${collection._id}`)}
                              color="primary"
                            >
                              <MoneyIcon />
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
            count={filteredCollections.length}
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

export default withAuth(CollectionPage);