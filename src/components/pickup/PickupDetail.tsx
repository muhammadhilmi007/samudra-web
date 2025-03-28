// src/components/pickup/PickupDetail.tsx
import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { getPickupById } from "../../store/slices/pickupSlice";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import {
  MapPin,
  User,
  Calendar,
  Package,
  Truck,
  Printer,
  Phone,
  Clock,
  AlertCircle,
  Edit,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface PickupDetailProps {
  pickupId: string;
  onEdit?: () => void;
  printable?: boolean;
}

const PickupDetail: React.FC<PickupDetailProps> = ({
  pickupId,
  onEdit,
  printable = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPickup, loading } = useSelector(
    (state: RootState) => state.pickup
  );
  const { customers } = useSelector((state: RootState) => state.customer);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);

  useEffect(() => {
    if (pickupId) {
      dispatch(getPickupById(pickupId));
    }
  }, [dispatch, pickupId]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(parseISO(dateString), "dd MMMM yyyy, HH:mm", {
        locale: id,
      });
    } catch (error) {
      return "-";
    }
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>
        );
      case "FINISH":
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status || "Tidak ada status"}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedPickup) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">
            Data pengambilan tidak ditemukan
          </p>
          <p className="text-sm text-muted-foreground">
            Pengambilan dengan ID {pickupId} tidak tersedia
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get sender details
  const sender = customers.find((c) => c._id === selectedPickup.pengirimId);

  // Get branch details
  const branch = branches.find((b) => b._id === selectedPickup.cabangId);

  // Get user (staff) details
  const user = employees.find((e) => e._id === selectedPickup.userId);

  // Get driver details
  const driver = employees.find((e) => e._id === selectedPickup.supirId);

  // Get assistant details
  const assistant = employees.find((e) => e._id === selectedPickup.kenekId);

  return (
    <div className={`space-y-6 ${printable ? "print:py-0" : ""}`}>
      {/* Pickup Details Card */}
      <Card>
        <CardHeader
          className={`flex flex-row items-start justify-between ${
            printable ? "print:py-3" : ""
          }`}
        >
          <div>
            <CardTitle>
              Detail Pengambilan Barang {selectedPickup.noPengambilan}
            </CardTitle>
            <CardDescription>
              Informasi lengkap tentang proses pengambilan barang
            </CardDescription>
          </div>
          {getStatusBadge(selectedPickup.status)}
        </CardHeader>
        <CardContent className={`${printable ? "print:py-3" : ""}`}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Tanggal Pengambilan</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(selectedPickup.tanggal)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Alamat Pengambilan</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPickup.alamatPengambilan || "-"}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Jumlah Colly</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPickup.jumlahColly || "0"} Colly
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Estimasi Pengambilan</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPickup.estimasiPengambilan || "-"}
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
                    {sender?.nama || "-"}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {sender?.telepon || "-"}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Cabang</div>
                  <div className="text-sm text-muted-foreground">
                    {branch?.namaCabang || "-"}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Supir & Kenek</div>
                  <div className="text-sm text-muted-foreground">
                    Supir: {driver?.nama || "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Kenek: {assistant?.nama || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        {!printable && (
          <CardFooter className="flex justify-end space-x-2 border-t px-6 py-4">
            {onEdit && (
              <Button variant="outlined" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Additional Details Card */}
      <Card>
        <CardHeader className={printable ? "print:py-3" : ""}>
          <CardTitle>Informasi Tambahan</CardTitle>
          <CardDescription>
            Detail tambahan terkait pengambilan barang
          </CardDescription>
        </CardHeader>
        <CardContent className={printable ? "print:py-3" : ""}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tujuan</TableHead>
                <TableHead>Dibuat Oleh</TableHead>
                <TableHead>Waktu Dibuat</TableHead>
                <TableHead>Waktu Berangkat</TableHead>
                <TableHead>Waktu Pulang</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{selectedPickup.tujuan || "-"}</TableCell>
                <TableCell>{user?.nama || "-"}</TableCell>
                <TableCell>{formatDate(selectedPickup.createdAt)}</TableCell>
                <TableCell>
                  {formatDate(selectedPickup.waktuBerangkat)}
                </TableCell>
                <TableCell>{formatDate(selectedPickup.waktuPulang)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* STT List Card (if any) */}
      {selectedPickup.sttIds && selectedPickup.sttIds.length > 0 && (
        <Card>
          <CardHeader className={printable ? "print:py-3" : ""}>
            <CardTitle>Daftar STT</CardTitle>
            <CardDescription>
              Surat Tanda Terima yang terkait dengan pengambilan ini
            </CardDescription>
          </CardHeader>
          <CardContent className={printable ? "print:py-3" : ""}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. STT</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Jumlah Colly</TableHead>
                  <TableHead>Berat</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Jenis Pembayaran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedPickup.sttIds.map((stt: any) => (
                  <TableRow key={stt._id}>
                    <TableCell className="font-medium">{stt.noSTT}</TableCell>
                    <TableCell>{stt.namaBarang}</TableCell>
                    <TableCell>{stt.jumlahColly}</TableCell>
                    <TableCell>{stt.berat} Kg</TableCell>
                    <TableCell>
                      Rp {stt.harga?.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>{stt.paymentType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PickupDetail;
