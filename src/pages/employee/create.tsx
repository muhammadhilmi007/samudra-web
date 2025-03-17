import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createEmployee } from '../../store/slices/employeeSlice';
import EmployeeForm from '../../components/employee/EmployeeForm';
import { ArrowLeft } from 'lucide-react';

const CreateEmployeePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = (data: any) => {
    setLoading(true);
    
    dispatch(createEmployee(data))
      .unwrap()
      .then((result) => {
        toast({
          title: 'Berhasil',
          description: `Pegawai ${result.nama} berhasil ditambahkan`,
        });
        navigate(`/employee/${result._id}`);
      })
      .catch((error) => {
        toast({
          title: 'Gagal',
          description: error.message || 'Terjadi kesalahan saat menambahkan pegawai',
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
          <h2 className="text-3xl font-bold tracking-tight">Tambah Pegawai Baru</h2>
          <p className="text-muted-foreground">
            Tambahkan data pegawai baru dan atur hak aksesnya
          </p>
        </div>
      </div>
      
      <EmployeeForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreateEmployeePage;