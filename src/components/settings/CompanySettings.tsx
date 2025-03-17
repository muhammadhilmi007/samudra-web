import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RootState, AppDispatch } from '../../store';
import { 
  getDivisions, 
  createDivision, 
  updateDivision 
} from '../../store/slices/divisionSlice';
import { 
  getBranches, 
  createBranch, 
  updateBranch 
} from '../../store/slices/branchSlice';
import { useToast } from '@/components/ui/use-toast';

const CompanySettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const { divisions } = useSelector((state: RootState) => state.division);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);

  const [divisionForm, setDivisionForm] = useState({
    id: '',
    namaDivisi: ''
  });

  const [branchForm, setBranchForm] = useState({
    id: '',
    namaCabang: '',
    divisiId: '',
    alamat: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    provinsi: '',
    kontakPenanggungJawab: {
      nama: '',
      telepon: '',
      email: ''
    }
  });

  useEffect(() => {
    dispatch(getDivisions());
    dispatch(getBranches());
  }, [dispatch]);

  // Cek izin akses ke pengaturan perusahaan
  const canManageCompanySettings = user?.role && [
    'admin', 
    'direktur', 
    'manajerAdministrasi'
  ].includes(user.role);

  if (!canManageCompanySettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses Ditolak</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Anda tidak memiliki izin untuk mengakses pengaturan perusahaan.</p>
        </CardContent>
      </Card>
    );
  }

  const handleDivisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (divisionForm.id) {
        // Update existing division
        await dispatch(updateDivision({
          id: divisionForm.id,
          divisionData: { namaDivisi: divisionForm.namaDivisi }
        })).unwrap();
        toast({
          title: 'Berhasil',
          description: 'Divisi berhasil diperbarui',
        });
      } else {
        // Create new division
        await dispatch(createDivision({ 
          namaDivisi: divisionForm.namaDivisi 
        })).unwrap();
        toast({
          title: 'Berhasil',
          description: 'Divisi baru berhasil dibuat',
        });
      }
      // Reset form
      setDivisionForm({ id: '', namaDivisi: '' });
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menyimpan divisi',
        variant: 'destructive',
      });
    }
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (branchForm.id) {
        // Update existing branch
        await dispatch(updateBranch({
          id: branchForm.id,
          branchData: { 
            ...branchForm,
            divisiId: branchForm.divisiId
          }
        })).unwrap();
        toast({
          title: 'Berhasil',
          description: 'Cabang berhasil diperbarui',
        });
      } else {
        // Create new branch
        await dispatch(createBranch({
          ...branchForm,
          divisiId: branchForm.divisiId
        })).unwrap();
        toast({
          title: 'Berhasil',
          description: 'Cabang baru berhasil dibuat',
        });
      }
      // Reset form
      setBranchForm({
        id: '',
        namaCabang: '',
        divisiId: '',
        alamat: '',
        kelurahan: '',
        kecamatan: '',
        kota: '',
        provinsi: '',
        kontakPenanggungJawab: {
          nama: '',
          telepon: '',
          email: ''
        }
      });
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menyimpan cabang',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Manajemen Divisi */}
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Divisi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDivisionSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Nama Divisi</label>
              <Input 
                value={divisionForm.namaDivisi}
                onChange={(e) => setDivisionForm(prev => ({
                  ...prev, 
                  namaDivisi: e.target.value 
                }))}
                placeholder="Masukkan nama divisi"
              />
            </div>
            <Button type="submit">
              {divisionForm.id ? 'Perbarui Divisi' : 'Tambah Divisi'}
            </Button>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Daftar Divisi</h3>
            <div className="grid grid-cols-3 gap-4">
              {divisions.map((division) => (
                <div 
                  key={division._id} 
                  className="border p-4 rounded-lg"
                >
                  <p className="font-medium">{division.namaDivisi}</p>
                  <div className="mt-2 flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setDivisionForm({
                        id: division._id,
                        namaDivisi: division.namaDivisi
                      })}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manajemen Cabang */}
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBranchSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Nama Cabang</label>
              <Input 
                value={branchForm.namaCabang}
                onChange={(e) => setBranchForm(prev => ({
                  ...prev, 
                  namaCabang: e.target.value 
                }))}
                placeholder="Masukkan nama cabang"
              />
            </div>

            <div>
              <label className="block mb-2">Divisi</label>
              <Select 
                value={branchForm.divisiId}
                onValueChange={(value) => setBranchForm(prev => ({
                  ...prev, 
                  divisiId: value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Divisi" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((division) => (
                    <SelectItem 
                      key={division._id} 
                      value={division._id}
                    >
                      {division.namaDivisi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Alamat</label>
                <Input 
                  value={branchForm.alamat}
                  onChange={(e) => setBranchForm(prev => ({
                    ...prev, 
                    alamat: e.target.value 
                  }))}
                  placeholder="Alamat"
                />
              </div>
              <div>
                <label className="block mb-2">Kelurahan</label>
                <Input 
                  value={branchForm.kelurahan}
                  onChange={(e) => setBranchForm(prev => ({
                    ...prev, 
                    kelurahan: e.target.value 
                  }))}
                  placeholder="Kelurahan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Kecamatan</label>
                <Input 
                  value={branchForm.kecamatan}
                  onChange={(e) => setBranchForm(prev => ({
                    ...prev, 
                    kecamatan: e.target.value 
                  }))}
                  placeholder="Kecamatan"
                />
              </div>
              <div>
                <label className="block mb-2">Kota</label>
                <Input 
                  value={branchForm.kota}
                  onChange={(e) => setBranchForm(prev => ({
                    ...prev, 
                    kota: e.target.value 
                  }))}
                  placeholder="Kota"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Provinsi</label>
                <Input 
                  value={branchForm.provinsi}
                  onChange={(e) => setBranchForm(prev => ({
                    ...prev, 
                    provinsi: e.target.value 
                  }))}
                  placeholder="Provinsi"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Nama Penanggung Jawab</label>
                <Input 
                  value={branchForm.kontakPenanggungJawab.nama}
                  onChange={(e) => setBranchForm(prev => ({
                    ...prev, 
                    kontakPenanggungJawab: {
                      ...prev.kontakPenanggungJawab,
                      nama: e.target.value 
                    }
                  }))}
                  placeholder="Nama kontak"
                />
              </div>
              <div>
                <label className="block mb-2">Telepon Penanggung Jawab</label>
                <Input 
                  value={branchForm.kontakPenanggungJawab.telepon}
                  onChange={(e) => setBranchForm(prev => ({
                    ...prev, 
                    kontakPenanggungJawab: {
                      ...prev.kontakPenanggungJawab,
                      telepon: e.target.value 
                    }
                  }))}
                  placeholder="Nomor telepon"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">Email Penanggung Jawab</label>
              <Input 
                value={branchForm.kontakPenanggungJawab.email}
                onChange={(e) => setBranchForm(prev => ({
                  ...prev, 
                  kontakPenanggungJawab: {
                    ...prev.kontakPenanggungJawab,
                    email: e.target.value 
                  }
                }))}
                placeholder="Email kontak"
                type="email"
              />
            </div>

            <Button type="submit">
              {branchForm.id ? 'Perbarui Cabang' : 'Tambah Cabang'}
            </Button>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Daftar Cabang</h3>
            <div className="grid grid-cols-3 gap-4">
              {branches.map((branch) => (
                <div 
                  key={branch._id} 
                  className="border p-4 rounded-lg"
                >
                  <p className="font-medium">{branch.namaCabang}</p>
                  <p className="text-sm text-muted-foreground">
                    {branch.divisi ? branch.divisi.namaDivisi : 'Tidak ada divisi'}
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setBranchForm({
                        id: branch._id,
                        namaCabang: branch.namaCabang,
                        divisiId: branch.divisiId,
                        alamat: branch.alamat || '',
                        kelurahan: branch.kelurahan || '',
                        kecamatan: branch.kecamatan || '',
                        kota: branch.kota || '',
                        provinsi: branch.provinsi || '',
                        kontakPenanggungJawab: {
                          nama: branch.kontakPenanggungJawab?.nama || '',
                          telepon: branch.kontakPenanggungJawab?.telepon || '',
                          email: branch.kontakPenanggungJawab?.email || ''
                        }
                      })}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySettings;