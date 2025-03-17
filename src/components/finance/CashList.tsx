import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { CashTransaction } from '../../types/finance';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getCashTransactions, deleteCashTransaction } from '../../store/slices/financeSlice';
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
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import CashForm from './CashForm';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  FileDown, 
  Search,
  Filter,
  Calendar,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface CashListProps {
  branchFilter?: string;
  typeFilter?: string;
  createOnly?: boolean;
}

const CashList: React.FC<CashListProps> = ({ 
  branchFilter,
  typeFilter,
  createOnly = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cashTransactions, loading } = useSelector((state: RootState) => state.finance);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCash, setSelectedCash] = useState<CashTransaction | null>(null);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [branchId, setBranchId] = useState(branchFilter || '');
  const [type, setType] = useState(typeFilter || '');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Load initial data
  useEffect(() => {
    dispatch(getBranches());
    
    const filters = {
      ...(branchId ? { branchId } : {}),
      ...(type ? { tipeKas: type } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {})
    };
    
    dispatch(getCashTransactions(filters));
  }, [dispatch, branchId, type, searchTerm, startDate, endDate]);
  
  // Handle opening cash form for create/edit
  const handleOpenForm = (cash?: CashTransaction) => {
    setSelectedCash(cash || null);
    setOpenForm(true);
  };
  
  // Handle form submission
  const handleSubmit = (data: any) => {
    if (selectedCash) {
      // Update existing cash transaction
      dispatch(updateCashTransaction({ 
        id: selectedCash._id, 
        cashData: data 
      }));
    } else {
      // Create new cash transaction
      dispatch(createCashTransaction(data));
    }
    setOpenForm(false);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedCash) {
      dispatch(deleteCashTransaction(selectedCash._id));
      setOpenDeleteDialog(false);
    }
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (cash: CashTransaction) => {
    setSelectedCash(cash);
    setOpenDeleteDialog(true);
  };
  
  // Get branch name by ID
  const getBranchName = (branchId?: string) => {
    if (!branchId) return '-';
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };
  
  // Format price to Indonesian Rupiah
  const formatPrice = (price?: number) => {
    if (price === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (error) {
      return '-';
    }
  };
  
  // Get cash type badge
  const getCashTypeBadge = (type?: string) => {
    if (!type) return <Badge>-</Badge>;
    
    switch (type) {
      case 'Awal':
        return <Badge variant="outline" className="bg-blue-50">Kas Awal</Badge>;
      case 'Akhir':
        return <Badge variant="outline" className="bg-purple-50">Kas Akhir</Badge>;
      case 'Kecil':
        return <Badge variant="outline" className="bg-green-50">Kas Kecil</Badge>;
      case 'Rekening':
        return <Badge variant="outline" className="bg-yellow-50">Kas Rekening</Badge>;
      case 'Tangan':
        return <Badge variant="outline" className="bg-orange-50">Kas Tangan</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  // Filter and paginate cash transactions
  const filteredCash = cashTransactions
    .filter(cash => 
      (branchId ? cash.cabangId === branchId : true) &&
      (type ? cash.tipeKas === type : true) &&
      (searchTerm ? 
        (cash.keterangan && cash.keterangan.toLowerCase().includes(searchTerm.toLowerCase())) : 
        true
      ) &&
      (startDate ? new Date(cash.tanggal) >= new Date(startDate) : true) &&
      (endDate ? new Date(cash.tanggal) <= new Date(endDate) : true)
    );
  
  const totalPages = Math.ceil(filteredCash.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCash = filteredCash.slice(startIndex, startIndex + itemsPerPage);
  
  // Calculate totals
  const totalDebet = filteredCash.reduce((sum, item) => sum + (item.debet || 0), 0);
  const totalKredit = filteredCash.reduce((sum, item) => sum + (item.kredit || 0), 0);
  const totalSaldo = totalDebet - totalKredit;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Transaksi Kas</CardTitle>
          <CardDescription>
            Kelola semua transaksi kas perusahaan
          </CardDescription>
        </div>
        
        {!createOnly && (
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Transaksi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedCash ? 'Edit Transaksi Kas' : 'Tambah Transaksi Kas Baru'}
                </DialogTitle>
              </DialogHeader>
              <CashForm
                initialData={selectedCash || undefined}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      
      <CardContent>
        {!createOnly && (
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari keterangan transaksi..."
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
                    {branches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.namaCabang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={type}
                  onValueChange={setType}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Semua Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Tipe</SelectItem>
                    <SelectItem value="Awal">Kas Awal</SelectItem>
                    <SelectItem value="Akhir">Kas Akhir</SelectItem>
                    <SelectItem value="Kecil">Kas Kecil</SelectItem>
                    <SelectItem value="Rekening">Kas Rekening</SelectItem>
                    <SelectItem value="Tangan">Kas Tangan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tanggal:</span>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[160px]"
                />
                <span className="text-sm text-muted-foreground">s/d</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[160px]"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Debet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(totalDebet)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Kredit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatPrice(totalKredit)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalSaldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPrice(totalSaldo)}
              </div>
            </CardContent>
          </Card>
        </div>
        
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
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Tipe Kas</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Debet</TableHead>
                    <TableHead>Kredit</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCash.length > 0 ? (
                    paginatedCash.map((cash) => (
                      <TableRow key={cash._id}>
                        <TableCell>{formatDate(cash.tanggal)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{cash.keterangan}</div>
                        </TableCell>
                        <TableCell>{getCashTypeBadge(cash.tipeKas)}</TableCell>
                        <TableCell>{getBranchName(cash.cabangId)}</TableCell>
                        <TableCell className="text-green-600">{formatPrice(cash.debet)}</TableCell>
                        <TableCell className="text-red-600">{formatPrice(cash.kredit)}</TableCell>
                        <TableCell className={cash.saldo && cash.saldo >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {formatPrice(cash.saldo)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenForm(cash)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Transaksi
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleOpenDeleteDialog(cash)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Transaksi
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        Tidak ada data transaksi kas yang ditemukan
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
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCash.length)} dari {filteredCash.length} data
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi kas ini?
              Tindakan ini tidak dapat dibatalkan dan mungkin mempengaruhi saldo kas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CashList;