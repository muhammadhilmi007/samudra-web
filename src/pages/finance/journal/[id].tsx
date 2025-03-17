import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { RootState, AppDispatch } from "../../../store";
import { getJournalById } from "../../../store/slices/financeSlice";
import { formatCurrency, formatDate } from "../../../utils/formatting";

const JournalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentJournal } = useSelector((state: RootState) => state.finance);
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      dispatch(getJournalById(id))
        .unwrap()
        .catch((err) => {
          setError(err.message || "Gagal memuat detail jurnal");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, dispatch]);

  // Cek izin akses ke detail jurnal
  const canAccessJournalDetail =
    user?.role &&
    ["admin", "direktur", "manajerKeuangan", "stafKeuangan", "kasir"].includes(
      user.role
    );

  if (!canAccessJournalDetail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses Ditolak</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Anda tidak memiliki izin untuk melihat detail jurnal.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <p>Memuat detail jurnal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card variant="destructive">
          <CardHeader>
            <CardTitle>Kesalahan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentJournal) {
    return (
      <div className="container mx-auto py-6">
        <p>Jurnal tidak ditemukan.</p>
      </div>
    );
  }

  const handlePrintJournal = () => {
    window.print();
  };

  const handleExportJournal = () => {
    // TODO: Implement journal export functionality
    console.log("Export jurnal");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Detail Jurnal</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrintJournal}>
            <FileText className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          <Button variant="outline" onClick={handleExportJournal}>
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Jurnal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nomor Jurnal</p>
              <p className="font-medium">
                {currentJournal.id || "Tidak tersedia"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal</p>
              <p className="font-medium">
                {formatDate(currentJournal.tanggal)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cabang</p>
              <p className="font-medium">
                {currentJournal.cabang?.namaCabang || "Tidak diketahui"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipe</p>
              <p className="font-medium">{currentJournal.tipe}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{currentJournal.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dibuat Oleh</p>
              <p className="font-medium">
                {currentJournal.user?.nama || "Tidak diketahui"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Kode Akun</p>
              <p className="font-medium">
                {currentJournal.account?.kodeAccount || "Tidak tersedia"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nama Akun</p>
              <p className="font-medium">
                {currentJournal.account?.namaAccount || "Tidak tersedia"}
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Debet</TableHead>
                <TableHead className="text-right">Kredit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  {currentJournal.keterangan || "Tidak ada keterangan"}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(currentJournal.debet)}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {formatCurrency(currentJournal.kredit)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {currentJournal.sttIds && currentJournal.sttIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>STT Terkait</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor STT</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentJournal.stts?.map((stt) => (
                  <TableRow key={stt._id}>
                    <TableCell>{stt.noSTT}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate(`/stt/${stt._id}`)}
                      >
                        Lihat Detail
                      </Button>
                    </TableCell>
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

export default JournalDetailPage;
