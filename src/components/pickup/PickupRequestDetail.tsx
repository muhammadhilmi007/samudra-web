// src/components/pickup/PickupRequestDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
  DialogActions,
  DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Truck, 
  MapPin, 
  Package, 
  Calendar, 
  CheckCircle, 
  User, 
  Phone, 
  Building, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { 
  getPickupRequestById, 
  updatePickupRequestStatus,
  createPickup 
} from '../../store/slices/pickupRequestSlice';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PickupRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { pickupRequest, loading } = useSelector((state: RootState) => state.pickupRequest);
  const { user } = useSelector((state: RootState) => state.auth);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { employees } = useSelector((state: RootState) => state.employee);

  const [error, setError] = useState<string | null>(null);
  const [openCreatePickupDialog, setOpenCreatePickupDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [pickupFormData, setPickupFormData] = useState({
    supirId: '',
    kenekId: '',
    kendaraanId: '',
    estimasiPengambilan: '',
    alamatPengambilan: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getPickupRequestById(id))
        .unwrap()
        .catch((err) => {
          setError(err.message || 'Gagal memuat detail permintaan pengambilan');
        });
    }
  }, [id, dispatch]);

  useEffect(() => {
    // Pre-fill form when pickup request is loaded
    if (pickupRequest) {
      setPickupFormData(prev => ({
        ...prev,
        alamatPengambilan: pickupRequest.alamatPengambilan || ''
      }));
    }
  }, [pickupRequest]);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy, HH:mm', { locale: id });
    } catch (error) {
      return '-';
    }
  };

  // Check permissions to manage pickup requests
  const canManagePickupRequest = user?.role && [
    'admin', 
    'direktur',
    'manajerOperasional', 
    'kepalaGudang', 
    'stafOperasional'
  ].includes(user.role);

  // Handle updating status
  const handleUpdateStatus = async () => {
    if (!id) return;
    
    setProcessingAction(true);
    try {
      await dispatch(updatePickupRequestStatus({ 
        id, 
        status: 'FINISH' 
      })).unwrap();
      
      toast({
        title: 'Berhasil',
        description: 'Status permintaan pengambilan berhasil diubah menjadi selesai',
      });

      setOpenConfirmDialog(false);
      navigate(-1);
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal memperbarui status',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!pickupFormData.supirId) {
      errors.supirId = 'Supir harus dipilih';
    }
    
    if (!pickupFormData.kendaraanId) {
      errors.kendaraanId = 'Kendaraan harus dipilih';
    }
    
    if (!pickupFormData.estimasiPengambilan) {
      errors.estimasiPengambilan = 'Estimasi pengambilan harus diisi';
    }
    
    if (!pickupFormData.alamatPengambilan) {
      errors.alamatPengambilan = 'Alamat pengambilan harus diisi';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle creating pickup
  const handleCreatePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setProcessingAction(true);
    try {
      if (!pickupRequest) throw new Error('Data permintaan tidak ditemukan');
      
      await dispatch(createPickup({
        pengirimId: pickupRequest.pengirimId,
        sttIds: [], 
        supirId: pickupFormData.supirId,
        kenekId: pickupFormData.kenekId || undefined,
        kendaraanId: pickupFormData.kendaraanId,
        alamatPengambilan: pickupFormData.alamatPengambilan,
        estimasiPengambilan: pickupFormData.estimasiPengambilan,
        cabangId: user?.cabangId || pickupRequest.cabangId,
        tujuan: pickupRequest.tujuan,
        jumlahColly: pickupRequest.jumlahColly
      })).unwrap();

      // Update pickup request status
      await dispatch(updatePickupRequestStatus({ 
        id: id!, 
        status: 'FINISH' 
      })).unwrap();

      toast({
        title: 'Berhasil',
        description: 'Pengambilan berhasil dibuat dan status permintaan diperbarui',
      });

      setOpenCreatePickupDialog(false);
      navigate('/pickup');
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal membuat pengambilan',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
    }
  };

  if (!canManagePickupRequest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses Ditolak</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tidak Diizinkan</AlertTitle>
            <AlertDescription>
              Anda tidak memiliki izin untuk melihat detail permintaan pengambilan.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p>Memuat detail permintaan pengambilan...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !pickupRequest) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Kesalahan</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="standard">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Tidak Ditemukan</AlertTitle>
              <AlertDescription>
                {error || 'Permintaan pengambilan tidak ditemukan'}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outlined" 
            size="small" 
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
              variant="outlined"
              onClick={() => setOpenCreatePickupDialog(true)}
            >
              <Truck className="mr-2 h-4 w-4" />
              Buat Pengambilan
            </Button>
            <Button 
              variant="text"
              onClick={() => setOpenConfirmDialog(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Selesaikan Permintaan
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Informasi Permintaan</CardTitle>
            <CardDescription>
              Detail permintaan pengambilan barang oleh pelanggan
            </CardDescription>
          </div>
          <Badge className={
            pickupRequest.status === 'PENDING' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }>
            {pickupRequest.status === 'PENDING' ? 'Menunggu' : 'Selesai'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Tanggal Permintaan</div>
                  <div className="font-medium">{formatDate(pickupRequest.tanggal)}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Alamat Pengambilan</div>
                  <div className="font-medium">{pickupRequest.alamatPengambilan}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Jumlah Colly</div>
                  <div className="font-medium">{pickupRequest.jumlahColly} Colly</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Pengirim</div>
                  <div className="font-medium">{pickupRequest.pengirim?.nama || 'Tidak tersedia'}</div>
                  <div className="text-xs flex items-center">
                    <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">{pickupRequest.pengirim?.telepon || 'Tidak tersedia'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Cabang</div>
                  <div className="font-medium">{pickupRequest.cabang?.namaCabang || 'Tidak tersedia'}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Tujuan</div>
                  <div className="font-medium">{pickupRequest.tujuan}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium mb-2">Alamat Lengkap Pengirim</h3>
              <p className="text-muted-foreground">
                {pickupRequest.pengirim?.alamat || 'Tidak tersedia'}
              </p>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Informasi Tambahan</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Dibuat Oleh</TableCell>
                    <TableCell>{pickupRequest.user?.nama || '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Waktu Dibuat</TableCell>
                    <TableCell>{formatDate(pickupRequest.createdAt)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Terakhir Diperbarui</TableCell>
                    <TableCell>{formatDate(pickupRequest.updatedAt)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Buat Pengambilan */}
      <Dialog 
        open={openCreatePickupDialog} 
        onOpenChange={setOpenCreatePickupDialog}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Buat Pengambilan</DialogTitle>
            <DialogDescription>
              Isi data untuk membuat proses pengambilan barang
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreatePickup} className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alamatPengambilan">Alamat Pengambilan</Label>
                <Input
                  id="alamatPengambilan"
                  value={pickupFormData.alamatPengambilan}
                  onChange={(e) => setPickupFormData(prev => ({
                    ...prev,
                    alamatPengambilan: e.target.value
                  }))}
                  className={formErrors.alamatPengambilan ? "border-destructive" : ""} name={''}                />
                {formErrors.alamatPengambilan && (
                  <p className="text-sm text-destructive">{formErrors.alamatPengambilan}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supirId">Supir</Label>
                <Select 
                  value={pickupFormData.supirId}
                  onValueChange={(value) => setPickupFormData(prev => ({
                    ...prev, 
                    supirId: value 
                  }))}
                >
                  <SelectTrigger className={formErrors.supirId ? "border-destructive" : ""}>
                    <SelectValue placeholder="Pilih Supir" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => 
                        emp.jabatan?.toLowerCase().includes('supir') && 
                        (!user?.cabangId || emp.cabangId === user?.cabangId)
                      )
                      .map(emp => (
                        <SelectItem key={emp._id} value={emp._id}>
                          {emp.nama}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                {formErrors.supirId && (
                  <p className="text-sm text-destructive">{formErrors.supirId}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kenekId">Kenek (Opsional)</Label>
                <Select 
                  value={pickupFormData.kenekId}
                  onValueChange={(value) => setPickupFormData(prev => ({
                    ...prev, 
                    kenekId: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kenek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak Ada Kenek</SelectItem>
                    {employees
                      .filter(emp => 
                        emp.jabatan?.toLowerCase().includes('kenek') && 
                        (!user?.cabangId || emp.cabangId === user?.cabangId)
                      )
                      .map(emp => (
                        <SelectItem key={emp._id} value={emp._id}>
                          {emp.nama}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kendaraanId">Kendaraan</Label>
                <Select 
                  value={pickupFormData.kendaraanId}
                  onValueChange={(value) => setPickupFormData(prev => ({
                    ...prev, 
                    kendaraanId: value 
                  }))}
                >
                  <SelectTrigger className={formErrors.kendaraanId ? "border-destructive" : ""}>
                    <SelectValue placeholder="Pilih Kendaraan" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles
                      .filter(vehicle => 
                        vehicle.tipe === 'lansir' && 
                        (!user?.cabangId || vehicle.cabangId === user?.cabangId)
                      )
                      .map(vehicle => (
                        <SelectItem key={vehicle._id} value={vehicle._id}>
                          {vehicle.namaKendaraan} - {vehicle.noPolisi}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                {formErrors.kendaraanId && (
                  <p className="text-sm text-destructive">{formErrors.kendaraanId}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimasiPengambilan">Estimasi Pengambilan</Label>
                <Input
                  id="estimasiPengambilan"
                  value={pickupFormData.estimasiPengambilan}
                  onChange={(e) => setPickupFormData(prev => ({
                    ...prev,
                    estimasiPengambilan: e.target.value
                  }))}
                  placeholder="Contoh: 2 jam"
                  className={formErrors.estimasiPengambilan ? "border-destructive" : ""} name={''}                />
                {formErrors.estimasiPengambilan && (
                  <p className="text-sm text-destructive">{formErrors.estimasiPengambilan}</p>
                )}
              </div>
            </div>
            
            <DialogActions>
              <Button 
                type="button" 
                variant="outlined"
                onClick={() => setOpenCreatePickupDialog(false)}
                disabled={processingAction}
              >
                Batal
              </Button>
              <Button 
                type="submit"
                disabled={processingAction}
              >
                {processingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Buat Pengambilan'
                )}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog for Completing Request */}
      <Dialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Selesaikan Permintaan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyelesaikan permintaan pengambilan ini tanpa membuat pengambilan?
              Ini akan menandai permintaan ini sebagai selesai.
            </DialogDescription>
          </DialogHeader>
          <DialogActions>
            <Button 
              variant="outlined" 
              onClick={() => setOpenConfirmDialog(false)}
              disabled={processingAction}
            >
              Batal
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={processingAction}
            >
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Selesaikan Permintaan'
              )}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PickupRequestDetailPage;

