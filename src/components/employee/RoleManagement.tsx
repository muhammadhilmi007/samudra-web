// src/components/employee/RoleManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,

} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Checkbox } from '@radix-ui/react-checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from '../../store/slices/employeeSlice';
import { Role } from '../../types/employee';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';

// Available permissions with descriptions
const PERMISSIONS = {
  // Dashboard
  read_dashboard: 'Melihat dashboard',
  
  // User Management
  manage_users: 'Mengelola pengguna',
  view_users: 'Melihat daftar pengguna',
  create_users: 'Membuat pengguna baru',
  edit_users: 'Mengubah data pengguna',
  delete_users: 'Menghapus pengguna',
  
  // Branch Management
  manage_branches: 'Mengelola cabang',
  view_branches: 'Melihat daftar cabang',
  create_branches: 'Membuat cabang baru',
  edit_branches: 'Mengubah data cabang',
  delete_branches: 'Menghapus cabang',
  
  // Shipment Management
  manage_shipments: 'Mengelola pengiriman',
  view_shipments: 'Melihat daftar pengiriman',
  create_shipments: 'Membuat pengiriman baru',
  edit_shipments: 'Mengubah data pengiriman',
  delete_shipments: 'Menghapus pengiriman',
  
  // Finance Management
  manage_finance: 'Mengelola keuangan',
  view_finance: 'Melihat data keuangan',
  create_invoices: 'Membuat faktur',
  edit_invoices: 'Mengubah faktur',
  delete_invoices: 'Menghapus faktur',
  
  // Customer Management
  manage_customers: 'Mengelola pelanggan',
  view_customers: 'Melihat daftar pelanggan',
  create_customers: 'Membuat pelanggan baru',
  edit_customers: 'Mengubah data pelanggan',
  delete_customers: 'Menghapus pelanggan',
  
  // Report Management
  manage_reports: 'Mengelola laporan',
  view_reports: 'Melihat laporan',
  create_reports: 'Membuat laporan',
  export_reports: 'Mengekspor laporan',
};

const RoleManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { roles, loading: reduxLoading } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Local loading state for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Error boundary effect
  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error,
      });
      setError(null);
    }
  }, [error, toast]);

  // Check if user has permission to manage roles
  const canManageRoles = user?.role && ['admin', 'direktur', 'manajerSDM'].includes(user.role);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        await dispatch(getRoles()).unwrap();
      } catch (error: any) {
        setError(error.message || 'Gagal memuat daftar role');
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [dispatch]);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.namaRole);
    setSelectedPermissions(role.permissions);
  };

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Nama role tidak boleh kosong',
      });
      return;
    }

    if (selectedPermissions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Pilih minimal satu hak akses',
      });
      return;
    }

    try {
      if (selectedRole) {
        await dispatch(updateRole({
          id: selectedRole._id,
          roleData: {
            namaRole: roleName,
            permissions: selectedPermissions,
          }
        })).unwrap();
        toast({
          title: 'Berhasil',
          description: 'Role berhasil diperbarui',
        });
      } else {
        await dispatch(createRole({
          namaRole: roleName,
          permissions: selectedPermissions,
        })).unwrap();
        toast({
          title: 'Berhasil',
          description: 'Role baru berhasil dibuat',
        });
      }
      
      // Reset form
      setSelectedRole(null);
      setRoleName('');
      setSelectedPermissions([]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal menyimpan role';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Pilih role yang akan dihapus',
      });
      return;
    }

    try {
      await dispatch(deleteRole(selectedRole._id)).unwrap();
      toast({
        title: 'Berhasil',
        description: 'Role berhasil dihapus',
      });
      setSelectedRole(null);
      setRoleName('');
      setSelectedPermissions([]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Gagal menghapus role';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Group permissions by category
  const permissionCategories = Object.entries(PERMISSIONS).reduce((acc, [key, value]) => {
    const category = key.split('_')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ key, value });
    return acc;
  }, {} as Record<string, { key: string; value: string }[]>);

  if (!canManageRoles) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses Ditolak</CardTitle>
          <CardDescription>
            Anda tidak memiliki izin untuk mengakses manajemen role.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Role & Hak Akses</CardTitle>
          <CardDescription>
            Kelola role dan hak akses pengguna sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-6">
            {/* Role List */}
            <div className="col-span-12 md:col-span-4 space-y-4">
              <div className="font-semibold">Daftar Role</div>
              <div className="space-y-2">
                {roles.map(role => (
                  <div
                    key={role._id}
                    className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${selectedRole?._id === role._id ? 'bg-primary/10' : 'hover:bg-muted'}`}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <span>{role.namaRole}</span>
                    <div className="space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleSelect(role);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRole(role);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedRole(null);
                  setRoleName('');
                  setSelectedPermissions([]);
                }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    Memuat...
                  </div>
                ) : (
                  'Tambah Role Baru'
                )}
              </Button>
            </div>

            {/* Role Form */}
            <div className="col-span-12 md:col-span-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Nama Role</Label>
                  <Input
                    id="roleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Masukkan nama role"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Hak Akses</Label>
                  {Object.entries(permissionCategories).map(([category, permissions]) => (
                    <div key={category} className="space-y-2">
                      <div className="font-semibold capitalize">{category}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permissions.map(({ key, value }) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={key}
                              checked={selectedPermissions.includes(key)}
                              onCheckedChange={() => handlePermissionToggle(key)}
                            />
                            <label
                              htmlFor={key}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {value}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="submit" disabled={loading || !roleName.trim()}>
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        Menyimpan...
                      </div>
                    ) : selectedRole ? 'Perbarui Role' : 'Simpan Role'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Role</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus role ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Menghapus...
                </div>
              ) : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleManagement;