// src/pages/loading/index.tsx
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
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getLoadings,
  getTruckQueues,
  getLoadingsByBranch
} from '../../store/slices/loadingSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import withAuth from '../../components/auth/withAuth';
import LoadingList from '../../components/loading/LoadingList';
import TruckQueueList from '../../components/loading/TruckQueueList';

const LoadingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { loadings, truckQueues } = useSelector((state: RootState) => state.loading);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string>(user?.cabangId || '');
  const [activeTab, setActiveTab] = useState<'loadings' | 'truckQueues'>('loadings');

  useEffect(() => {
    dispatch(getBranches());
    
    if (filterBranch) {
      dispatch(getLoadingsByBranch(filterBranch));
    } else {
      dispatch(getLoadings());
    }
    
    dispatch(getTruckQueues());
  }, [dispatch, filterBranch]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleBranchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterBranch(event.target.value as string);
  };

  const handleChangeTab = (tab: 'loadings' | 'truckQueues') => {
    setActiveTab(tab);
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  // Filter loadings based on search term
  const filteredLoadings = loadings.filter((loading) => {
    if (searchTerm) {
      // Search in STT numbers
      const sttsMatch = loading.stts?.some(stt => 
        stt.noSTT.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Search in vehicle/truck info
      const truckMatch = loading.antrianTruck?.truck?.noPolisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loading.antrianTruck?.truck?.namaKendaraan.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Search in ID
      const idMatch = loading.idMuat.toLowerCase().includes(searchTerm.toLowerCase());
      
      return sttsMatch || truckMatch || idMatch;
    }
    return true;
  });

  // Filter truck queues based on search term
  const filteredTruckQueues = truckQueues.filter((queue) => {
    if (searchTerm) {
      // Search in truck info
      const truckMatch = queue.truck?.noPolisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        queue.truck?.namaKendaraan.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Search in driver info
      const driverMatch = queue.supir?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        queue.noTelp.includes(searchTerm);
      
      return truckMatch || driverMatch;
    }
    return true;
  });

  return (
    <>
      <Head>
        <title>Manajemen Muatan - Samudra ERP</title>
      </Head>
      
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Manajemen Muatan</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            href="/loading/create"
          >
            Tambah Muatan
          </Button>
        </Box>

        <Paper sx={{ mb: 3, p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box display="flex" gap={2}>
                  <Button
                    variant={activeTab === 'loadings' ? 'contained' : 'outlined'}
                    onClick={() => handleChangeTab('loadings')}
                    startIcon={<LocalShippingIcon />}
                  >
                    Muatan
                  </Button>
                  <Button
                    variant={activeTab === 'truckQueues' ? 'contained' : 'outlined'}
                    onClick={() => handleChangeTab('truckQueues')}
                    startIcon={<FilterListIcon />}
                  >
                    Antrian Truk
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={2} alignItems="center" mb={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cari Muatan / Antrian"
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
            <Grid item xs={12} md={6}>
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
          </Grid>
        </Paper>

        {activeTab === 'loadings' ? (
          <LoadingList 
            loadings={filteredLoadings} 
            loading={loading} 
          />
        ) : (
          <TruckQueueList 
            truckQueues={filteredTruckQueues} 
            loading={loading} 
          />
        )}
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

export default withAuth(LoadingPage);