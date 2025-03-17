import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Employee } from '../../types/employee';
import EmployeeForm from './EmployeeForm';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee,
  deleteEmployee 
} from '../../store/slices/employeeSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { getRoles } from '../../store/slices/employeeSlice';

const EmployeeList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, roles, loading } = useSelector((state: RootState) => state.employee);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);

  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Fetch initial data
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getRoles());
    dispatch(getEmployees());
  }, [dispatch]);

  // Handle opening employee form for create/edit
  const handleOpenForm = (employee?: Employee) => {
    setSelectedEmployee(employee || null);
    setOpenForm(true);
  };

  // Handle form submission
  const handleSubmit = (data: any) => {
    if (selectedEmployee) {
      // Update existing employee
      dispatch(updateEmployee({ 
        id: selectedEmployee._id, 
        employeeData: data 
      }));
    } else {
      // Create new employee
      dispatch(createEmployee(data));
    }
    setOpenForm(false);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedEmployee) {
      dispatch(deleteEmployee(selectedEmployee._id));
      setOpenDeleteDialog(false);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenDeleteDialog(true);
  };

  // Get role name by ID
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    return role ? role.namaRole : '-';
  };

  // Get branch name by ID
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Daftar Pegawai</CardTitle>
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              Tambah Pegawai
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
              </DialogTitle>
            </DialogHeader>
            <EmployeeForm
              initialData={selectedEmployee || undefined}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="grid grid-cols-12 border-b font-bold py-2">
            <div className="col-span-2">Nama</div>
            <div className="col-span-2">Username</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Cabang</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Aksi</div>
          </div>
          {employees.map((employee) => (
            <div 
              key={employee._id} 
              className="grid grid-cols-12 border-b py-2 items-center"
            >
              <div className="col-span-2 flex items-center space-x-2">
                <Avatar>
                  <AvatarImage 
                    src={employee.fotoProfil || undefined} 
                    alt={employee.nama}
                  />
                  <AvatarFallback>
                    {employee.nama.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{employee.nama}</span>
              </div>
              <div className="col-span-2">{employee.username}</div>
              <div className="col-span-2">{getRoleName(employee.roleId)}</div>
              <div className="col-span-2">{getBranchName(employee.cabangId)}</div>
              <div className="col-span-2">
                <Badge 
                  variant={employee.aktif ? 'default' : 'destructive'}
                >
                  {employee.aktif ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
              <div className="col-span-2 text-right space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenForm(employee)}
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleOpenDeleteDialog(employee)}
                    >
                      Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus pegawai {employee.nama}?
                        Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteConfirm}>
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {employees.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Tidak ada data pegawai
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeList;