import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createEmployee } from '../../store/slices/employeeSlice';
import EmployeeForm from '../../components/employee/EmployeeForm';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CreateEmployeePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Check if user has permission to create employees
  const canCreate = user?.role && 
    ['direktur', 'manajer_admin', 'manajer_sdm', 'kepala_cabang'].includes(user.role);
  
  // Handle form submission
  const handleSubmit = async (data: FormData): Promise<void> => {
    if (!canCreate) {
      toast({
        message: "Anda tidak memiliki izin untuk membuat pegawai baru",
        type: "error"
      });
      return;
    }
    
    setLoading(true);
    
    dispatch(createEmployee(data))
      .unwrap()
      .then((result) => {
        toast({
          message: `Pegawai ${result.nama} berhasil ditambahkan`,
        });
        navigate(`/employee/${result._id}`);
      })
      .catch((error) => {
        toast({
          message: error.message || "Terjadi kesalahan saat menambahkan pegawai",
          type: "error"
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  if (!canCreate) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Button 
          variant="text" 
          size="small" 
          className="mb-2"
          onClick={() => navigate("/employee")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        
        <Alert variant="standard">
          <UserPlus className="h-4 w-4" />
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription>
            Anda tidak memiliki izin untuk membuat pegawai baru.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="text" 
            size="small" 
            className="mb-2"
            onClick={() => navigate("/employee")}
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
      
      <EmployeeForm onSubmit={async (data) => await handleSubmit(data)} loading={loading} />
    </div>
  );
};

export default CreateEmployeePage;