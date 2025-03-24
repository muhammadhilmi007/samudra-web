// src/components/customer/CustomerDetail.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  LocalShipping as LocalShippingIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getCustomerById,
  getCustomerCollections,
  getCustomerPickups,
  clearCustomerRelatedData,
} from '../../store/slices/customerSlice';
import { getSTTsByCustomer } from '../../store/slices/sttSlice';
import { useRouter } from 'next/router';
import { CustomerSTT, CustomerCollection, CustomerPickup } from '../../types/customer';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface CustomerDetailProps {
  customerId: string;
  onEdit: () => void;
  onBack: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customerId,
  onEdit,
  onBack,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { selectedCustomer, customerSTTs, customerCollections, customerPickups } =
    useSelector((state: RootState) => state.customer);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { loading } = useSelector((state: RootState) => state.ui);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (customerId) {
      dispatch(getCustomerById(customerId));
    }
    
    // Cleanup when component unmounts
    return () => {
      dispatch(clearCustomerRelatedData());
    };
  }, [dispatch, customerId]);

  // Load related data based on active tab
  useEffect(() => {
    if (customerId) {
      switch (tabValue) {
        case 0: // Info tab - no need to load anything
          break;
        case 1: // STT tab
          dispatch(getSTTsByCustomer(customerId));
          break;
        case 2: // Collections tab
          dispatch(getCustomerCollections(customerId));
          break;
        case 3: // Pickups tab
          dispatch(getCustomerPickups(customerId));
          break;
      }
    }
  }, [dispatch, customerId, tabValue]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get customer type chip color
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

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status chip color
  const getStatusColor = (status?: string) => {
    if (!status) return 'default';
    
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'default';
      case 'MUAT':
        return 'primary';
      case 'TRANSIT':
        return 'info';
      case 'LANSIR':
        return 'warning';
      case 'TERKIRIM':
        return 'success';
      case 'RETURN':
        return 'error';
      case 'LUNAS':
        return 'success';
      case 'BELUM LUNAS':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get branch name by ID
  const getBranchName = (branchId?: string) => {
    if (!branchId) return '-';
    const branch = branches.find((b) => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };

  // Navigate to STT detail
  const handleSTTClick = (sttId: string) => {
    router.push(`/stt/${sttId}`);
  };

  // Navigate to collection detail
  const handleCollectionClick = (collectionId: string) => {
    router.push(`/collection/${collectionId}`);
  };

  // Navigate to pickup detail
  const handlePickupClick = (pickupId: string) => {
    router.push(`/pickup/${pickupId}`);
  };

  // Handle download PDF
  const handleDownloadPDF = (type: string, id: string) => {
    switch (type) {
      case 'stt':
        // dispatch(generateSTTPDF(id));
        break;
      case 'collection':
        // dispatch(generateInvoicePDF(id));
        break;
      default:
        break;
    }
  };

  if (loading && !selectedCustomer) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedCustomer && !loading) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="error">
          Data pelanggan tidak ditemukan
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Kembali
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Kembali
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={onEdit}
          color="primary"
        >
          Edit
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
              <Typography variant="h5">{selectedCustomer?.nama}</Typography>
              <Chip
                label={selectedCustomer?.tipe}
                color={getCustomerTypeColor(selectedCustomer?.tipe ?? '') as any}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            {selectedCustomer?.perusahaan && (
              <Box display="flex" alignItems="center" mb={2}>
                <BusinessIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">{selectedCustomer?.perusahaan}</Typography>
              </Box>
            )}
            <Box display="flex" alignItems="center" mb={2}>
              <PhoneIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{selectedCustomer?.telepon ?? '-'}</Typography>
            </Box>
            {selectedCustomer?.email && (
              <Box display="flex" alignItems="center" mb={2}>
                <EmailIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">{selectedCustomer?.email}</Typography>
              </Box>
            )}
            <Box display="flex" alignItems="flex-start" mb={2}>
              <HomeIcon color="action" sx={{ mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="body1">
                  {selectedCustomer?.alamat ?? '-'}, {selectedCustomer?.kelurahan ?? '-'}, {selectedCustomer?.kecamatan ?? '-'}
                </Typography>
                <Typography variant="body1">
                  {selectedCustomer?.kota ?? '-'}, {selectedCustomer?.provinsi ?? '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Informasi Tambahan
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  ID Pelanggan
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedCustomer?._id ?? '-'}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Cabang
                </Typography>
                <Typography variant="body2">
                  {getBranchName(selectedCustomer?.cabangId)}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Dibuat Pada
                </Typography>
                <Typography variant="body2">
                  {formatDate(selectedCustomer?.createdAt)}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Terakhir Diupdate
                </Typography>
                <Typography variant="body2">
                  {formatDate(selectedCustomer?.updatedAt)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="customer tabs"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<PersonIcon />} label="Informasi" iconPosition="start" />
            <Tab icon={<ReceiptIcon />} label="STT" iconPosition="start" />
            <Tab icon={<AttachMoneyIcon />} label="Penagihan" iconPosition="start" />
            <Tab icon={<LocalShippingIcon />} label="Pengambilan" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Informasi Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Ringkasan Pelanggan</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body1">
                    <strong>Nama:</strong> {selectedCustomer?.nama ?? '-'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Tipe:</strong> {selectedCustomer?.tipe ?? '-'}
                  </Typography>
                  {selectedCustomer?.perusahaan && (
                    <Typography variant="body1">
                      <strong>Perusahaan:</strong> {selectedCustomer?.perusahaan}
                    </Typography>
                  )}
                  <Typography variant="body1">
                    <strong>Telepon:</strong> {selectedCustomer?.telepon ?? '-'}
                  </Typography>
                  {selectedCustomer?.email && (
                    <Typography variant="body1">
                      <strong>Email:</strong> {selectedCustomer?.email}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Alamat Lengkap</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body1">
                    <strong>Alamat:</strong> {selectedCustomer?.alamat ?? '-'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Kelurahan:</strong> {selectedCustomer?.kelurahan ?? '-'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Kecamatan:</strong> {selectedCustomer?.kecamatan ?? '-'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Kota:</strong> {selectedCustomer?.kota ?? '-'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Provinsi:</strong> {selectedCustomer?.provinsi ?? '-'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* STT Tab */}
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : customerSTTs && customerSTTs.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>No. STT</TableCell>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Pengirim</TableCell>
                    <TableCell>Penerima</TableCell>
                    <TableCell>Barang</TableCell>
                    <TableCell>Berat</TableCell>
                    <TableCell align="right">Harga</TableCell>
                    <TableCell>Pembayaran</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerSTTs.map((stt: CustomerSTT) => (
                    <TableRow
                      key={stt._id}
                      hover
                      onClick={() => handleSTTClick(stt._id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{stt.noSTT}</TableCell>
                      <TableCell>{formatDate(stt.createdAt)}</TableCell>
                      <TableCell>{stt.pengirim?.nama || '-'}</TableCell>
                      <TableCell>{stt.penerima?.nama || '-'}</TableCell>
                      <TableCell>{stt.namaBarang}</TableCell>
                      <TableCell>{stt.berat} kg</TableCell>
                      <TableCell align="right">{formatCurrency(stt.harga)}</TableCell>
                      <TableCell>
                        <Chip label={stt.paymentType} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stt.status}
                          color={getStatusColor(stt.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Lihat Detail">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleSTTClick(stt._id);
                          }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF('stt', stt._id);
                          }}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" p={4}>
              <Typography variant="body1" color="text.secondary">
                Tidak ada data STT untuk pelanggan ini
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Billing Tab */}
        <TabPanel value={tabValue} index={2}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : customerCollections && customerCollections.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>No. Penagihan</TableCell>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Jumlah STT</TableCell>
                    <TableCell align="right">Total Tagihan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tanggal Bayar</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerCollections.map((collection: CustomerCollection) => (
                    <TableRow
                      key={collection._id}
                      hover
                      onClick={() => handleCollectionClick(collection._id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{collection.noPenagihan}</TableCell>
                      <TableCell>{formatDate(collection.createdAt)}</TableCell>
                      <TableCell>{collection.sttIds.length}</TableCell>
                      <TableCell align="right">{formatCurrency(collection.totalTagihan)}</TableCell>
                      <TableCell>
                        <Chip
                          label={collection.status}
                          color={getStatusColor(collection.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {collection.tanggalBayar ? formatDate(collection.tanggalBayar) : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Lihat Detail">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleCollectionClick(collection._id);
                          }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Invoice">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPDF('collection', collection._id);
                          }}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" p={4}>
              <Typography variant="body1" color="text.secondary">
                Tidak ada data penagihan untuk pelanggan ini
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Pickup Tab */}
        <TabPanel value={tabValue} index={3}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : customerPickups && customerPickups.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>No. Pengambilan</TableCell>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Kendaraan</TableCell>
                    <TableCell>Supir</TableCell>
                    <TableCell>Alamat Pengambilan</TableCell>
                    <TableCell>Jumlah STT</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerPickups.map((pickup: CustomerPickup) => (
                    <TableRow
                      key={pickup._id}
                      hover
                      onClick={() => handlePickupClick(pickup._id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{pickup.noPengambilan}</TableCell>
                      <TableCell>{formatDate(pickup.tanggal || pickup.createdAt)}</TableCell>
                      <TableCell>{pickup.kendaraan?.noPolisi || '-'}</TableCell>
                      <TableCell>{pickup.supir?.nama || '-'}</TableCell>
                      <TableCell>{pickup.alamatPengambilan || '-'}</TableCell>
                      <TableCell>{pickup.sttIds?.length || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={pickup.waktuPulang ? 'Selesai' : 'Dalam Proses'}
                          color={pickup.waktuPulang ? 'success' : 'warning' as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Lihat Detail">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handlePickupClick(pickup._id);
                          }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" p={4}>
              <Typography variant="body1" color="text.secondary">
                Tidak ada data pengambilan untuk pelanggan ini
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default CustomerDetail;