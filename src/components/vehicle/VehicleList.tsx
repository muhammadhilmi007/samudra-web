// src/components/vehicle/VehicleList.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Chip, Avatar, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Vehicle, mapVehicleTypeToFrontend } from '../../types/vehicle';
import { Employee } from '../../types/employee';
import DataTable from '../shared/DataTable';
import { RootState, AppDispatch } from '../../store';
import FormDialog from '../shared/FormDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import VehicleForm from './VehicleForm';
import StatusBadge from '../shared/StatusBadge';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../store/slices/vehicleSlice';
import { getBranches } from '../../store/slices/branchSlice';

interface VehicleListProps {
  onViewDetail?: (vehicle: Vehicle) => void;
  filter?: 'all' | 'trucks' | 'delivery';
}

const VehicleList: React.FC<VehicleListProps> = ({ onViewDetail, filter = 'all' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, trucks, deliveryVehicles, loading } = useSelector((state: RootState) => state.vehicle);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Get filtered vehicles based on the filter prop
  const filteredVehicles = React.useMemo(() => {
    switch (filter) {
      case 'trucks':
        return trucks;
      case 'delivery':
        return deliveryVehicles;
      default:
        return vehicles;
    }
  }, [filter, vehicles, trucks, deliveryVehicles]);

  // Columns for the data table
  const columns = [
    { id: 'noPolisi', label: 'No. Polisi', minWidth: 120 },
    { id: 'namaKendaraan', label: 'Nama Kendaraan', minWidth: 150 },
    { 
      id: 'tipe', 
      label: 'Tipe', 
      minWidth: 120,
      format: (value: string) => (
        <StatusBadge 
          status={value} 
          customColors={{
            'Lansir': { color: '#2e7d32', backgroundColor: '#e8f5e9' },
            'Antar Cabang': { color: '#0288d1', backgroundColor: '#e1f5fe' },
          }}
        />
      )
    },
    { 
      id: 'cabangId', 
      label: 'Cabang', 
      minWidth: 150,
      format: (value: string) => {
        const branch = branches.find(b => b._id === value);
        return branch ? branch.namaCabang : '-';
      }
    },
    { 
      id: 'supirId', 
      label: 'Supir', 
      minWidth: 150,
      format: (value: any) => {
        const row = value as { fotoSupir?: string; supirId: string };
        return (
          <Box display="flex" alignItems="center">
            {row.fotoSupir ? (
              <Avatar
                src={row.fotoSupir}
                alt={row.supirId || 'Supir'}
                sx={{ width: 30, height: 30, mr: 1 }}
              />
            ) : null}
            <Typography variant="body2">
              {row.supirId || '-'}
            </Typography>
          </Box>
        );
      }
    },
    { 
      id: 'noTeleponSupir', 
      label: 'Telepon Supir', 
      minWidth: 130,
      format: (value: string) => value || '-'
    },
    { 
      id: 'grup', 
      label: 'Grup', 
      minWidth: 100,
      format: (value: string) => value || '-'
    },
  ];

  // Fetch vehicles and branches on component mount
  useEffect(() => {
    dispatch(getVehicles());
    dispatch(getBranches());
  }, [dispatch]);

  // Handle opening the form dialog for creating
  const handleOpenCreate = () => {
    setSelectedVehicle(null);
    setFormOpen(true);
  };

  // Handle opening the form dialog for editing
  const handleOpenEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormOpen(true);
  };

  // Handle opening the confirm dialog for deleting
  const handleOpenDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setConfirmOpen(true);
  };

  // Handle viewing vehicle details
  const handleView = (vehicle: Vehicle) => {
    if (onViewDetail) {
      onViewDetail(vehicle);
    }
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (formData: FormData) => {
    if (selectedVehicle) {
      // Update existing vehicle
      await dispatch(updateVehicle({ id: selectedVehicle._id, vehicleData: formData }));
    } else {
      // Create new vehicle
      await dispatch(createVehicle(formData));
    }
    setFormOpen(false);
  };

  // Handle vehicle deletion
  const handleDelete = async () => {
    if (selectedVehicle) {
      await dispatch(deleteVehicle(selectedVehicle._id));
      setConfirmOpen(false);
    }
  };

  // Get title based on filter
  const getTitle = () => {
    switch (filter) {
      case 'trucks':
        return 'Daftar Truck (Antar Cabang)';
      case 'delivery':
        return 'Daftar Kendaraan Lansir (Pengiriman Lokal)';
      default:
        return 'Daftar Kendaraan';
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
          Tambah Kendaraan
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filteredVehicles.map(vehicle => ({
          ...vehicle,
          id: vehicle._id // Ensure each row has an id property for selection
        }))}
        title={getTitle()}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onView={onViewDetail ? handleView : undefined}
        searchable
        searchPlaceholder="Cari kendaraan..."
      />

      {/* Form Dialog */}
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedVehicle ? "Edit Kendaraan" : "Tambah Kendaraan"}
        maxWidth="md"
        hideActions
      >
        <VehicleForm
          initialData={selectedVehicle ? {
            ...selectedVehicle,
            tipe: selectedVehicle.tipeDisplay || mapVehicleTypeToFrontend(selectedVehicle.tipe)
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
          drivers={employees.filter((emp: Employee) =>
            emp.jabatan.toLowerCase().includes('supir') ||
            emp.jabatan.toLowerCase().includes('driver')
          )}
          assistants={employees.filter((emp: Employee) =>
            emp.jabatan.toLowerCase().includes('kenek') ||
            emp.jabatan.toLowerCase().includes('assistant')
          )}
          loading={loading}
        />
      </FormDialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Kendaraan"
        content={`Apakah Anda yakin ingin menghapus kendaraan "${selectedVehicle?.namaKendaraan} (${selectedVehicle?.noPolisi})"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        loading={loading}
        severity="error"
      />
    </Box>
  );
};

export default VehicleList;