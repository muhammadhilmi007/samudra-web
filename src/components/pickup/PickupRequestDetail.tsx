import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogTrigger 
} from '@/components/ui/dialog';
import { ArrowLeft, Truck, MapPin, Package, Calendar, CheckCircle } from 'lucide-react';
import { RootState, AppDispatch } from '../../../store';
import { 
  getPickupRequestById, 
  updatePickupRequestStatus,
  createPickup 
} from '../../../store/slices/pickupRequestSlice';
import { formatDate } from '../../../utils/formatting';
import { useToast } from '@/components/ui/use-toast';

const PickupRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { pickupRequest } = useSelector((state: RootState) => state.pickupRequest);
  const { user } = useSelector((state: RootState) => state.auth);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { employees } = useSelector((state: RootState) => state.employee);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreatePickupDialog, setOpenCreatePickupDialog] = useState(false);
  const [pickupFormData, setPickupFormData] = useState({
    supirId: '',
    kenekId: '',
    kendaraanId: '',
    estimasiPengambilan: ''
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      dispatch(getPickupRequestById(id))
        .unwrap()
        .catch((err) => {
          setError(err.message || 'Gagal memuat detail permintaan pengambilan');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, dispatch]);

  // Cek izin akses ke detail permintaan pengambilan
  const canManagePickupRequest = user?.role && [
    'admin', 
    'manajerOperasional', 
    'kepalaGudang', 
    'stafOperasional'
  ].includes(user.role);

  const handleUpdateStatus = async (status: 'PENDING' | 'FINISH') => {
    try {
      await dispatch(updatePickupRequestStatus({ 
        id: id!, 
        status 
      })).unwrap();
      
      toast({
        title: 'Berhasil',
        description: `Status permintaan pengambilan berhasil diubah menjadi ${status}`,
      });

      // Refresh data atau navigate
      navigate('/pickup');
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal memperbarui status',
        variant: 'destructive',
      });
    }
  };

  const handleCreatePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createPickup({
        pengirimId: pickupRequest?.pengirimId || '',
        sttIds: [], // TODO: Implement STT creation logic
        supirId: pickupFormData.supirId,
        kenekId: pickupFormData.kenekId,
        kendaraanId: pickupFormData.kendaraanId,
        estimasiPengambilan: pickupFormData.estimasiPengambilan,
        cabangId: user?.cabangId || ''
      })).unwrap();

      // Update pickup request status
      await dispatch(updatePickupRequestStatus({ 
        id: id!, 
        status: 'FINISH' 
      })).unwrap();

      toast({
        title: 'Berhasil',
        description: 'Pengambilan berhasil dibuat',
      });

      setOpenCreatePickupDialog(false);
      navigate('/pickup');
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal membuat pengambilan',
        variant: 'destructive',
      });
    }
  };

  if (!canManagePickupRequest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses Ditolak</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Anda tidak memiliki izin untuk melihat detail permintaan pengambilan.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <p>Memuat detail permintaan pengambilan...</p>
      </div>
    );
  }

  if (error || !pickupRequest) {
    return (
      <div className="container mx-auto py-6">
        <Card variant="destructive">
          <CardHeader>
            <CardTitle>Kesalahan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Permintaan pengambilan tidak ditemukan'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            Detail Permintaan Pengambilan
          </h2>
        </div>
        {pickupRequest.status === 'PENDING' && (
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setOpenCreatePickupDialog(true)}
            >
              <Truck className="mr-2 h-4 w-4" />
              Buat Pengambilan
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleUpdateStatus('FINISH')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Selesaikan Permintaan
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Permintaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tanggal</p>
                <p className="font-medium">{formatDate(pickupRequest.tanggal)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Jumlah Colly</p>
                <p className="font-medium">{pickupRequest.jumlahColly}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Alamat Pengambilan</p>
                <p className="font-medium">{pickupRequest.alamatPengambilan}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p 
                className={`font-medium ${
                  pickupRequest.status === 'PENDING' 
                    ? 'text-yellow-600' 
                    : 'text-green-600'
                }`}
              >
                {pickupRequest.status === 'PENDING' 
                  ? 'Menunggu Diproses' 
                  : 'Selesai'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail Pengirim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama Pengirim</p>
              <p className="font-medium">
                {pickupRequest.pengirim?.nama || 'Tidak tersedia'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telepon</p>
              <p className="font-medium">
                {pickupRequest.pengirim?.telepon || 'Tidak tersedia'}
              </p>
            </div>
            <div className="col-span-full">
              <p className="text-sm text-muted-foreground">Alamat</p>
              <p className="font-medium">
                {pickupRequest.pengirim?.alamat || 'Tidak tersedia'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Buat Pengambilan */}
      <Dialog 
        open={openCreatePickupDialog} 
        onOpenChange={setOpenCreatePickupDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Pengambilan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePickup} className="space-y-4">
            <div>
              <label className="block mb-2">Supir</label>
              <select 
                value={pickupFormData.supirId}
                onChange={(e) => setPickupFormData(prev => ({
                  ...prev, 
                  supirId: e.target.value 
                }))}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Pilih Supir</option>
                {employees
                  .filter(emp => 
                    emp.jabatan.toLowerCase().includes('supir') && 
                    emp.cabangId === user?.cabangId
                  )
                  .map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.nama}
                    </option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="block mb-2">Kenek</label>
              <select 
                value={pickupFormData.kenekId}
                onChange={(e) => setPickupFormData(prev => ({
                  ...prev, 
                  kenekId: e.target.value 
                }))}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Pilih Kenek</option>
                {employees
                  .filter(emp => 
                    emp.jabatan.toLowerCase().includes('kenek') && 
                    emp.cabangId === user?.cabangId
                  )
                  .map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.nama}
                    </option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="block mb-2">Kendaraan</label>
              <select 
                value={pickupFormData.kendaraanId}
                onChange={(e) => setPickupFormData(prev => ({
                  ...prev, 
                  kendaraanId: e.target.value 
                }))}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Pilih Kendaraan</option>
                {vehicles
                  .filter(vehicle => 
                    vehicle.tipe === 'Lansir' && 
                    vehicle.cabangId === user?.cabangId
                  )
                  .map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.namaKendaraan} - {vehicle.noPolisi}
                    </option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="block mb-2">Estimasi Pengambilan</label>
              <input 
                type="text"
                value={pickupFormData.estimasiPengambilan}
                onChange={(e) => setPickupFormData(prev => ({
                  ...prev, 
                  estimasiPengambilan: e.target.value 
                }))}
                className="w-full border rounded p-2"
                placeholder="Contoh: 2 jam"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setOpenCreatePickupDialog(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                Buat Pengambilan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PickupRequestDetailPage;