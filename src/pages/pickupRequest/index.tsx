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

const PickupRequestsPage: NextPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { pickupRequests, pendingRequests } = useSelector((state: RootState) => state.pickupRequest);
  
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

  useEffect(() => {
    dispatch(getPickupRequests());
    dispatch(getPendingPickupRequests());
  }, [dispatch]);

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

  const pickupRequestColumns = [
    { 
      header: 'Tanggal', 
      accessor: 'tanggal',
      cell: (row: PickupRequest) => new Date(row.tanggal).toLocaleDateString()
    },
    { 
      header: 'Pengirim', 
      accessor: 'pengirim.nama',
      cell: (row: PickupRequest) => row.pengirim?.nama || '-'
    },
    { 
      header: 'Alamat Pengambilan', 
      accessor: 'alamatPengambilan' 
    },
    { 
      header: 'Tujuan', 
      accessor: 'tujuan' 
    },
    { 
      header: 'Jumlah Colly', 
      accessor: 'jumlahColly' 
    },
    { 
      header: 'Status', 
      accessor: 'status' 
    },
    { 
      header: 'Aksi', 
      cell: (row: PickupRequest) => (
        <div className="flex space-x-2">
          <button 
            className="text-blue-500 hover:text-blue-700"
            onClick={() => {/* Navigate to detail page */}}
          >
            Lihat
          </button>
          <button 
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDeleteClick(row)}
          >
            Hapus
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <PageHeader 
        title="Permintaan Pengambilan" 
        primaryActionLabel="Buat Permintaan"
        primaryActionLink="/pickup/create"
      />

      <div className="flex mb-4">
        <button 
          className={`px-4 py-2 ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('all')}
        >
          Semua Permintaan
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('pending')}
        >
          Permintaan Pending
        </button>
      </div>

      <DataTable 
        columns={pickupRequestColumns}
        data={activeTab === 'all' ? pickupRequests : pendingRequests}
      />

      <ConfirmDialog 
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Permintaan Pengambilan"
        message="Apakah Anda yakin ingin menghapus permintaan pengambilan ini?"
      />
    </Layout>
  );
};

export default PickupRequestsPage;