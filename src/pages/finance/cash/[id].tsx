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
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { RootState, AppDispatch } from '../../../store';
import { getCashById } from '../../../store/slices/financeSlice';
import { formatCurrency, formatDate } from '../../../utils/formatting';

const CashDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentCashTransaction } = useSelector((state: RootState) => state.finance);
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      dispatch(getCashById(id))
        .unwrap()
        .catch((err) => {
          setError(err.message || 'Gagal memuat detail transaksi kas');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, dispatch]);

  // Cek izin akses ke detail transaksi kas
  const canAccessCashDetail = user?.role && [
    'admin', 
    'direktur', 
    'manajerKeuangan', 
    'stafKeuangan', 
    'kasir'
  ].includes(user.role);

  if (!canAccessCashDetail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses Ditolak</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Anda tidak memiliki izin untuk melihat detail transaksi kas.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <p>Memuat detail transaksi kas...</p>
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

  if (!currentCashTransaction) {
    return (
      <div className="container mx-auto py-6">
        <p>Transaksi kas tidak ditemukan.</p>
      </div>
    );
  }

  const handlePrintCashTransaction = () => {
    window.print();
  };

  const handleExportCashTransaction = () => {
    // TODO: Implement cash transaction export functionality
    console.log('Export transaksi kas');
  };

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
          <h2 className="text-3xl font-bold tracking-tight">Detail Transaksi Kas</h2>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={handlePrintCashTransaction}
          >
            <FileText className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          <Button 
            variant="outline"
            onClick={handleExportCashTransaction}
          >
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tanggal</p>
              <p className="font-medium">
                {formatDate(currentCashTransaction.tanggal)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipe Kas</p>
              <p className="font-medium">{currentCashTransaction.tipeKas}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cabang</p>
              <p className="font-medium">
                {currentCashTransaction.cabang?.namaCabang || 'Tidak diketahui'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dibuat Oleh</p>
              <p className="font-medium">
                {currentCashTransaction.user?.nama || 'Tidak diketahui'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Debet</TableHead>
                <TableHead className="text-right">Kredit</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{currentCashTransaction.keterangan || 'Tidak ada keterangan'}</TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(currentCashTransaction.debet)}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {formatCurrency(currentCashTransaction.kredit)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(currentCashTransaction.saldo)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tambahan informasi jika diperlukan */}
      {currentCashTransaction.tipeKas === 'Rekening' && (
        <Card>
          <CardHeader>
            <CardTitle>Detail Rekening</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama Bank</p>
                <p className="font-medium">
                  {currentCashTransaction.bank || 'Tidak tersedia'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nomor Rekening</p>
                <p className="font-medium">
                  {currentCashTransaction.noRekening || 'Tidak tersedia'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CashDetailPage;