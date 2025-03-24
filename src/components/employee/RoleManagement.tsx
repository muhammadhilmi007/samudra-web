// src/components/employee/RoleManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useToast } from '@/components/ui/use-toast';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  setSelectedRole,
  clearSelectedRole
} from '../../store/slices/employeeSlice';
import { Role } from '../../types/employee';

// Available permissions with descriptions
const PERMISSIONS: Record<string, Record<string, string>> = {
  dashboard: {
    read_dashboard: 'Melihat dashboard'
  },
  user: {
    manage_users: 'Mengelola pengguna',
    view_users: 'Melihat daftar pengguna',
    create_users: 'Membuat pengguna baru',
    edit_users: 'Mengubah data pengguna',
    delete_users: 'Menghapus pengguna'
  },
  branch: {
    manage_branches: 'Mengelola cabang',
    view_branches: 'Melihat daftar cabang',
    create_branches: 'Membuat cabang baru',
    edit_branches: 'Mengubah data cabang',
    delete_branches: 'Menghapus cabang'
  },
  shipment: {
    manage_shipments: 'Mengelola pengiriman',
    view_shipments: 'Melihat daftar pengiriman',
    create_shipments: 'Membuat pengiriman baru',
    edit_shipments: 'Mengubah data pengiriman',
    delete_shipments: 'Menghapus pengiriman'
  },
  finance: {
    manage_finance: 'Mengelola keuangan',
    view_finance: 'Melihat data keuangan',
    create_invoices: 'Membuat faktur',
    edit_invoices: 'Mengubah faktur',
    delete_invoices: 'Menghapus faktur'
  },
  customer: {
    manage_customers: 'Mengelola pelanggan',
    view_customers: 'Melihat daftar pelanggan',
    create_customers: 'Membuat pelanggan baru',
    edit_customers: 'Mengubah data pelanggan',
    delete_customers: 'Menghapus pelanggan'
  },
  report: {
    manage_reports: 'Mengelola laporan',
    view_reports: 'Melihat laporan',
    create_reports: 'Membuat laporan',
    export_reports: 'Mengekspor laporan'
  }
};

// Validation schema for the role form
const roleFormSchema = z.object({
  namaRole: z.string().min(2, 'Nama role minimal 2 karakter'),
  permissions: z.array(z.string()).min(1, 'Pilih minimal satu permission')
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

const RoleManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { roles, selectedRole, loading } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Setup form
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      namaRole: '',
      permissions: []
    }
  });
  
  // Get all roles on component mount
  useEffect(() => {
    dispatch(getRoles());
  }, [dispatch]);
  
  // Update form when selectedRole changes
  useEffect(() => {
    if (selectedRole) {
      form.reset({
        namaRole: selectedRole.namaRole,
        permissions: selectedRole.permissions
      });
    } else {
      form.reset({
        namaRole: '',
        permissions: []
      });
    }
  }, [selectedRole, form]);
  
  // Check if user has permission to manage roles
  const canManageRoles = user?.role && ['admin', 'direktur', 'manajer_sdm'].includes(user.role);
  
  // Handle role selection
  const handleRoleSelect = (role: Role) => {
    dispatch(setSelectedRole(role));
  };
  
  // Handle form submission
  const onSubmit = (data: RoleFormValues) => {
    if (selectedRole) {
      // Update existing role
      dispatch(updateRole({ id: selectedRole._id, roleData: data }))
        .unwrap()
        .then(() => {
          toast({
            title: 'Success',
            description: 'Role berhasil diperbarui'
          });
          dispatch(clearSelectedRole());
          form.reset();
        })
        .catch((error) => {
          toast({
            title: 'Error',
            description: error.message || 'Gagal memperbarui role',
            variant: 'destructive'
          });
        });
    } else {
      // Create new role
      dispatch(createRole(data))
        .unwrap()
        .then(() => {
          toast({
            title: 'Success',
            description: 'Role berhasil dibuat'
          });
          form.reset();
        })
        .catch((error) => {
          toast({
            title: 'Error',
            description: error.message || 'Gagal membuat role',
            variant: 'destructive'
          });
        });
    }
  };
  
  // Handle role deletion
  const handleDeleteRole = () => {
    if (selectedRole) {
      dispatch(deleteRole(selectedRole._id))
        .unwrap()
        .then(() => {
          toast({
            title: 'Success',
            description: 'Role berhasil dihapus'
          });
          dispatch(clearSelectedRole());
          setIsDeleteDialogOpen(false);
        })
        .catch((error) => {
          toast({
            title: 'Error',
            description: error.message || 'Gagal menghapus role',
            variant: 'destructive'
          });
          setIsDeleteDialogOpen(false);
        });
    }
  };
  
  // Group permissions by category for display
  const permissionsByCategory = Object.entries(PERMISSIONS);
  
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
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Daftar Role</h3>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    dispatch(clearSelectedRole());
                    form.reset({
                      namaRole: '',
                      permissions: []
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Baru
                </Button>
              </div>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {roles.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Belum ada data role
                  </div>
                ) : (
                  roles.map((role) => (
                    <div
                      key={role._id}
                      className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${
                        selectedRole?._id === role._id ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                      onClick={() => handleRoleSelect(role)}
                    >
                      <span>{role.namaRole}</span>
                      <div className="space-x-1">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoleSelect(role);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoleSelect(role);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Role Form */}
            <div className="col-span-12 md:col-span-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="namaRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Role</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan nama role"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <FormLabel>Hak Akses</FormLabel>
                    
                    {permissionsByCategory.map(([category, permissions]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-semibold capitalize">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(permissions).map(([key, label]) => (
                            <FormField
                              key={key}
                              control={form.control}
                              name="permissions"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(key)}
                                      onCheckedChange={(checked) => {
                                        const updatedValue = checked
                                          ? [...field.value, key]
                                          : field.value.filter((value) => value !== key);
                                        field.onChange(updatedValue);
                                      }}
                                      disabled={loading}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        dispatch(clearSelectedRole());
                        form.reset();
                      }}
                      disabled={loading}
                    >
                      Reset
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Menyimpan...
                        </>
                      ) : selectedRole ? 'Perbarui Role' : 'Simpan Role'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive text-destructive-foreground">
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
    </div>
  );
};

export default RoleManagement;