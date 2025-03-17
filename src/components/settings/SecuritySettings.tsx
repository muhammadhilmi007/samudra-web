import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RootState, AppDispatch } from '../../store';
import { getRoles, createRole, updateRole, deleteRole } from '../../store/slices/employeeSlice';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Edit } from 'lucide-react';

// Daftar permission yang tersedia
const ALL_PERMISSIONS = [
  'read_dashboard',
  'manage_users',
  'manage_branches',
  'manage_shipments',
  'manage_finance',
  'manage_inventory',
  'manage_customers',
  'manage_reports',
  'create_stt',
  'update_stt',
  'delete_stt',
  'create_invoice',
  'update_invoice',
  'delete_invoice',
  // Tambahkan permission lain sesuai kebutuhan
];

const SecuritySettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const { roles } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);

  const [roleForm, setRoleForm] = useState({
    id: '',
    namaRole: '',
    permissions: [] as string[]
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30); // menit

  useEffect(() => {
    dispatch(getRoles());
  }, [dispatch]);

  // Cek izin akses ke pengaturan keamanan
  const canManageSecuritySettings = user?.role && [
    'admin', 
    'direktur', 
    'manajerSDM'
  ].includes(user.role);

  if (!canManageSecuritySettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses Ditolak</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Anda tidak memiliki izin untuk mengakses pengaturan keamanan.</p>
        </CardContent>
      </Card>
    );
  }

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (roleForm.id) {
        // Update existing role
        await dispatch(updateRole({
          id: roleForm.id,
          roleData: { 
            namaRole: roleForm.namaRole,
            permissions: roleForm.permissions 
          }
        })).unwrap();
        toast({
          title: 'Berhasil',
          description: 'Role berhasil diperbarui',
        });
      } else {
        // Create new role
        await dispatch(createRole({ 
          namaRole: roleForm.namaRole,
          permissions: roleForm.permissions 
        })).unwrap();
        toast({
          title: 'Berhasil',
          description: 'Role baru berhasil dibuat',
        });
      }
      // Reset form
      setRoleForm({
        id: '',
        namaRole: '',
        permissions: []
      });
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menyimpan role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await dispatch(deleteRole(id)).unwrap();
      toast({
        title: 'Berhasil',
        description: 'Role berhasil dihapus',
      });
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menghapus role',
        variant: 'destructive',
      });
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Manajemen Role & Permission */}
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Role & Permission</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRoleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Nama Role</label>
              <Input 
                value={roleForm.namaRole}
                onChange={(e) => setRoleForm(prev => ({
                  ...prev, 
                  namaRole: e.target.value 
                }))}
                placeholder="Masukkan nama role"
              />
            </div>

            <div>
              <label className="block mb-2">Permissions</label>
              <div className="grid grid-cols-3 gap-4">
                {ALL_PERMISSIONS.map((permission) => (
                  <div 
                    key={permission} 
                    className="flex items-center space-x-2"
                  >
                    <Switch 
                      checked={roleForm.permissions.includes(permission)}
                      onCheckedChange={() => handlePermissionToggle(permission)}
                    />
                    <label>{permission.replace(/_/g, ' ')}</label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit">
              {roleForm.id ? 'Perbarui Role' : 'Tambah Role'}
            </Button>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Daftar Role</h3>
            <div className="grid grid-cols-3 gap-4">
              {roles.map((role) => (
                <div 
                  key={role._id} 
                  className="border p-4 rounded-lg"
                >
                  <p className="font-medium">{role.namaRole}</p>
                  <div className="text-sm text-muted-foreground mt-2">
                    Permissions: {role.permissions.length} dipilih
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setRoleForm({
                        id: role._id,
                        namaRole: role.namaRole,
                        permissions: role.permissions
                      })}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteRole(role._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pengaturan Keamanan Tambahan */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Keamanan Tambahan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label>Autentikasi Dua Faktor</label>
            <Switch 
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>

          <div>
            <label className="block mb-2">Waktu Sesi (menit)</label>
            <Select 
              value={sessionTimeout.toString()}
              onValueChange={(value) => setSessionTimeout(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih waktu sesi" />
              </SelectTrigger>
              <SelectContent>
                {[15, 30, 45, 60, 90, 120].map((duration) => (
                  <SelectItem 
                    key={duration} 
                    value={duration.toString()}
                  >
                    {duration} menit
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="secondary">
            Simpan Pengaturan Keamanan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;