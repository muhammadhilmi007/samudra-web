import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getPickupRequests, 
  getPendingPickupRequests, 
  deletePickupRequest 
} from '../../store/slices/pickupRequestSlice';
import { RootState, AppDispatch } from '../../store';
import { PickupRequest } from '../../types/pickupRequest';

import Layout from '../../components/layout/Layout';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { Box, Button, ButtonGroup } from '@mui/material';
import { useRouter } from 'next/router';

const PickupRequestsPage: NextPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { pickupRequests, pendingRequests, loading } = useSelector((state: RootState) => state.pickupRequest);
  const router = useRouter();
  
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

  useEffect(() => {
    dispatch(getPickupRequests());
    dispatch(getPendingPickupRequests());
  }, [dispatch]);

  const handleViewRequest = (request: PickupRequest) => {
    router.push(`/pickup/detail/${request._id}`);
  };

  const handleEditRequest = (request: PickupRequest) => {
    router.push(`/pickup/edit/${request._id}`);
  };

  const handleDeleteClick = (request: PickupRequest) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRequest) {
      dispatch(deletePickupRequest(selectedRequest._id));
      setIsDeleteDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const columns = [
    { 
      id: 'tanggal', 
      label: 'Tanggal',
      format: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      id: 'pengirimNama', 
      label: 'Pengirim',
      format: (value: string) => value || '-'
    },
    { 
      id: 'alamatPengambilan', 
      label: 'Alamat Pengambilan'
    },
    { 
      id: 'tujuan', 
      label: 'Tujuan'
    },
    { 
      id: 'jumlahColly', 
      label: 'Jumlah Colly'
    },
    { 
      id: 'status', 
      label: 'Status'
    }
  ];

  // Transform data to match DataTable requirements
  const formatDataForTable = (data: PickupRequest[]) => {
    return data.map(item => ({
      id: item._id,
      tanggal: item.tanggal,
      pengirimNama: item.pengirim?.nama,
      alamatPengambilan: item.alamatPengambilan,
      tujuan: item.tujuan,
      jumlahColly: item.jumlahColly,
      status: item.status,
      // Keep the original item for action handlers
      originalData: item
    }));
  };

  return (
    <Layout>
      <PageHeader 
        title="Permintaan Pengambilan" 
        primaryActionLabel="Buat Permintaan"
        primaryActionLink="/pickup/create"
      />

      <Box mb={2}>
        <ButtonGroup variant="contained">
          <Button 
            color={activeTab === 'all' ? 'primary' : 'inherit'}
            onClick={() => setActiveTab('all')}
          >
            Semua Permintaan
          </Button>
          <Button 
            color={activeTab === 'pending' ? 'primary' : 'inherit'}
            onClick={() => setActiveTab('pending')}
          >
            Permintaan Pending
          </Button>
        </ButtonGroup>
      </Box>

      <DataTable 
        columns={columns}
        rows={formatDataForTable(activeTab === 'all' ? pickupRequests : pendingRequests)}
        title={activeTab === 'all' ? "Semua Permintaan Pengambilan" : "Permintaan Pengambilan Pending"}
        onView={(row) => handleViewRequest(row.originalData)}
        onEdit={(row) => handleEditRequest(row.originalData)}
        onDelete={(row) => handleDeleteClick(row.originalData)}
        loading={loading}
        searchPlaceholder="Cari permintaan..."
      />

      <ConfirmDialog 
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Permintaan Pengambilan"
        content="Apakah Anda yakin ingin menghapus permintaan pengambilan ini?"
      />
    </Layout>
  );
};

export default PickupRequestsPage;
