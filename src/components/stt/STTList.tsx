// src/components/stt/STTList.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Chip, Avatar, IconButton, Tooltip } from '@mui/material';
import { 
  Add as AddIcon, 
  PictureAsPdf as PdfIcon,
  LocalShipping as ShippingIcon 
} from '@mui/icons-material';
import { STT } from '../../types/stt';
import DataTable from '../shared/DataTable';
import { RootState, AppDispatch } from '../../store';
import FormDialog from '../shared/FormDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import StatusBadge from '../shared/StatusBadge';
import STTForm from './STTForm';
import { 
  getSTTs, 
  createSTT, 
  updateSTT, 
  generateSTTPDF 
} from '../../store/slices/sttSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { getRecipients, getSenders } from '../../store/slices/customerSlice';

interface STTListProps {
  onViewDetail?: (stt: STT) => void;
  filter?: 'all' | 'pending' | 'loading' | 'transit' | 'delivering' | 'delivered' | 'returned';
}

const STTList: React.FC<STTListProps> = ({ 
  onViewDetail, 
  filter = 'all' 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sttList, pdfUrl, loading } = useSelector((state: RootState) => state.stt);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { senders, recipients } = useSelector((state: RootState) => state.customer);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSTT, setSelectedSTT] = useState<STT | null>(null);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  // Filter STTs based on the filter prop
  const filteredSTTs = React.useMemo(() => {
    switch (filter) {
      case 'pending':
        return sttList.filter(stt => stt.status === 'PENDING');
      case 'loading':
        return sttList.filter(stt => stt.status === 'MUAT');
      case 'transit':
        return sttList.filter(stt => stt.status === 'TRANSIT');
      case 'delivering':
        return sttList.filter(stt => stt.status === 'LANSIR');
      case 'delivered':
        return sttList.filter(stt => stt.status === 'TERKIRIM');
      case 'returned':
        return sttList.filter(stt => stt.status === 'RETURN');
      default:
        return sttList;
    }
  }, [filter, sttList]);

  // Columns for the data table
  const columns = [
    { id: 'noSTT', label: 'No. STT', minWidth: 150 },
    { 
      id: 'status', 
      label: 'Status', 
      minWidth: 120,
      format: (value: string) => <StatusBadge status={value} />
    },
    { 
      id: 'cabangAsalId', 
      label: 'Asal', 
      minWidth: 120,
      format: (value: string) => {
        const branch = branches.find(b => b._id === value);
        return branch ? branch.namaCabang : '-';
      }
    },
    { 
      id: 'cabangTujuanId', 
      label: 'Tujuan', 
      minWidth: 120,
      format: (value: string) => {
        const branch = branches.find(b => b._id === value);
        return branch ? branch.namaCabang : '-';
      }
    },
    { 
      id: 'pengirimId', 
      label: 'Pengirim', 
      minWidth: 150,
      format: (value: string) => {
        const sender = senders.find(s => s._id === value);
        return sender ? sender.nama : '-';
      }
    },
    { 
      id: 'penerimaId', 
      label: 'Penerima', 
      minWidth: 150,
      format: (value: string) => {
        const recipient = recipients.find(r => r._id === value);
        return recipient ? recipient.nama : '-';
      }
    },
    { id: 'namaBarang', label: 'Barang', minWidth: 150 },
    { 
      id: 'jumlahColly', 
      label: 'Colly', 
      minWidth: 80,
      align: 'center'
    },
    { 
      id: 'berat', 
      label: 'Berat (kg)', 
      minWidth: 120,
      align: 'right',
      format: (value: number) => value.toFixed(1)
    },
    { 
      id: 'harga', 
      label: 'Harga', 
      minWidth: 130,
      align: 'right',
      format: (value: number) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value)
    },
    { 
      id: 'paymentType', 
      label: 'Pembayaran', 
      minWidth: 120,
      format: (value: string) => (
        <Chip 
          label={value} 
          size="small"
          color={
            value === 'CASH' ? 'success' : 
            value === 'COD' ? 'warning' : 
            'info'
          }
          variant="outlined"
        />
      )
    },
    { 
      id: 'createdAt', 
      label: 'Tanggal', 
      minWidth: 120,
      format: (value: string) => new Date(value).toLocaleDateString('id-ID'),
    },
  ];

  // Add actions column
  const renderActions = (row: STT) => (
    <Box>
      <Tooltip title="Cetak STT">
        <IconButton 
          size="small" 
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            handlePrintSTT(row);
          }}
        >
          <PdfIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  // Fetch STTs and related data on component mount
  useEffect(() => {
    dispatch(getSTTs());
    dispatch(getBranches());
    dispatch(getSenders());
    dispatch(getRecipients());
  }, [dispatch]);

  // Effect for handling PDF generation
  useEffect(() => {
    if (pdfUrl) {
      // Open PDF in a new tab
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl]);

  // Handle opening the form dialog for creating
  const handleOpenCreate = () => {
    setSelectedSTT(null);
    setFormOpen(true);
  };

  // Handle opening the form dialog for editing
  const handleOpenEdit = (stt: STT) => {
    setSelectedSTT(stt);
    setFormOpen(true);
  };

  // Handle viewing STT details
  const handleView = (stt: STT) => {
    if (onViewDetail) {
      onViewDetail(stt);
    }
  };

  // Handle printing STT
  const handlePrintSTT = (stt: STT) => {
    dispatch(generateSTTPDF(stt._id));
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: any) => {
    if (selectedSTT) {
      // Update existing STT
      await dispatch(updateSTT({ id: selectedSTT._id, sttData: data }));
    } else {
      // Create new STT
      await dispatch(createSTT(data));
    }
    setFormOpen(false);
  };

  // Get title based on filter
  const getTitle = () => {
    switch (filter) {
      case 'pending':
        return 'Daftar STT Pending';
      case 'loading':
        return 'Daftar STT Dalam Pemuatan';
      case 'transit':
        return 'Daftar STT Dalam Perjalanan';
      case 'delivering':
        return 'Daftar STT Dalam Pengiriman Lokal';
      case 'delivered':
        return 'Daftar STT Terkirim';
      case 'returned':
        return 'Daftar STT Retur';
      default:
        return 'Daftar Surat Tanda Terima (STT)';
    }
  };

  return (
    <Box>
      {/* Add Button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Buat STT Baru
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filteredSTTs.map(stt => ({
          ...stt,
          id: stt._id // Ensure each row has an id property for selection
        }))}
        title={getTitle()}
        loading={loading}
        onEdit={handleOpenEdit}
        onView={onViewDetail ? handleView : undefined}
        searchable
        searchPlaceholder="Cari STT..."
      />

      {/* Form Dialog */}
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedSTT ? "Edit STT" : "Buat STT Baru"}
        maxWidth="md"
        hideActions
      >
        <STTForm
          initialData={selectedSTT || undefined}
          onSubmit={handleFormSubmit}
          loading={loading}
        />
      </FormDialog>
    </Box>
  );
};

export default STTList;