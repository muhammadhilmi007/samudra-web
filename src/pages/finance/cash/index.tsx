import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import CashList from '../../../components/finance/CashList';
import { Plus } from 'lucide-react';

const CashListPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Check if user has permission to manage finances
  const canManageFinances = user?.role && 
    ['admin', 'direktur', 'direkturKeuangan', 'manajerKeuangan', 'kasir', 'stafKeuangan'].includes(user.role);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Kas</h2>
          <p className="text-muted-foreground">
            Kelola transaksi kas perusahaan
          </p>
        </div>
        {canManageFinances && (
          <Button asChild>
            <Link to="/finance/cash/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Transaksi Kas
            </Link>
          </Button>
        )}
      </div>
      
      <CashList branchFilter={user?.cabangId} />
    </div>
  );
};

export default CashListPage;