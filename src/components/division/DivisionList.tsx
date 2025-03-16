// src/components/division/DivisionList.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Division } from '../../types/division';
import DataTable from '../shared/DataTable';
import { RootState, AppDispatch } from '../../store';
import FormDialog from '../shared/FormDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import DivisionForm from './DivisionForm';
import { getDivisions, createDivision, updateDivision, deleteDivision } from '../../store/slices/divisionSlice';

interface DivisionListProps {
  onEdit?: (division: Division) => void;
}

const DivisionList: React.FC<DivisionListProps> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { divisions, loading } = useSelector((state: RootState) => state.division);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

  // Columns for the data table
  const columns = [
    { id: 'namaDivisi', label: 'Nama Divisi', minWidth: 200 },
    { 
      id: 'createdAt', 
      label: 'Tanggal Dibuat', 
      minWidth: 150,
      format: (value: string) => new Date(value).toLocaleDateString('id-ID'),
    },
    { 
      id: 'updatedAt', 
      label: 'Terakhir Diperbarui', 
      minWidth: 150,
      format: (value: string) => new Date(value).toLocaleDateString('id-ID'),
    },
  ];

  // Fetch divisions on component mount
  useEffect(() => {
    dispatch(getDivisions());
  }, [dispatch]);

  // Handle opening the form dialog for creating
  const handleOpenCreate = () => {
    setSelectedDivision(null);
    setFormOpen(true);
  };

  // Handle opening the form dialog for editing
  const handleOpenEdit = (division: Division) => {
    setSelectedDivision(division);
    setFormOpen(true);
  };

  // Handle opening the confirm dialog for deleting
  const handleOpenDelete = (division: Division) => {
    setSelectedDivision(division);
    setConfirmOpen(true);
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: { namaDivisi: string }) => {
    if (selectedDivision) {
      // Update existing division
      await dispatch(updateDivision({ id: selectedDivision._id, divisionData: data }));
    } else {
      // Create new division
      await dispatch(createDivision(data));
    }
    setFormOpen(false);
  };

  // Handle division deletion
  const handleDelete = async () => {
    if (selectedDivision) {
      await dispatch(deleteDivision(selectedDivision._id));
      setConfirmOpen(false);
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
          Tambah Divisi
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={divisions}
        title="Daftar Divisi"
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        searchable
        searchPlaceholder="Cari divisi..."
      />

      {/* Form Dialog */}
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedDivision ? "Edit Divisi" : "Tambah Divisi"}
        maxWidth="sm"
      >
        <DivisionForm
          initialData={selectedDivision || undefined}
          onSubmit={handleFormSubmit}
          loading={loading}
        />
      </FormDialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Divisi"
        content={`Apakah Anda yakin ingin menghapus divisi "${selectedDivision?.namaDivisi}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        loading={loading}
        severity="error"
      />
    </Box>
  );
};

export default DivisionList;