import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getEmployeeById, updateEmployee } from '../../store/slices/employeeSlice';
import EmployeeDetail from '../../components/employee/EmployeeDetail';
import EmployeeForm from '../../components/employee/EmployeeForm';
import { ArrowLeft, Edit, UserIcon } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EmployeeDetailPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { employees, loading } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Find the employee
  const employee = employees.find(emp => emp._id === id);
  
  // Fetch the employee if not in the store
  useEffect(() => {
    if (id && !employee && !notFound) {
      dispatch(getEmployeeById(id))
        .unwrap()
        .catch(() => {
          setNotFound(true);
        });
    }
  }, [dispatch, id, employee, notFound]);
  
  // Check if user has permission to edit
  const canEdit = user?.role && 
    ['admin', 'direktur', 'managerHRD', 'kepalaAdministrasi'].includes(user.role);
  
  // Handle edit form submission
  const handleEditSubmit = (data: any) => {
    if (!id) return;
    
    setEditLoading(true);
    
    dispatch(updateEmployee({ id, employeeData: data }))
      .unwrap()
      .then((result) => {
        toast({
          title: 'Berhasil',
          description: `Data pegawai ${result.nama} berhasil diperbarui`,
        });
        setOpenEditDialog(false);
      })
      .catch((error) => {
        toast({
          title: 'Gagal',
          description: error.message || 'Terjadi kesalahan saat memperbarui data pegawai',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setEditLoading(false);
      });
  };
  
  // If employee is not found
  if (notFound) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        
        <Alert variant="destructive">
          <UserIcon className="h-4 w-4" />
          <AlertTitle>Pegawai Tidak Ditemukan</AlertTitle>
          <AlertDescription>
            Pegawai dengan ID yang Anda cari tidak ditemukan.
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
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Detail Pegawai</h2>
          <p className="text-muted-foreground">
            Lihat dan kelola informasi pegawai
          </p>
        </div>
        
        {canEdit && employee && (
          <Button onClick={() => setOpenEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Pegawai
          </Button>
        )}
      </div>
      
      {loading && !employee ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        id && <EmployeeDetail employeeId={id} onEdit={() => setOpenEditDialog(true)} />
      )}
      
      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pegawai</DialogTitle>
            <DialogDescription>
              Perbarui informasi pegawai di bawah ini
            </DialogDescription>
          </DialogHeader>
          
          {employee && (
            <EmployeeForm
              initialData={employee}
              onSubmit={handleEditSubmit}
              loading={editLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDetailPage;