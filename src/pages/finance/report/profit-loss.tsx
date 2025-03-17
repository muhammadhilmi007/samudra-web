import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FinancialReport from '../../../components/finance/FinancialReport';

const ProfitLossReportPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Laba Rugi</h2>
          <p className="text-muted-foreground">
            Lihat laporan laba rugi perusahaan dalam periode tertentu
          </p>
        </div>
      </div>
      
      <FinancialReport 
        type="profit-loss" 
        title="Laporan Laba Rugi"
      />
    </div>
  );
};

export default ProfitLossReportPage;