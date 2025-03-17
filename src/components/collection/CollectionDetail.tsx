// src/components/collection/CollectionDetail.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Payment as PaymentIcon,
  Print as PrintIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  AccountBalance as AccountBalanceIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Collection } from '../../types/collection';
import { STT } from '../../types/stt';
import { RootState, AppDispatch } from '../../store';
import StatusBadge from '../shared/StatusBadge';
import PaymentDialog from './PaymentDialog';
import { getSTTsByIds } from '../../store/slices/sttSlice';
import { generateInvoice, makePayment, updateCollectionStatus } from '../../store/slices/collectionSlice';
import { getCustomerById } from '../../store/slices/customerSlice';
import { getBranchById } from '../../store/slices/branchSlice';

interface CollectionDetailProps {
  collection: Collection;
  onBack?: () => void;
}

const CollectionDetail: React.FC<CollectionDetailProps> = ({ collection, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sttList, loading: sttLoading } = useSelector((state: RootState) => state.stt);
  const { customers, loading: customerLoading } = useSelector((state: RootState) => state.customer);
  const { branches, loading: branchLoading } = useSelector((state: RootState) => state.branch);
  const { loading: collectionLoading } = useSelector((state: RootState) => state.collection);
  
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [collectionStts, setCollectionStts] = useState<STT[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);

  useEffect(() => {
    // Fetch STTs associated with this collection
    if (collection.sttIds?.length > 0) {
      dispatch(getSTTsByIds(collection.sttIds));
    }
    
    // Fetch customer details
    if (collection.pelangganId) {
      dispatch(getCustomerById(collection.pelangganId));
    }
    
    // Fetch branch details
    if (collection.cabangId) {
      dispatch(getBranchById(collection.cabangId));
    }
  }, [dispatch, collection]);

  // Find and set STTs when sttList updates
  useEffect(() => {
    const stts = sttList.filter(stt => collection.sttIds.includes(stt._id));
    setCollectionStts(stts);
  }, [sttList, collection.sttIds]);

  // Find and set customer when customers update
  useEffect(() => {
    const foundCustomer = customers.find(c => c._id === collection.pelangganId);
    if (foundCustomer) {
      setCustomer(foundCustomer);
    }
  }, [customers, collection.pelangganId]);

  // Find and set branch when branches update
  useEffect(() => {
    const foundBranch = branches.find(b => b._id === collection.cabangId);
    if (foundBranch) {
      setBranch(foundBranch);
    }
  }, [branches, collection.cabangId]);

  // Handle generate invoice
  const handleGenerateInvoice = () => {
    dispatch(generateInvoice(collection._id));
  };

  // Handle payment dialog
  const handleOpenPayment = () => {
    setPaymentOpen(true);
  };

  const handleClosePayment = () => {
    setPaymentOpen(false);
  };

  // Handle payment submission
  const handlePaymentSubmit = (paymentData: any) => {
    dispatch(makePayment(paymentData));
    setPaymentOpen(false);
  };

  // Handle mark as paid
  const handleMarkAsPaid = () => {
    dispatch(updateCollectionStatus({
      id: collection._id,
      status: 'LUNAS'
    }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total paid amount
  const calculateTotalPaid = () => {
    return collection.jumlahBayarTermin?.reduce((total, payment) => total + payment.jumlah, 0) || 0;
  };

  // Calculate remaining balance
  const calculateRemainingBalance = () => {
    return collection.totalTagihan - calculateTotalPaid();
  };

  // Check if collection is fully paid
  const isFullyPaid = () => {
    return calculateRemainingBalance() <= 0 || collection.status === 'LUNAS';
  };

  const loading = sttLoading || customerLoading || branchLoading || collectionLoading;

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ 
          position: 'absolute', 
          top: 0,
          right: 0,
          width: '30%',
          height: '100%',
          background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(${collection.status === 'LUNAS' ? '76,175,80,0.1' : '251,140,0,0.1'}) 100%)`,
          zIndex: 0
        }} />
      
        <Grid container spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h4" gutterBottom>
              {collection.noPenagihan}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <StatusBadge status={collection.status} size="medium" />
              {collection.overdue && (
                <Chip label="Overdue" color="error" size="small" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Dibuat pada {formatDate(collection.createdAt)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Tagihan
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {formatCurrency(collection.totalTagihan)}
              </Typography>
              
              {collection.status === 'LUNAS' && collection.tanggalBayar ? (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Dibayar pada {formatDate(collection.tanggalBayar)}
                </Typography>
              ) : (
                <Box display="flex" gap={1} mt={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PdfIcon />}
                    onClick={handleGenerateInvoice}
                  >
                    Invoice
                  </Button>
                  {!isFullyPaid() && (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<PaymentIcon />}
                      onClick={handleOpenPayment}
                    >
                      Bayar
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Customer Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center">
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Informasi {collection.tipePelanggan}</Typography>
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                {customer ? (
                  <List disablePadding>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle1" fontWeight="bold">
                            {customer.nama}
                          </Typography>
                        } 
                        secondary={customer.perusahaan} 
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1.5 }}>
                      <LocationOnIcon sx={{ mr:
                        1, color: 'text.secondary', fontSize: 20 }} />
                      <ListItemText 
                        primary={customer.alamat} 
                        secondary={`${customer.kelurahan}, ${customer.kecamatan}, ${customer.kota}, ${customer.provinsi}`}
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <ListItemText primary={customer.telepon} />
                    </ListItem>
                    {customer.email && (
                      <ListItem disablePadding>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                        <ListItemText primary={customer.email} />
                      </ListItem>
                    )}
                  </List>
                ) : (
                  <Typography color="text.secondary">Data customer tidak ditemukan</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Payment Summary */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center">
                    <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Ringkasan Pembayaran</Typography>
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Tagihan
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(collection.totalTagihan)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Dibayar
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color={isFullyPaid() ? 'success.main' : 'inherit'}>
                      {formatCurrency(calculateTotalPaid())}
                    </Typography>
                  </Grid>
                  
                  {!isFullyPaid() && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">
                          Sisa Tagihan
                        </Typography>
                        <Typography variant="h6" color="error.main" fontWeight="bold">
                          {formatCurrency(calculateRemainingBalance())}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">Status</Typography>
                      <StatusBadge status={collection.status} />
                    </Box>
                  </Grid>
                  
                  {branch && (
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Cabang Penagihan
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{branch.namaCabang}</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* STT Items */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center">
                    <LocalShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Daftar STT ({collectionStts.length})</Typography>
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>No. STT</TableCell>
                        <TableCell>Tanggal</TableCell>
                        <TableCell>Barang</TableCell>
                        <TableCell>Dari</TableCell>
                        <TableCell>Tujuan</TableCell>
                        <TableCell>Berat (kg)</TableCell>
                        <TableCell align="right">Jumlah</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {collectionStts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2" color="text.secondary" p={2}>
                              Tidak ada STT terkait penagihan ini.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        collectionStts.map((stt) => (
                          <TableRow key={stt._id}>
                            <TableCell>{stt.noSTT}</TableCell>
                            <TableCell>{formatDate(stt.createdAt)}</TableCell>
                            <TableCell>{stt.namaBarang}</TableCell>
                            <TableCell>{stt.cabangAsal?.namaCabang || '-'}</TableCell>
                            <TableCell>{stt.cabangTujuan?.namaCabang || '-'}</TableCell>
                            <TableCell>{stt.berat}</TableCell>
                            <TableCell align="right">{formatCurrency(stt.harga)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Payment History */}
          <Grid item xs={12}>
            <Accordion defaultExpanded={true}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="payment-history-content"
                id="payment-history-header"
              >
                <Box display="flex" alignItems="center">
                  <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Riwayat Pembayaran</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {collection.jumlahBayarTermin && collection.jumlahBayarTermin.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Termin</TableCell>
                          <TableCell>Tanggal</TableCell>
                          <TableCell>Keterangan</TableCell>
                          <TableCell align="right">Jumlah</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {collection.jumlahBayarTermin.map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell>Pembayaran ke-{payment.termin}</TableCell>
                            <TableCell>{formatDate(payment.tanggal)}</TableCell>
                            <TableCell>
                              {/* Placeholder for note/description */}
                              {/* We don't have a description field in the Collection type for payments */}
                              -
                            </TableCell>
                            <TableCell align="right">{formatCurrency(payment.jumlah)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" py={2}>
                    Belum ada riwayat pembayaran.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      )}
      
      {/* Back Button (if needed) */}
      {onBack && (
        <Box mt={3}>
          <Button
            variant="outlined"
            onClick={onBack}
          >
            Kembali
          </Button>
        </Box>
      )}
      
      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentOpen}
        onClose={handleClosePayment}
        collection={collection}
        onSubmit={handlePaymentSubmit}
      />
    </Box>
  );
};

export default CollectionDetail;