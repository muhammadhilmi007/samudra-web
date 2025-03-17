import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import PickupRequestList from '../../components/pickup/PickupRequestList';
import { Plus } from 'lucide-react';

const PickupRequestPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Check if user has permission to manage pickup requests
  const canManagePickups = user?.role && 
    ['admin', 'direktur', 'manajerOperasional', 'kepalaGudang', 'stafOperasional'].includes(user.role);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Permintaan Pengambilan</h2>
          <p className="text-muted-foreground">
            Kelola permintaan pengambilan barang dari pelanggan
          </p>
        </div>
        {canManagePickups && (
          <Button asChild>
            <Link to="/pickup/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Permintaan
            </Link>
          </Button>
        )}
      </div>
      
      <PickupRequestList branchFilter={user?.cabangId} />
    </div>
  );
};

export default PickupRequestPage;