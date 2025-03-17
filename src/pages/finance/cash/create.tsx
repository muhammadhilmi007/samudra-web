import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { createCashTransaction } from '../../../store/slices/financeSlice';
import CashForm from '../../../components/finance/CashForm';
import { ArrowLeft } from 'lucide-react';

const CreateCashPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (data: any) => {
    setLoading(true);
    
    dispatch(createCashTransaction(data))
      .unwrap()
      .then(() => {
        toast({
          title: 'Berhasil',
          description: 'Transaksi kas berhasil ditambahkan',
        });
        navigate('/finance/cash');
      })
      .catch((error) => {
        toast({
          title: 'Gagal',
          description: error.message || 'Terjadi kesalahan saat menambahkan transaksi kas',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
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
          <h2 className="text-3xl font-bold tracking-tight">Tambah Transaksi Kas</h2>
          <p className="text-muted-foreground">
            Tambahkan transaksi kas baru
          </p>
        </div>
      </div>
      
      <CashForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreateCashPage;