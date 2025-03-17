// src/components/collection/InvoicePreview.tsx
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import { Collection } from '../../types/collection';
import { Customer } from '../../types/customer';
import { Branch } from '../../types/branch';
import { STT } from '../../types/stt';

interface InvoicePreviewProps {
  collection: Collection;
  customer?: Customer;
  branch?: Branch;
  stts: STT[];
  onPrint?: () => void;
  onDownload?: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  collection,
  customer,
  branch,
  stts,
  onPrint,
  onDownload,
}) => {
  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  // Calculate total
  const calculateTotal = () => {
    return stts.reduce((total, stt) => total + stt.harga, 0);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', position: 'relative' }}>
      {/* Actions */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        {onPrint && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={onPrint}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
        )}
        {onDownload && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
          >
            Download PDF
          </Button>
        )}
      </Box>

      {/* Invoice Header */}
      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              INVOICE
            </Typography>
            <Typography variant="h6" color="primary">
              {collection.noPenagihan}
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="body1" gutterBottom>
              <strong>Tanggal Invoice:</strong> {formatDate(collection.createdAt)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Status:</strong>{' '}
              <Box
                component="span"
                sx={{
                  color: collection.status === 'LUNAS' ? 'success.main' : 'warning.main',
                  fontWeight: 'bold',
                }}
              >
                {collection.status}
              </Box>
            </Typography>
            {collection.status === 'LUNAS' && collection.tanggalBayar && (
              <Typography variant="body1" gutterBottom>
                <strong>Tanggal Pembayaran:</strong> {formatDate(collection.tanggalBayar)}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Company & Customer Info */}
      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Dari:
          </Typography>
          <Typography variant="body1" gutterBottom>
            PT. Sarana Mudah Raya
          </Typography>
          {branch && (
            <>
              <Typography variant="body1" gutterBottom>
                Cabang {branch.namaCabang}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {branch.alamat}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {branch.kelurahan}, {branch.kecamatan}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {branch.kota}, {branch.provinsi}
              </Typography>
              {branch.kontakPenanggungJawab?.telepon && (
                <Typography variant="body1" gutterBottom>
                  Tel: {branch.kontakPenanggungJawab.telepon}
                </Typography>
              )}
            </>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Kepada:
          </Typography>
          {customer && (
            <>
              <Typography variant="body1" gutterBottom>
                {customer.nama}
              </Typography>
              {customer.perusahaan && (
                <Typography variant="body1" gutterBottom>
                  {customer.perusahaan}
                </Typography>
              )}
              <Typography variant="body1" gutterBottom>
                {customer.alamat}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {customer.kelurahan}, {customer.kecamatan}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {customer.kota}, {customer.provinsi}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tel: {customer.telepon}
              </Typography>
              {customer.email && (
                <Typography variant="body1" gutterBottom>
                  Email: {customer.email}
                </Typography>
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Invoice Items */}
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Detail Pengiriman:
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell width="5%">#</TableCell>
              <TableCell>No. STT</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Deskripsi</TableCell>
              <TableCell>Dari</TableCell>
              <TableCell>Tujuan</TableCell>
              <TableCell align="right">Jumlah</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stts.map((stt, index) => (
              <TableRow key={stt._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{stt.noSTT}</TableCell>
                <TableCell>{formatDate(stt.createdAt)}</TableCell>
                <TableCell>
                  {stt.namaBarang} ({stt.berat} kg)
                </TableCell>
                <TableCell>
                  {stt.cabangAsal?.namaCabang || 'Cabang Asal'}
                </TableCell>
                <TableCell>
                  {stt.cabangTujuan?.namaCabang || 'Cabang Tujuan'}
                </TableCell>
                <TableCell align="right">{formatCurrency(stt.harga)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Total */}
      <Box display="flex" justifyContent="flex-end" mb={4}>
        <Box width="300px">
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1">Subtotal:</Typography>
            <Typography variant="subtitle1">{formatCurrency(calculateTotal())}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              Total:
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {formatCurrency(collection.totalTagihan)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Payment Info & Terms */}
      <Box mt={4}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Informasi Pembayaran:
        </Typography>
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" gutterBottom>
            Silakan lakukan pembayaran ke:
          </Typography>
          <Typography variant="body1" gutterBottom>
            Bank Mandiri
          </Typography>
          <Typography variant="body1" gutterBottom>
            No. Rekening: 1234-5678-9012-3456
          </Typography>
          <Typography variant="body1" gutterBottom>
            Atas Nama: PT. Sarana Mudah Raya
          </Typography>
        </Box>
      </Box>

      {/* Payment History */}
      {collection.jumlahBayarTermin && collection.jumlahBayarTermin.length > 0 && (
        <Box mt={4}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Riwayat Pembayaran:
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>Termin</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell align="right">Jumlah</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collection.jumlahBayarTermin.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.termin}</TableCell>
                    <TableCell>{formatDate(payment.tanggal)}</TableCell>
                    <TableCell align="right">{formatCurrency(payment.jumlah)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Footer */}
      <Box mt={6} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Terima kasih atas kepercayaan Anda menggunakan jasa kami.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Untuk pertanyaan mengenai tagihan ini, silakan hubungi kami di (021) 123-4567.
        </Typography>
      </Box>
    </Paper>
  );
};

export default InvoicePreview;