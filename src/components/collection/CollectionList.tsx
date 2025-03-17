// src/components/collection/CollectionList.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Chip, IconButton, Tooltip } from '@mui/material';
import {
  Add as AddIcon,
  PictureAsPdf as PdfIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { Collection } from '../../types/collection';
import DataTable from '../shared/DataTable';
import { RootState, AppDispatch } from '../../store';
import FormDialog from '../shared/FormDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import CollectionForm from './CollectionForm';
import PaymentDialog from './PaymentDialog';
import StatusBadge from '../shared/StatusBadge';
import {
  getCollections,
  getCollectionsByBranch,
  getCollectionsByCustomer,
  getCollectionsByStatus,
  createCollection,
  updateCollection,
  updateCollectionStatus,
  generateInvoice,
} from '../../store/slices/collectionSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { getCustomers } from '../../store/slices/customerSlice';

interface CollectionListProps {
  onViewDetail?: (collection: Collection) => void;
  branchId?: string;
  customerId?: string;
  statusFilter?: 'LUNAS' | 'BELUM LUNAS';
}

const CollectionList: React.FC<CollectionListProps> = ({
  onViewDetail,
  branchId,
  customerId,
  statusFilter,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { collections, pdfUrl, loading } = useSelector((state: RootState) => state.collection);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { customers } = useSelector((state: RootState) => state.customer);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Columns for the data table
  const columns = [
    { id: 'noPenagihan', label: 'No. Penagihan', minWidth: 150 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: string) => <StatusBadge status={value} />,
    },
    {
      id: 'pelangganId',
      label: 'Customer',
      minWidth: 180,
      format: (value: string) => {
        const customer = customers.find((c) => c._id === value);
        return customer ? customer.nama : '-';
      },
    },
    {
      id: 'tipePelanggan',
      label: 'Tipe',
      minWidth: 120,
      format: (value: string) => value,
    },
    {
      id: 'cabangId',
      label: 'Cabang',
      minWidth: 150,
      format: (value: string) => {
        const branch = branches.find((b) => b._id === value);
        return branch ? branch.namaCabang : '-';
      },
    },
    {
      id: 'totalTagihan',
      label: 'Total Tagihan',
      minWidth: 150,
      align: 'right',
      format: (value: number) => formatCurrency(value),
    },
    {
      id: 'sttIds',
      label: 'Jumlah STT',
      minWidth: 120,
      align: 'center',
      format: (value: string[]) => value.length,
    },
    {
      id: 'overdue',
      label: 'Status Jatuh Tempo',
      minWidth: 150,
      format: (value: boolean) =>
        value ? (
          <Chip
            label="Overdue"
            color="error"
            size="small"
            variant="outlined"
            icon={<CalendarIcon fontSize="small" />}
          />
        ) : (
          <Chip
            label="Normal"
            color="success"
            size="small"
            variant="outlined"
          />
        ),
    },
    {
      id: 'createdAt',
      label: 'Tanggal Dibuat',
      minWidth: 150,
      format: (value: string) => formatDate(value),
    },
    {
      id: 'tanggalBayar',
      label: 'Tanggal Bayar',
      minWidth: 150,
      format: (value: string) => (value ? formatDate(value) : '-'),
    },
  ];

  // Additional actions
  const renderActions = (row: Collection) => (
    <Box>
      <Tooltip title="Cetak Invoice">
        <IconButton
          size="small"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            handleGenerateInvoice(row);
          }}
        >
          <PdfIcon />
        </IconButton>
      </Tooltip>
      {row.status === 'BELUM LUNAS' && (
        <Tooltip title="Tambah Pembayaran">
          <IconButton
            size="small"
            color="success"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPayment(row);
            }}
          >
            <PaymentIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  // Fetch collections and related data on component mount
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getCustomers());

    // Fetch collections based on filters
    if (branchId) {
      dispatch(getCollectionsByBranch(branchId));
    } else if (customerId) {
      dispatch(getCollectionsByCustomer(customerId));
    } else if (statusFilter) {
      dispatch(getCollectionsByStatus(statusFilter));
    } else {
      dispatch(getCollections());
    }
  }, [dispatch, branchId, customerId, statusFilter]);

  // Effect for handling PDF generation
  useEffect(() => {
    if (pdfUrl) {
      // Open PDF in a new tab
      window.open(pdfUrl, '_blank');
    }
  }, [pdfUrl]);

  // Handle opening the form dialog for creating
  const handleOpenCreate = () => {
    setSelectedCollection(null);
    setFormOpen(true);
  };

  // Handle opening the form dialog for editing
  const handleOpenEdit = (collection: Collection) => {
    setSelectedCollection(collection);
    setFormOpen(true);
  };

  // Handle opening the payment dialog
  const handleOpenPayment = (collection: Collection) => {
    setSelectedCollection(collection);
    setPaymentOpen(true);
  };

  // Handle opening the confirm dialog for mark as paid
  const handleOpenMarkAsPaid = (collection: Collection) => {
    setSelectedCollection(collection);
    setConfirmOpen(true);
  };

  // Handle viewing collection details
  const handleView = (collection: Collection) => {
    if (onViewDetail) {
      onViewDetail(collection);
    }
  };

  // Handle generating invoice
  const handleGenerateInvoice = (collection: Collection) => {
    dispatch(generateInvoice(collection._id));
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: any) => {
    if (selectedCollection) {
      // Update existing collection
      await dispatch(
        updateCollection({
          id: selectedCollection._id,
          collectionData: data,
        })
      );
    } else {
      // Create new collection
      await dispatch(createCollection(data));
    }
    setFormOpen(false);
  };

  // Handle payment submission
  const handlePaymentSubmit = async (paymentData: any) => {
    // Logic for payment will be handled in PaymentDialog component
    setPaymentOpen(false);
  };

  // Handle mark as paid confirmation
  const handleMarkAsPaid = async () => {
    if (selectedCollection) {
      await dispatch(
        updateCollectionStatus({
          id: selectedCollection._id,
          status: 'LUNAS',
        })
      );
      setConfirmOpen(false);
    }
  };

  // Get title based on filter
  const getTitle = () => {
    if (statusFilter === 'LUNAS') {
      return 'Daftar Penagihan Lunas';
    } else if (statusFilter === 'BELUM LUNAS') {
      return 'Daftar Penagihan Belum Lunas';
    } else if (branchId) {
      const branch = branches.find((b) => b._id === branchId);
      return `Penagihan Cabang ${branch ? branch.namaCabang : ''}`;
    } else if (customerId) {
      const customer = customers.find((c) => c._id === customerId);
      return `Penagihan Customer ${customer ? customer.nama : ''}`;
    } else {
      return 'Daftar Penagihan';
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
          Buat Penagihan
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={collections.map((collection) => ({
          ...collection,
          id: collection._id, // Ensure each row has an id property for selection
        }))}
        title={getTitle()}
        loading={loading}
        onEdit={handleOpenEdit}
        onView={onViewDetail ? handleView : undefined}
        searchable
        searchPlaceholder="Cari penagihan..."
        renderActions={renderActions}
      />

      {/* Form Dialog */}
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedCollection ? 'Edit Penagihan' : 'Buat Penagihan'}
        maxWidth="md"
        hideActions
      >
        <CollectionForm
          initialData={selectedCollection || undefined}
          onSubmit={handleFormSubmit}
          loading={loading}
        />
      </FormDialog>

      {/* Payment Dialog */}
      {selectedCollection && (
        <PaymentDialog
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          collection={selectedCollection}
          onSubmit={handlePaymentSubmit}
          loading={loading}
        />
      )}

      {/* Confirm Mark as Paid Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleMarkAsPaid}
        title="Konfirmasi Pembayaran"
        content={`Apakah Anda yakin ingin menandai penagihan "${
          selectedCollection?.noPenagihan
        }" sebagai LUNAS? Tindakan ini akan memperbarui status penagihan.`}
        confirmText="Tandai Lunas"
        cancelText="Batal"
        loading={loading}
        severity="info"
      />
    </Box>
  );
};

export default CollectionList;