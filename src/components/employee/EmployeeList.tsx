// src/components/employee/EmployeeList.tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee,
  deleteEmployee,
  getRoles
} from '../../store/slices/employeeSlice';
import { getBranches } from '../../store/slices/branchSlice';
import EmployeeForm from './EmployeeForm';
import { Employee } from '../../types/employee';

const EmployeeList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { employees, roles, loading } = useSelector((state: RootState) => state.employee);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);

  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Filtering and searching state
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>(user?.cabangId || '');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Fetch initial data
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getRoles());
    
    // Build query params for API request
    const params: any = {};
    if (branchFilter) params.cabangId = branchFilter;
    if (roleFilter) params.roleId = roleFilter;
    if (statusFilter) params.aktif = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined;
    if (searchTerm) params.search = searchTerm;
    
    dispatch(getEmployees(params));
  }, [dispatch, branchFilter, roleFilter, statusFilter, searchTerm]);

  // Handle opening employee form for create/edit
  const handleOpenForm = (employee?: Employee) => {
    setSelectedEmployee(employee || null);
    setOpenForm(true);
  };

  // Handle viewing employee details
  const handleViewEmployee = (id: string) => {
    navigate(`/employee/${id}`);
  };

  // Handle form submission
  const handleSubmit = (data: any) => {
    if (selectedEmployee) {
      // Update existing employee
      dispatch(updateEmployee({ 
        id: selectedEmployee._id, 
        employeeData: data 
      }))
        .unwrap()
        .then(() => {
          setOpenForm(false);
          setSelectedEmployee(null);
        });
    } else {
      // Create new employee
      dispatch(createEmployee(data))
        .unwrap()
        .then(() => {
          setOpenForm(false);
        });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedEmployee) {
      dispatch(deleteEmployee(selectedEmployee._id))
        .unwrap()
        .then(() => {
          setOpenDeleteDialog(false);
          setSelectedEmployee(null);
        });
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenDeleteDialog(true);
  };

  // Filter employees based on search term if API filtering is not implemented
  const filteredEmployees = employees;
  
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

  // Check if user has permissions
  const canManageUsers = user?.role && ['admin', 'direktur', 'manajer_sdm', 'kepala_cabang'].includes(user.role);
  const canDeleteUsers = user?.role && ['admin', 'direktur', 'manajer_sdm'].includes(user.role);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Daftar Pegawai</CardTitle>
          <CardDescription>
            Kelola data dan hak akses pegawai
          </CardDescription>
        </div>
        {canManageUsers && (
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pegawai
            </Button>
            <DialogContent className="sm:max-w-[825px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedEmployee ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
                </DialogTitle>
                <DialogDescription>
                  {selectedEmployee ? 'Edit data pegawai di bawah ini.' : 'Isi data pegawai di bawah ini.'}
                </DialogDescription>
              </DialogHeader>
              <EmployeeForm
                initialData={selectedEmployee || undefined}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pegawai..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} name={''}            />
          </div>
          <Select
            value={branchFilter}
            onValueChange={setBranchFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Semua Cabang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Cabang</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch._id} value={branch._id}>
                  {branch.namaCabang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Semua Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Role</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role._id} value={role._id}>
                  {role.namaRole}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Employee Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden md:table-cell">Cabang</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Memuat data...</div>
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada data pegawai
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={employee.fotoProfil} 
                            alt={employee.nama}
                          />
                          <AvatarFallback>
                            {employee.nama.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{employee.nama}</span>
                      </div>
                    </TableCell>
                    <TableCell>{employee.username}</TableCell>
                    <TableCell className="hidden md:table-cell">{getRoleName(employee.roleId)}</TableCell>
                    <TableCell className="hidden md:table-cell">{getBranchName(employee.cabangId)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge 
                        variant={employee.aktif ? 'default' : 'destructive'}
                      >
                        {employee.aktif ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewEmployee(employee._id)}
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManageUsers && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenForm(employee)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDeleteUsers && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenDeleteDialog(employee)}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Confirmation Dialog for Delete */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pegawai {selectedEmployee?.nama}?
              Tindakan ini akan menonaktifkan akun pegawai tersebut.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Menghapus...
                </>
              ) : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default EmployeeList;