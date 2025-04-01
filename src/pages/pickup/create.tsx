import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createPickupRequest } from '../../store/slices/pickupRequestSlice';
import PickupRequestForm from '../../components/pickup/PickupRequestForm';
import { ArrowLeft } from 'lucide-react';

const CreatePickupRequestPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (data: any) => {
    setLoading(true);
    
    dispatch(createPickupRequest(data))
      .unwrap()
      .then(() => {
        toast({
          variant: 'default',
          title: 'Berhasil',
          description: 'Permintaan pengambilan berhasil dibuat',
        });
        navigate('/pickup');
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Terjadi kesalahan saat membuat permintaan pengambilan',
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
            variant="text" 
            size="small" 
            className="mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Tambah Permintaan Pengambilan</h2>
          <p className="text-muted-foreground">
            Buat permintaan pengambilan barang baru
          </p>
        </div>
      </div>
      
      <PickupRequestForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreatePickupRequestPage;