import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import SttList from '../../components/stt/SttList';
import { Plus } from 'lucide-react';

const SttListPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daftar Surat Tanda Terima (STT)</h2>
          <p className="text-muted-foreground">
            Kelola semua Surat Tanda Terima (STT) pengiriman barang
          </p>
        </div>
        <Button asChild>
          <Link to="/stt/create">
            <Plus className="mr-2 h-4 w-4" />
            Buat STT Baru
          </Link>
        </Button>
      </div>
      
      <SttList branchFilter={user?.cabangId} />
    </div>
  );
};

export default SttListPage;