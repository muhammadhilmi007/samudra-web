import React from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  Divider, 
  Typography, 
  Avatar, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { 
  LocalShipping, 
  ReceiptLong, 
  AttachMoney, 
  Loop,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export interface Transaction {
  id: string;
  type: 'STT' | 'PAYMENT' | 'RETURN';
  refNumber: string;
  date: string;
  from: string;
  to: string;
  amount?: number;
  status: 'PENDING' | 'COMPLETED' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED' | 'CANCELED';
}

interface RecentTransactionsProps {
  title: string;
  subtitle?: string;
  transactions: Transaction[];
  loading?: boolean;
  viewAllLink?: string;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  title,
  subtitle,
  transactions,
  loading = false,
  viewAllLink = '/transactions',
}) => {
  const theme = useTheme();
  const router = useRouter();

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'primary' | 'default' => {
    switch (status) {
      case 'COMPLETED':
      case 'DELIVERED':
        return 'success';
      case 'IN_TRANSIT':
      case 'PENDING':
        return 'warning';
      case 'RETURNED':
        return 'info';
      case 'CANCELED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return 'Selesai';
      case 'DELIVERED':
        return 'Terkirim';
      case 'IN_TRANSIT':
        return 'Dalam Perjalanan';
      case 'PENDING':
        return 'Pending';
      case 'RETURNED':
        return 'Dikembalikan';
      case 'CANCELED':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'STT':
        return (
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1), 
              color: theme.palette.primary.main 
            }}
          >
            <ReceiptLong />
          </Avatar>
        );
      case 'PAYMENT':
        return (
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette.success.main, 0.1), 
              color: theme.palette.success.main 
            }}
          >
            <AttachMoney />
          </Avatar>
        );
      case 'RETURN':
        return (
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette.info.main, 0.1), 
              color: theme.palette.info.main 
            }}
          >
            <Loop />
          </Avatar>
        );
      default:
        return (
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette.warning.main, 0.1), 
              color: theme.palette.warning.main 
            }}
          >
            <LocalShipping />
          </Avatar>
        );
    }
  };

  const handleViewDetail = (id: string, type: string) => {
    switch (type) {
      case 'STT':
        router.push(`/stt/${id}`);
        break;
      case 'PAYMENT':
        router.push(`/penagihan/${id}`);
        break;
      case 'RETURN':
        router.push(`/retur/${id}`);
        break;
      default:
        router.push(`/stt/${id}`);
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader 
        title={title} 
        subheader={subtitle}
        titleTypographyProps={{ variant: 'h6' }}
        subheaderTypographyProps={{ variant: 'body2' }}
        action={
          viewAllLink && (
            <Button 
              size="small" 
              color="primary" 
              onClick={() => router.push(viewAllLink)}
            >
              Lihat Semua
            </Button>
          )
        }
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tipe</TableCell>
                <TableCell>No. Referensi</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Rute</TableCell>
                <TableCell align="right">Jumlah</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      Memuat data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      Tidak ada transaksi
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getTypeIcon(transaction.type)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {transaction.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {transaction.refNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {`${transaction.from} → ${transaction.to}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {transaction.amount ? formatCurrency(transaction.amount) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(transaction.status)}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small"
                        onClick={() => handleViewDetail(transaction.id, transaction.type)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;