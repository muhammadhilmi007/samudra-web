// src/components/collection/CollectionList.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Chip, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Collection } from '../../types/collection';
import DataTable from '../shared/DataTable';
import { RootState, AppDispatch } from '../../store';
import FormDialog from '../shared/FormDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import CollectionForm from './CollectionForm';
import StatusBadge from '../shared/StatusBadge';
import { 
  getCollections, 
  createCollection, 
  updateCollection, 
  deleteCollection,
  generateInvoice 
} from '../../store/slices/collectionSlice';
import { getCustomers } from '../../store/slices/customerSlice';

interface CollectionListProps {
  onViewDetail?: (collection: Collection) => void;
  filter?: 'all' | 'paid' | 'unpaid';
}

const CollectionList: React.FC<CollectionListProps> = ({ 
  onViewDetail, 
  filter = 'all' 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { collections, loading } = useSelector((state: RootState) => state.collection);
  const { customers } = useSelector((state: RootState) => state.customer);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  // Filter collections based on the filter prop
  const filteredCollections = React.useMemo(() => {
    switch (filter) {
      case 'paid':
        return collections.filter(collection => collection.status === 'LUNAS');
      case 'unpaid':
        return collections.filter(collection => collection.status === 'BELUM LUNAS');
      default:
        return collections;
    }
  }, [filter, collections]);

  // Columns for the data table
  const columns = [
    { 
      id: 'noPenagihan', 
      label: 'No. Penagihan', 
      minWidth: 150 
    },
    { 
      id: 'pelangganId', 
      label: 'Pelanggan', 
      minWidth: 200,
      format: (value: string) => {
        const customer = customers.find(c => c._id === value);
        return customer ? customer.nama : '-';
      }
    },
    { 
      id: 'tipePelanggan', 
      label: 'Tipe Pelanggan', 
      minWidth: 150 
    },
    { 
      id: 'sttIds', 
      label: 'Jumlah STT', 
      minWidth: 120,
      align: 'center',
      format: (value: string[]) => value.length
    },
    { 
      id: 'totalTagihan', 
      label: 'Total Tagihan', 
      minWidth: 150,
      align: 'right',
      format: (value: number) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(value)
    },
    { 
      id: 'status', 
      label: 'Status', 
      minWidth: 120,
      format: (value: string) => <StatusBadge status={value} />
    },
    { 
      id: 'createdAt', 
      label: 'Tanggal', 
      minWidth: 120,
      format: (value: string) => new Date(value).toLocaleDateString('id-ID')
    },
  ];

  // Fetch collections and customers on component mount
  useEffect(() => {
    dispatch(getCollections());
    dispatch(getCustomers());
  }, [dispatch]);

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

  // Handle opening the confirm dialog for deleting
  const handleOpenDelete = (collection: Collection) => {
    setSelectedCollection(collection);
    setConfirmOpen(true);
  };

  // Handle viewing collection details
  const handleView = (collection: Collection) => {
    if (onViewDetail) {
      onViewDetail(collection);
    }
  };

  // Handle generate invoice
  const handleGenerateInvoice = (collection: Collection) => {
    dispatch(generateInvoice(collection._id));
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: any) => {
    if (selectedCollection) {
      // Update existing collection
      await dispatch(updateCollection({ 
        id: selectedCollection._id, 
        collectionData: data 
      }));
    } else {
      // Create new collection
      await dispatch(createCollection(data));
    }
    setFormOpen(false);
  };

  // Handle collection deletion
  const handleDelete = async () => {
    if (selectedCollection) {
      await dispatch(deleteCollection(selectedCollection._id));
      setConfirmOpen(false);
    }
  };

  // Get title based on filter
  const getTitle = () => {
    switch (filter) {
      case 'paid':
        return 'Daftar Penagihan Lunas';
      case 'unpaid':
        return 'Daftar Penagihan Belum Lunas';
      default:
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
          Buat Penagihan Baru
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filteredCollections.map(collection => ({
          ...collection,
          id: collection._id // Ensure each row has an id property for selection
        }))}
        title={getTitle()}
        loading={loading}
        onEdit={handleOpenEdit}
        onView={onViewDetail ? handleView : undefined}
        searchable
        searchPlaceholder="Cari penagihan..."
      />

      {/* Form Dialog */}
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedCollection ? "Edit Penagihan" : "Buat Penagihan Baru"}
        maxWidth="md"
        hideActions
      >
        <CollectionForm
          initialData={selectedCollection || undefined}
          onSubmit={handleFormSubmit}
          loading={loading}
        />
      </FormDialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Penagihan"
        content={`Apakah Anda yakin ingin menghapus penagihan ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        loading={loading}
        severity="error"
      />
    </Box>
  );
};

export default CollectionList;