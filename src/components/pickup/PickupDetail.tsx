import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  MapPin, 
  User, 
  Calendar, 
  Package, 
  Truck 
} from 'lucide-react';

interface PickupDetailProps {
  pickupId: string;
  onEdit?: () => void;
}

const PickupDetail: React.FC<PickupDetailProps> = ({ pickupId, onEdit }) => {
  const { pickups } = useSelector((state: RootState) => state.pickup);
  const { customers } = useSelector((state: RootState) => state.customer);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);

  // Find the specific pickup
  const pickup = pickups.find(p => p._id === pickupId);

  // If no pickup found, return null
  if (!pickup) return null;

  // Get sender details
  const sender = customers.find(c => c._id === pickup.pengirimId);

  // Get branch details
  const branch = branches.find(b => b._id === pickup.cabangId);

  // Get user (staff) details
  const user = employees.find(e => e._id === pickup.userId);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd MMMM yyyy, HH:mm', { locale: id });
    } catch (error) {
      return '-';
    }
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50">Menunggu</Badge>;
      case 'FINISH':
        return <Badge variant="outline" className="bg-green-50">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Pickup Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Pengambilan Barang</CardTitle>
          <CardDescription>
            Informasi lengkap tentang proses pengambilan barang
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Tanggal Pengambilan</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(pickup.tanggal)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Alamat Pengambilan</div>
                <div className="text-sm text-muted-foreground">
                  {pickup.alamatPengambilan || '-'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Jumlah Colly</div>
                <div className="text-sm text-muted-foreground">
                  {pickup.jumlahColly || '-'} Colly
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
                  {sender?.nama || '-'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {sender?.telepon || '-'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Cabang</div>
                <div className="text-sm text-muted-foreground">
                  {branch?.namaCabang || '-'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {getStatusBadge(pickup.status)}
                </Badge>
              </div>
              <div>
                <div className="font-medium">Status Pengambilan</div>
                <div className="text-sm text-muted-foreground">
                  {pickup.status === 'PENDING' ? 'Menunggu Proses' : 'Selesai'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Tambahan</CardTitle>
          <CardDescription>
            Detail tambahan terkait pengambilan barang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tujuan</TableHead>
                <TableHead>Dibuat Oleh</TableHead>
                <TableHead>Waktu Dibuat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{pickup.tujuan || '-'}</TableCell>
                <TableCell>{user?.nama || '-'}</TableCell>
                <TableCell>{formatDate(pickup.createdAt)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PickupDetail;