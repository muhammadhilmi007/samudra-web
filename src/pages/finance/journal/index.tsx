import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import JournalList from '../../../components/finance/JournalList';
import { Plus } from 'lucide-react';

const JournalListPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Check if user has permission to manage finances
  const canManageFinances = user?.role && 
    ['admin', 'direktur', 'direkturKeuangan', 'manajerKeuangan', 'kasir', 'stafKeuangan'].includes(user.role);
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Jurnal Umum</h2>
          <p className="text-muted-foreground">
            Kelola data jurnal umum untuk transaksi keuangan
          </p>
        </div>
        {canManageFinances && (
          <Button asChild>
            <Link to="/finance/journal/create">
              <Plus className="mr-2 h-4 w-4" />c
              Tambah Jurnal
            </Link>
          </Button>
        )}
      </div>
      
      <JournalList branchFilter={user?.cabangId} />
    </div>
  );
};

export default JournalListPage;