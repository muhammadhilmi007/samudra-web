// src/pages/return/index.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  AssignmentReturn as AssignmentReturnIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getReturns,
  getReturnsByBranch
} from '../../store/slices/returnSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import withAuth from '../../components/auth/withAuth';
import ReturnList from '../../components/return/ReturnList';

const ReturnPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { returns } = useSelector((state: RootState) => state.return);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string>(user?.cabangId || '');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    dispatch(getBranches());
    
    if (filterBranch) {
      dispatch(getReturnsByBranch(filterBranch));
    } else {
      dispatch(getReturns());
    }
  }, [dispatch, filterBranch]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleBranchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterBranch(event.target.value as string);
  };

  const handleStatusFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterStatus(event.target.value as string);
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  // Filter returns based on search term and filters
  const filteredReturns = Array.isArray(returns) ? returns.filter((returnItem) => {
    // Filter logic remains the same
    if (filterStatus && returnItem.status !== filterStatus) {
      return false;
    }
    
    if (searchTerm) {
      const idMatch = returnItem.idRetur.toLowerCase().includes(searchTerm.toLowerCase());
      const sttsMatch = returnItem.stts?.some(stt => 
        stt.noSTT.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return idMatch || sttsMatch;
    }
    return true;
  }) : [];

  return (
    <>
      <Head>
        <title>Manajemen Retur - Samudra ERP</title>
      </Head>
      
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Manajemen Retur</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            href="/return/create"
          >
            Tambah Retur
          </Button>
        </Box>

        <Paper sx={{ mb: 3, p: 2 }}>
          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cari Retur"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="branch-filter-label">Cabang</InputLabel>
                <Select
                  labelId="branch-filter-label"
                  value={filterBranch}
                  label="Cabang"
                  onChange={handleBranchFilter}
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
                  value={filterStatus}
                  label="Status"
                  onChange={handleStatusFilter}
                >
                  <MenuItem value="">Semua Status</MenuItem>
                  <MenuItem value="PROSES">PROSES</MenuItem>
                  <MenuItem value="SAMPAI">SAMPAI</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <ReturnList 
          returns={filteredReturns} 
          loading={loading} 
        />
      </Box>

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

export default withAuth(ReturnPage);