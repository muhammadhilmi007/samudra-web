import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  MenuItem,
  Container,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Add as AddIcon,
  Search as SearchIcon,
  LocalShipping as LocalShippingIcon,
  FilterList as FilterListIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getLoadings,
  getTruckQueues
} from '../../store/slices/loadingSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { clearError, clearSuccess } from '../../store/slices/uiSlice';
import withAuth from '../../components/auth/withAuth';
import LoadingList from '../../components/loading/LoadingList';
import TruckQueueList from '../../components/loading/TruckQueueList';

const LoadingPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  
  const { loadings, truckQueues } = useSelector((state: RootState) => state.loading);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector((state: RootState) => state.ui);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string>(user?.cabangId || '');
  const [activeTab, setActiveTab] = useState<'loadings' | 'truckQueues'>('loadings');

  useEffect(() => {
    dispatch(getBranches());
    dispatch(getLoadings());
    dispatch(getTruckQueues());
  }, [dispatch]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleBranchFilter = (event: SelectChangeEvent) => {
    setFilterBranch(event.target.value as string);
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: 'loadings' | 'truckQueues') => {
    setActiveTab(newValue);
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  const filteredLoadings = Array.isArray(loadings) 
    ? loadings.filter((loading) => {
        if (searchTerm) {
          const sttsMatch = loading.stts?.some(stt => 
            stt.noSTT.toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          const truckMatch = loading.antrianTruck?.truck?.noPolisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loading.antrianTruck?.truck?.namaKendaraan.toLowerCase().includes(searchTerm.toLowerCase());
          
          const idMatch = loading.idMuat.toLowerCase().includes(searchTerm.toLowerCase());
          
          return sttsMatch || truckMatch || idMatch;
        }
        return true;
      })
    : [];

  const filteredTruckQueues = Array.isArray(truckQueues)
    ? truckQueues.filter((queue) => {
        if (searchTerm) {
          const truckMatch = queue.truck?.noPolisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            queue.truck?.namaKendaraan.toLowerCase().includes(searchTerm.toLowerCase());
          
          const driverMatch = queue.supir?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            queue.noTelp.includes(searchTerm);
          
          return truckMatch || driverMatch;
        }
        return true;
      })
    : [];

  return (
    <>
      <Head>
        <title>Manajemen Muatan - Samudra ERP</title>
      </Head>
      
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          pt: 3,
          pb: 6,
        }}
      >
        <Container maxWidth="xl">
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '150px',
                height: '150px',
                opacity: 0.1,
                transform: 'translate(30%, -30%)',
                background: `radial-gradient(circle, ${theme.palette.common.white} 0%, transparent 70%)`,
                borderRadius: '50%',
              }}
            />
            
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocalShippingIcon sx={{ fontSize: 40 }} />
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{ textShadow: '0px 2px 4px rgba(0,0,0,0.2)' }}
                  >
                    Manajemen Muatan
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ mt: 1, maxWidth: '600px', opacity: 0.9 }}>
                  Kelola semua proses muatan dan antrian truk dengan mudah dalam satu dashboard terintegrasi.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  startIcon={<AddIcon />}
                  component={Link}
                  href="/loading/create"
                  sx={{ 
                    borderRadius: 3,
                    px: 3,
                    py: 1.2,
                    fontWeight: 'bold',
                    boxShadow: theme.shadows[8],
                    backgroundColor: theme.palette.common.white,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.9),
                      boxShadow: theme.shadows[12],
                    }
                  }}
                >
                  Tambah Muatan
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Card 
            elevation={2} 
            sx={{ 
              mb: 4, 
              borderRadius: 3,
              overflow: 'visible',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Tabs
                value={activeTab}
                onChange={handleChangeTab}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
                sx={{ 
                  mb: 0,
                  '& .MuiTab-root': {
                    py: 2.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }
                }}
              >
                <Tab 
                  value="loadings" 
                  label="Muatan" 
                  icon={<LocalShippingIcon />} 
                  iconPosition="start"
                  sx={{ 
                    fontSize: '1rem', 
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                />
                <Tab 
                  value="truckQueues" 
                  label="Antrian Truk" 
                  icon={<FilterListIcon />} 
                  iconPosition="start"
                  sx={{ 
                    fontSize: '1rem', 
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                />
              </Tabs>

              <Divider />

              <Box sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cari Muatan / Antrian"
                      placeholder={activeTab === 'loadings' ? "No. STT, Polisi, Kendaraan..." : "No. Polisi, Supir, No. Telepon..."}
                      variant="outlined"
                      value={searchTerm}
                      onChange={handleSearch}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: theme.palette.background.paper,
                          '&:hover': {
                            '& > fieldset': {
                              borderColor: theme.palette.primary.main,
                            }
                          }
                        }
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
                        sx={{ 
                          borderRadius: 2,
                          backgroundColor: theme.palette.background.paper,
                          '&:hover': {
                            '& > fieldset': {
                              borderColor: theme.palette.primary.main,
                            }
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>Semua Cabang</em>
                        </MenuItem>
                        {Array.isArray(branches) && branches
                          .filter(branch => branch._id && branch._id.trim() !== '')
                          .map((branch) => (
                            <MenuItem key={branch._id} value={branch._id}>
                              {branch.namaCabang}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ position: 'relative' }}>
            {loading && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  zIndex: 10,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 3,
                }}
              >
                <Typography variant="h6" color="primary">
                  Memuat data...
                </Typography>
              </Box>
            )}

            <Card 
              elevation={2} 
              sx={{ 
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: theme.shadows[8],
                }
              }}
            >
              <Box sx={{ p: 0 }}>
                {activeTab === 'loadings' ? (
                  <LoadingList 
                    branchFilter={filterBranch}
                    statusFilter="all"
                    createOnly={false}
                  />
                ) : (
                  <TruckQueueList 
                    truckQueues={filteredTruckQueues} 
                    loading={loading} 
                  />
                )}
              </Box>
            </Card>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Data terakhir diperbarui: {new Date().toLocaleString()}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Snackbar 
        open={!!error || !!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'} 
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: theme.shadows[6],
          }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default withAuth(LoadingPage);