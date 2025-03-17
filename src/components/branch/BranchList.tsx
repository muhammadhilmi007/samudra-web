// src/components/branch/BranchList.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Branch } from '../../types/branch';
import DataTable from '../shared/DataTable';
import { RootState, AppDispatch } from '../../store';
import FormDialog from '../shared/FormDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import BranchForm from './BranchForm';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../../store/slices/branchSlice';
import { getDivisions } from '../../store/slices/divisionSlice';

interface BranchListProps {
  onViewDetail?: (branch: Branch) => void;
}

const BranchList: React.FC<BranchListProps> = ({ onViewDetail }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches, loading } = useSelector((state: RootState) => state.branch);
  const { divisions } = useSelector((state: RootState) => state.division);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Columns for the data table
  const columns = [
    { id: 'namaCabang', label: 'Nama Cabang', minWidth: 170 },
    { 
      id: 'divisiId', 
      label: 'Divisi', 
      minWidth: 130,
      format: (value: string) => {
        const division = divisions.find(div => div._id === value);
        return division ? division.namaDivisi : '-';
      }
    },
    { id: 'kota', label: 'Kota', minWidth: 120 },
    { id: 'provinsi', label: 'Provinsi', minWidth: 120 },
    { 
      id: 'kontakPenanggungJawab', 
      label: 'Penanggung Jawab', 
      minWidth: 170,
      format: (value: { nama: string; telepon: string; email: string }) => 
        value ? value.nama : '-'
    },
    { 
      id: 'kontakPenanggungJawab', 
      label: 'Telepon', 
      minWidth: 130,
      format: (value: { nama: string; telepon: string; email: string }) => 
        value ? value.telepon : '-'
    },
    { 
      id: 'createdAt', 
      label: 'Tanggal Dibuat', 
      minWidth: 150,
      format: (value: string) => new Date(value).toLocaleDateString('id-ID'),
    },
  ];

  // Fetch branches and divisions on component mount
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getDivisions());
  }, [dispatch]);

  // Handle opening the form dialog for creating
  const handleOpenCreate = () => {
    setSelectedBranch(null);
    setFormOpen(true);
  };

  // Handle opening the form dialog for editing
  const handleOpenEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormOpen(true);
  };

  // Handle opening the confirm dialog for deleting
  const handleOpenDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setConfirmOpen(true);
  };

  // Handle viewing branch details
  const handleView = (branch: Branch) => {
    if (onViewDetail) {
      onViewDetail(branch);
    }
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: any) => {
    if (selectedBranch) {
      // Update existing branch
      await dispatch(updateBranch({ id: selectedBranch._id, branchData: data }));
    } else {
      // Create new branch
      await dispatch(createBranch(data));
    }
    setFormOpen(false);
  };

  // Handle branch deletion
  const handleDelete = async () => {
    if (selectedBranch) {
      await dispatch(deleteBranch(selectedBranch._id));
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
          Tambah Cabang
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={branches.map(branch => ({
          ...branch,
          id: branch._id // Ensure each row has an id property for selection
        }))}
        title="Daftar Cabang"
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onView={onViewDetail ? handleView : undefined}
        searchable
        searchPlaceholder="Cari cabang..."
      />

      {/* Form Dialog */}
      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={selectedBranch ? "Edit Cabang" : "Tambah Cabang"}
        maxWidth="md"
      >
        <BranchForm
          initialData={selectedBranch || undefined}
          onSubmit={handleFormSubmit}
          loading={loading}
        />
      </FormDialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Cabang"
        content={`Apakah Anda yakin ingin menghapus cabang "${selectedBranch?.namaCabang}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        loading={loading}
        severity="error"
      />
    </Box>
  );
};

export default BranchList;