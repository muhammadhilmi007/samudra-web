// src/components/pickup/PickupRequestDetail.tsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  Package, 
  User, 
  Clock, 
  Building, 
  AlertCircle, 
  ArrowRightCircle, 
  Edit, 
  Trash2,
  Printer,
  Info,
  Loader2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { PickupRequest } from '@/types/pickupRequest';

interface PickupRequestDetailProps {
  pickupRequest: PickupRequest | null;
  loading: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdateStatus?: (status: string, notes?: string) => void;
  onLinkToPickup?: (pickupId: string) => void;
  showActions?: boolean;
}

const PickupRequestDetail: React.FC<PickupRequestDetailProps> = ({
  pickupRequest,
  loading,
  onEdit,
  onDelete,
  onUpdateStatus,
  onLinkToPickup,
  showActions = true
}) => {
  // Format date with Indonesian locale
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (error) {
      return '-';
    }
  };
  
  // Format datetime with Indonesian locale
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy, HH:mm', { locale: id });
    } catch (error) {
      return '-';
    }
  };
  
  // Get status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Menunggu</Badge>;
      case 'FINISH':
        return <Badge variant="success">Selesai</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
    }
  };
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium">Memuat data...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!pickupRequest) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Data tidak ditemukan</p>
          <p className="text-sm text-muted-foreground">
            Permintaan pengambilan tidak tersedia
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">
              {pickupRequest.noRequest ? 
                `Permintaan Pengambilan #${pickupRequest.noRequest}` : 
                'Detail Permintaan Pengambilan'}
            </CardTitle>
            <CardDescription>
              Dibuat pada {formatDateTime(pickupRequest.createdAt)}
            </CardDescription>
          </div>
          <div>
            {getStatusBadge(pickupRequest.status)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Tanggal Permintaan</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(pickupRequest.tanggal)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Cabang</div>
                  <div className="text-sm text-muted-foreground">
                    {pickupRequest.cabang?.namaCabang || '-'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Jumlah Colly</div>
                  <div className="text-sm text-muted-foreground">
                    {pickupRequest.jumlahColly} Colly
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Pengirim</div>
                  <div className="text-sm text-muted-foreground">
                    {pickupRequest.pengirim?.nama || '-'}
                  </div>
                  {pickupRequest.pengirim?.telepon && (
                    <div className="text-xs text-muted-foreground">
                      Telepon: {pickupRequest.pengirim.telepon}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ArrowRightCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Tujuan Pengiriman</div>
                  <div className="text-sm text-muted-foreground">
                    {pickupRequest.tujuan}
                  </div>
                </div>
              </div>
              
              {pickupRequest.estimasiPengambilan && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Estimasi Pengambilan</div>
                    <div className="text-sm text-muted-foreground">
                      {pickupRequest.estimasiPengambilan}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Alamat Pengambilan</h3>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="font-medium">
                {pickupRequest.alamatPengambilan}
              </div>
            </div>
          </div>
          
          {/* Notes Section */}
          {pickupRequest.notes && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Catatan</h3>
                <div className="bg-muted p-3 rounded-md">
                  {pickupRequest.notes}
                </div>
              </div>
            </>
          )}
          
          {/* Linked Pickup Section */}
          {pickupRequest.pickupId && pickupRequest.pickup && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dikaitkan dengan Pengambilan</h3>
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">No. Pengambilan: {pickupRequest.pickup.noPengambilan}</p>
                      {pickupRequest.pickup.waktuBerangkat && (
                        <p className="text-sm text-muted-foreground">
                          Waktu Berangkat: {formatDateTime(pickupRequest.pickup.waktuBerangkat)}
                        </p>
                      )}
                      {pickupRequest.pickup.waktuPulang && (
                        <p className="text-sm text-muted-foreground">
                          Waktu Pulang: {formatDateTime(pickupRequest.pickup.waktuPulang)}
                        </p>
                      )}
                    </div>
                    <Button variant="outlined" size="small" onClick={() => window.open(`/pickup/${pickupRequest.pickupId}`, '_blank')}>
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Additional Info */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informasi Tambahan</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Dibuat Oleh:</span> {pickupRequest.user?.nama || '-'}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Dibuat Pada:</span> {formatDateTime(pickupRequest.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Terakhir Diperbarui:</span> {formatDateTime(pickupRequest.updatedAt)}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Status:</span> {getStatusBadge(pickupRequest.status)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        {showActions && (
          <CardFooter className="flex justify-end space-x-2 border-t px-6 py-4">
            {pickupRequest.status === 'PENDING' && onEdit && (
              <Button variant="text" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            
            {pickupRequest.status === 'PENDING' && onUpdateStatus && (
              <Button 
                variant="text" 
                onClick={() => onUpdateStatus('FINISH')}
              >
                <Info className="h-4 w-4 mr-2" />
                Selesaikan
              </Button>
            )}
            
            {pickupRequest.status === 'PENDING' && onUpdateStatus && (
              <Button 
                variant="text"
                onClick={() => onUpdateStatus('CANCELLED')}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Batalkan
              </Button>
            )}
            
            {pickupRequest.status === 'PENDING' && onDelete && (
              <Button variant="text" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            )}
            
            <Button variant="outlined" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default PickupRequestDetail;