import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button} from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { STT, STTFormInputs } from '../../types/stt';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getSTTs,
  deleteSTT,
  createSTT,
  updateSTT,
  getSTTsByBranch
} from '../../store/slices/sttSlice';
import { getBranches } from '../../store/slices/branchSlice';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,  
} from '@/components/ui/alert-dialog';
import SttForm from './STTForm';
import SttDetail from './STTDetail';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  QrCode, 
  Printer,
  Search
} from 'lucide-react';

interface SttListProps {
  branchFilter?: string;
  statusFilter?: string;
  createOnly?: boolean;
}

const SttList: React.FC<SttListProps> = ({ 
  branchFilter,
  statusFilter: initialStatusFilter,
  createOnly = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sttList = [], loading } = useSelector((state: RootState) => state.stt);
  const { branches = [] } = useSelector((state: RootState) => state.branch);
  
  const [openForm, setOpenForm] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedStt, setSelectedStt] = useState<STT | null>(null);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [branchId, setBranchId] = useState(branchFilter || '');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || '');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Load initial data
  useEffect(() => {
    dispatch(getBranches());
    if (branchId && branchId !== '') {
      dispatch(getSTTsByBranch(branchId));
    } else {
      dispatch(getSTTs());
    }
  }, [dispatch, branchId]);
  
  // Handle opening STT form for create/edit
  const handleOpenForm = (stt?: STT) => {
    setSelectedStt(stt || null);
    setOpenForm(true);
  };
  
  // Handle opening STT detail
  const handleOpenDetail = (stt: STT) => {
    setSelectedStt(stt);
    setOpenDetail(true);
  };
  
  // Handle form submission
  const handleSubmit = (data: STTFormInputs) => {
    if (selectedStt) {
      // Update existing STT
      dispatch(updateSTT({ 
        id: selectedStt._id, 
        sttData: data 
      }));
    } else {
      // Create new STT
      dispatch(createSTT(data));
    }
    setOpenForm(false);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedStt) {
      dispatch(deleteSTT(selectedStt._id));
      setOpenDeleteDialog(false);
    }
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (stt: STT) => {
    setSelectedStt(stt);
    setOpenDeleteDialog(true);
  };
  
  // Get branch name by ID
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };
  
  // Format price to Indonesian Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge>Pending</Badge>;
      case 'MUAT':
        return <Badge variant="secondary">Muat</Badge>;
      case 'TRANSIT':
        return <Badge variant="warning">Transit</Badge>;
      case 'LANSIR':
        return <Badge variant="secondary">Lansir</Badge>;
      case 'TERKIRIM':
        return <Badge variant="success">Terkirim</Badge>;
      case 'RETURN':
        return <Badge variant="destructive">Return</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Get payment type badge
  const getPaymentBadge = (paymentType: string) => {
    switch (paymentType) {
      case 'CASH':
        return <Badge variant="outline" className="bg-green-50">CASH</Badge>;
      case 'COD':
        return <Badge variant="outline" className="bg-blue-50">COD</Badge>;
      case 'CAD':
        return <Badge variant="outline" className="bg-orange-50">CAD</Badge>;
      default:
        return <Badge variant="outline">{paymentType}</Badge>;
    }
  };
  
  // Filter and paginate STTs
  const filteredStts = React.useMemo(() => {
    if (!Array.isArray(sttList)) return [];
    
    return sttList.filter(item => 
      (!statusFilter || item.status === statusFilter) &&
      (searchTerm === '' || 
        (item.noSTT && item.noSTT.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.namaBarang && item.namaBarang.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [sttList, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredStts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStts = filteredStts.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Daftar Surat Tanda Terima (STT)</CardTitle>
          <CardDescription>
            Kelola semua data STT pengiriman
          </CardDescription>
        </div>
        
        {!createOnly && (
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Buat STT Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedStt ? 'Edit STT' : 'Buat STT Baru'}
                </DialogTitle>
              </DialogHeader>
              <SttForm
                initialData={selectedStt || undefined}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent>
        {!createOnly && (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Cari nomor STT atau nama barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={branchId}
                onValueChange={setBranchId}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Cabang</SelectItem>
                  {(Array.isArray(branches) ? branches : []).map((branch) => (
                    <SelectItem key={branch._id} value={branch._id}>
                      {branch.namaCabang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="MUAT">Muat</SelectItem>
                  <SelectItem value="TRANSIT">Transit</SelectItem>
                  <SelectItem value="LANSIR">Lansir</SelectItem>
                  <SelectItem value="TERKIRIM">Terkirim</SelectItem>
                  <SelectItem value="RETURN">Return</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. STT</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead>Asal / Tujuan</TableHead>
                    <TableHead>Berat</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStts.length > 0 ? (
                    paginatedStts.map((stt) => (
                      <TableRow key={stt._id}>
                        <TableCell className="font-medium">{stt.noSTT}</TableCell>
                        <TableCell>
                          <div>{stt.namaBarang}</div>
                          <div className="text-xs text-muted-foreground">{stt.komoditi}</div>
                        </TableCell>
                        <TableCell>
                          <div>{getBranchName(stt.cabangAsalId)}</div>
                          <div className="text-xs text-muted-foreground">→ {getBranchName(stt.cabangTujuanId)}</div>
                        </TableCell>
                        <TableCell>{stt.berat} kg</TableCell>
                        <TableCell>{formatPrice(stt.harga)}</TableCell>
                        <TableCell>{getStatusBadge(stt.status)}</TableCell>
                        <TableCell>{getPaymentBadge(stt.paymentType)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outlined" size="small">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDetail(stt)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/stt/track?noStt=${stt.noSTT}`}
                                  className="flex items-center"
                                >
                                  <QrCode className="mr-2 h-4 w-4" />
                                  Lacak Pengiriman
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/stt/print/${stt._id}`}
                                  target="_blank"
                                  className="flex items-center"
                                >
                                  <Printer className="mr-2 h-4 w-4" />
                                  Cetak STT
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenForm(stt)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit STT
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenDeleteDialog(stt)}>
                                <span className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4 inline" />
                                  Hapus STT
                                </span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        Tidak ada data STT yang ditemukan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredStts.length)} dari {filteredStts.length} data
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      
                      // Show first page, last page, current page, and pages immediately before and after current page
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        pageNumber === currentPage ||
                        pageNumber === currentPage - 1 ||
                        pageNumber === currentPage + 1
                      ) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              isActive={pageNumber === currentPage}
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      
                      // Show ellipsis if there's a gap
                      if (
                        (pageNumber === 2 && currentPage > 3) ||
                        (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {/* STT Detail Dialog */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail STT</DialogTitle>
          </DialogHeader>
          {selectedStt && <SttDetail id={selectedStt._id} data={selectedStt} />}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus STT {selectedStt?.noSTT}?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={loading}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default SttList;