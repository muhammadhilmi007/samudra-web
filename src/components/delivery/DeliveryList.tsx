// src/components/delivery/DeliveryList.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Chip, IconButton, Tooltip, Tab, Tabs } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as CompleteIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { Delivery, DeliveryStatusUpdate } from '../../types/delivery';
import DataTable from '../shared/DataTable';
import { RootState, AppDispatch } from '../../store';
import FormDialog from '../shared/FormDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import DeliveryForm from './DeliveryForm';
import StatusUpdateDialog from './StatusUpdateDialog';
import StatusBadge from '../shared/StatusBadge';
import {
  getDeliveries,
  getDeliveriesByBranch,
  getDeliveriesByStatus,
  createDelivery,
  updateDelivery,
  updateDeliveryStatus,
  generateDeliveryPDF,
} from '../../store/slices/deliverySlice';
import { getBranches } from '../../store/slices/branchSlice';

interface DeliveryListProps {
  onViewDetail?: (delivery: Delivery) => void;
  branchId?: string;
  statusFilter?: 'LANSIR' | 'TERKIRIM' | 'BELUM SELESAI';
}

const DeliveryList: React.FC<DeliveryListProps> = ({
  onViewDetail,
  branchId,
  statusFilter,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { deliveries, loading } = useSelector((state: RootState) => state.delivery);
  const { branches } = useSelector((state: RootState) => state.branch);
  const [formOpen, setFormOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Columns for the data table
  const columns = [
    { id: 'idLansir', label: 'ID Lansir', minWidth: 150 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: string) => <StatusBadge status={value} />,
    },
    {
      id: 'antrianKendaraanId',
      label: 'Kendaraan',
      minWidth: 180,
      format: (value: string, row: Delivery) => {
        if (row.antrianKendaraan?.kendaraan) {
          return `${row.antrianKendaraan.kendaraan.noPolisi} - ${row.antrianKendaraan.kendaraan.namaKendaraan}`;
        }
        return '-';
      },
    },
    {
      id: 'antrianKendaraanId',
      label: 'Supir',
      minWidth: 150,
      format: (value: string, row: Delivery) => {
        return row.antrianKendaraan?.supir?.nama || '-';
      },
    },
    {
      id: 'sttIds',
      label: 'Jumlah STT',
      minWidth: 100,
      align: 'center',
      format: (value: string[]) => value.length,
    },
    {
      id: 'berangkat',
      label: 'Berangkat',
      minWidth: 150,
      format: (value: string) => formatDate(value) + ' ' + formatTime(value),
    },
    {
      id: 'sampai',
      label: 'Sampai',
      minWidth: 150,
      format: (value: string) => (value ? formatDate(value) + ' ' + formatTime(value) : '-'),
    },
    {
      id: 'estimasiLansir',
      label: 'Estimasi',
      minWidth: 100,
      format: (value: string) => value || '-',
    },
    {
      id: 'kilometerBerangkat',
      label: 'KM Awal',
      minWidth: 100,
      align: 'right',
      format: (value: number) => (value ? `${value} km` : '-'),
    },
    {
      id: 'kilometerPulang',
      label: 'KM Akhir',
      minWidth: 100,
      align: 'right',
      format: (value: number) => (value ? `${value} km` : '-'),
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
  ];

  // Additional actions
  const renderActions = (row: Delivery) => (
    <Box>
      <Tooltip title="Cetak Form Lansir">
        <IconButton
          size="small"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            handleGeneratePDF(row);
          }}
        >
          <PdfIcon />
        </IconButton>
      </Tooltip>
      {row.status === 'LANSIR' && (
        <Tooltip title="Update Status">
          <IconButton
            size="small"
            color="info"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenStatusUpdate(row);
            }}
          >
            <SpeedIcon />
          </IconButton>
        </Tooltip>
      )}
      {row.status === 'LANSIR' && (
        <Tooltip title="Selesaikan Pengiriman">
          <IconButton
            size="small"
            color="success"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenComplete(row);
            }}
          >
            <CompleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  // Fetch deliveries and related data on component mount
  useEffect(() => {
    dispatch(getBranches());

    // Set tab value based on status filter
    if (statusFilter) {
      const statusToTabIndex: Record<string, number> = {
        LANSIR: 1,
        TERKIRIM: 2,
        BELUM_SELESAI: 3,
      };
      if (statusToTabIndex[statusFilter]) {
        setTabValue(statusToTabIndex[statusFilter]);
      }
    }

    // Fetch deliveries based on filters
    if (branchId) {
      dispatch(getDeliveriesByBranch(branchId));
    } else if (statusFilter) {
      dispatch(getDeliveriesByStatus(statusFilter));
    } else {
      dispatch(getDeliveries());
    }
  }, [dispatch, branchId, statusFilter]);

  // Handle tab change and fetch corresponding data
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Map tab index to status filter
    const tabToStatus: Record<number, string | undefined> = {
      0: undefined, // All
      1: 'LANSIR',
      2: 'TERKIRIM',
      3: 'BELUM_SELESAI',
    };
    
    const newStatus = tabToStatus[newValue];
    
    if (newStatus) {
      dispatch(getDeliveriesByStatus(newStatus));
    } else {
      branchId ? dispatch(getDeliveriesByBranch(branchId)) : dispatch(getDeliveries());
    }
  };

  // Handle opening the form dialog for creating
  const handleOpenCreate = () => {
    setSelectedDelivery(null);
    setFormOpen(true);
  };

  // Handle opening the status update dialog
  const handleOpenStatusUpdate = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setStatusUpdateOpen(true);
  };

  // Handle opening the confirm dialog for completing a delivery
  const handleOpenComplete = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setConfirmCompleteOpen(true);
  };

  // Handle viewing delivery details
  const handleView = (delivery: Delivery) => {
    if (onViewDetail) {
      onViewDetail(delivery);
    }
  };

  // Handle generating PDF
  const handleGeneratePDF = (delivery: Delivery) => {
    dispatch(generateDeliveryPDF(delivery._id));
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: any) => {
    if (selectedDelivery) {
      // Update existing delivery
      await dispatch(
        updateDelivery({
          id: selectedDelivery._id,
          deliveryData: data,
        })
      );
    } else {
      // Create new delivery
      await dispatch(createDelivery(data));
    }
    setFormOpen(false);
  };

  // Handle status update submission
  const handleStatusUpdate = async (statusData: DeliveryStatusUpdate) => {
    if (selectedDelivery) {
      await dispatch(
        updateDeliveryStatus({
          id: selectedDelivery._id,
          statusData,
        })
      );
      setStatusUpdateOpen(false);
    }
  };

  // Handle mark as complete confirmation
  const handleCompleteDelivery = async () => {
    if (selectedDelivery) {
      const now = new Date().toISOString();
      await dispatch(
        updateDeliveryStatus({
          id: selectedDelivery._id,
          statusData: {
            status: 'TERKIRIM',
            sampai: now,
            namaPenerima: 'Diterima',
          },
        })
      );
      setConfirmCompleteOpen(false);
    }
  };

  // Get title based on filter
  const getTitle = () => {
    if (statusFilter === 'LANSIR') {
      return 'Daftar Pengiriman Sedang Berlangsung';
    } else if (statusFilter === 'TERKIRIM') {
      return 'Daftar Pengiriman Selesai';
    } else if (statusFilter === 'BELUM_SELESAI') {
      return 'Daftar Pengiriman Belum Selesai';
    } else if (branchId) {
      const branch = branches.find((b) => b._id === branchId);
      return `Pengiriman Cabang ${branch ? branch.namaCabang : ''}`;
    } else {
      return 'Daftar Pengiriman';
    }
  };

  // Filter deliveries based on tab
  const getFilteredDeliveries = () => {
    if (tabValue === 0) {
      return deliveries;
    }
    
    const statusMapping: Record<number, string> = {
      1: 'LANSIR',
      2: 'TERKIRIM',
      3: 'BELUM_SELESAI',
    };
    
    return deliveries.filter(delivery => delivery.status === statusMapping[tabValue]);
  };

  const filteredDeliveries = getFilteredDeliveries();

  return (
    <Box>
      {/* Tabs for filtering */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab label="Semua" />
        <Tab label="Sedang Dikirim" />
        <Tab label="Telah Terkirim" />
        <Tab label="Belum Selesai" />
      </Tabs>

      {/* Add Button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Buat Pengiriman
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filteredDeliveries.map((delivery) => ({
          ...delivery,
          id: delivery._id, // Ensure each row has an id property for selection
        }))}
        title={getTitle()}
        loading={loading}
        onView={onViewDetail ? handleView : undefined}
        searchable
        searchPlaceholder="Cari pengiriman..."
        renderActions={renderActions}
      />

      {/* Form Dialog */}
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Buat Pengiriman"
        maxWidth="lg"
        hideActions
      >
        <DeliveryForm
          initialData={selectedDelivery || undefined}
          onSubmit={handleFormSubmit}
          loading={loading}
        />
      </FormDialog>

      {/* Status Update Dialog */}
      {selectedDelivery && (
        <StatusUpdateDialog
          open={statusUpdateOpen}
          onClose={() => setStatusUpdateOpen(false)}
          delivery={selectedDelivery}
          onSubmit={handleStatusUpdate}
          loading={loading}
        />
      )}

      {/* Confirm Complete Dialog */}
      <ConfirmDialog
        open={confirmCompleteOpen}
        onClose={() => setConfirmCompleteOpen(false)}
        onConfirm={handleCompleteDelivery}
        title="Selesaikan Pengiriman"
        content={`Apakah Anda yakin ingin menandai pengiriman "${
          selectedDelivery?.idLansir
        }" sebagai TERKIRIM? Tindakan ini akan mengubah status pengiriman menjadi selesai.`}
        confirmText="Selesaikan"
        cancelText="Batal"
        loading={loading}
        severity="success"
      />
    </Box>
  );
};

export default DeliveryList;