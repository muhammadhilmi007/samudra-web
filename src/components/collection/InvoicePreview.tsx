// src/components/collection/InvoicePreview.tsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Divider,
  Grid
} from '@mui/material';
import { Collection } from '../../types/collection';
import { STT } from '../../types/stt';
import { Customer } from '../../types/customer';

interface InvoicePreviewProps {
  collection: Collection;
  customer: Customer;
  sttList: STT[];
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  collection, 
  customer, 
  sttList 
}) => {
  // Calculate total invoice amount
  const totalInvoice = sttList.reduce((total, stt) => total + stt.harga, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Invoice Penagihan
        </Typography>
        <Typography variant="subtitle1">
          No. Penagihan: {collection.noPenagihan}
        </Typography>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Informasi Pelanggan</Typography>
          <Typography variant="body2">{customer.nama}</Typography>
          <Typography variant="body2">
            {customer.alamat}, {customer.kota}, {customer.provinsi}
          </Typography>
          <Typography variant="body2">
            Telepon: {customer.telepon}
          </Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography variant="subtitle2">Detail Penagihan</Typography>
          <Typography variant="body2">
            Tipe: {collection.tipePelanggan}
          </Typography>
          <Typography variant="body2">
            Status: {collection.status}
          </Typography>
          <Typography variant="body2">
            Tanggal: {new Date(collection.createdAt).toLocaleDateString('id-ID')}
          </Typography>
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No. STT</TableCell>
              <TableCell>Nama Barang</TableCell>
              <TableCell>Berat</TableCell>
              <TableCell align="right">Harga</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sttList.map((stt) => (
              <TableRow key={stt._id}>
                <TableCell>{stt.noSTT}</TableCell>
                <TableCell>{stt.namaBarang}</TableCell>
                <TableCell>{stt.berat} kg</TableCell>
                <TableCell align="right">{formatCurrency(stt.harga)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3} display="flex" justifyContent="space-between">
        <Typography variant="subtitle1">Total Tagihan</Typography>
        <Typography variant="h6" color="primary">
          {formatCurrency(totalInvoice)}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box textAlign="center" mt={3}>
        <Typography variant="body2" color="text.secondary">
          Terima kasih atas kerja sama Anda
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Invoice ini dibuat secara elektronik dan sah tanpa tanda tangan basah
        </Typography>
      </Box>
    </Box>
  );
};

export default InvoicePreview;