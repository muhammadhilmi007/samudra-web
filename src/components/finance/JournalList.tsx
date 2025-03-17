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
import { JournalEntry } from '../../types/finance';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getJournalEntries, deleteJournalEntry } from '../../store/slices/financeSlice';
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
import JournalForm from './JournalForm';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  FileDown, 
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface JournalListProps {
  branchFilter?: string;
  typeFilter?: string;
  createOnly?: boolean;
}

const JournalList: React.FC<JournalListProps> = ({ 
  branchFilter,
  typeFilter,
  createOnly = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { journalEntries, loading } = useSelector((state: RootState) => state.finance);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { accounts } = useSelector((state: RootState) => state.finance);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  
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
      ...(type ? { type } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {})
    };
    
    dispatch(getJournalEntries(filters));
  }, [dispatch, branchId, type, searchTerm, startDate, endDate]);
  
  // Handle opening journal form for create/edit
  const handleOpenForm = (journal?: JournalEntry) => {
    setSelectedJournal(journal || null);
    setOpenForm(true);
  };
  
  // Handle form submission
  const handleSubmit = (data: any) => {
    if (selectedJournal) {
      // Update existing journal
      dispatch(updateJournalEntry({ 
        id: selectedJournal._id, 
        journalData: data 
      }));
    } else {
      // Create new journal
      dispatch(createJournalEntry(data));
    }
    setOpenForm(false);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedJournal) {
      dispatch(deleteJournalEntry(selectedJournal._id));
      setOpenDeleteDialog(false);
    }
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (journal: JournalEntry) => {
    setSelectedJournal(journal);
    setOpenDeleteDialog(true);
  };
  
  // Get branch name by ID
  const getBranchName = (branchId?: string) => {
    if (!branchId) return '-';
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };
  
  // Get account name by ID
  const getAccountName = (accountId?: string) => {
    if (!accountId) return '-';
    const account = accounts.find(a => a._id === accountId);
    return account ? account.namaAccount : '-';
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
  
  // Get status badge
  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge>-</Badge>;
    
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return <Badge variant="outline">Draft</Badge>;
      case 'FINAL':
        return <Badge variant="success">Final</Badge>;
      case 'VALIDATED':
        return <Badge variant="success">Tervalidasi</Badge>;
      case 'POSTED':
        return <Badge variant="success">Posted</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Filter and paginate journals
  const filteredJournals = journalEntries
    .filter(journal => 
      (branchId ? journal.cabangId === branchId : true) &&
      (type ? journal.tipe === type : true) &&
      (searchTerm ? 
        (journal.keterangan && journal.keterangan.toLowerCase().includes(searchTerm.toLowerCase())) : 
        true
      ) &&
      (startDate ? new Date(journal.tanggal) >= new Date(startDate) : true) &&
      (endDate ? new Date(journal.tanggal) <= new Date(endDate) : true)
    );
  
  const totalPages = Math.ceil(filteredJournals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJournals = filteredJournals.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Jurnal Umum</CardTitle>
          <CardDescription>
            Kelola semua transaksi jurnal umum
          </CardDescription>
        </div>
        
        {!createOnly && (
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Jurnal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedJournal ? 'Edit Jurnal' : 'Tambah Jurnal Baru'}
                </DialogTitle>
              </DialogHeader>
              <JournalForm
                initialData={selectedJournal || undefined}
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
                  placeholder="Cari keterangan jurnal..."
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
                    <SelectItem value="Lokal">Jurnal Lokal</SelectItem>
                    <SelectItem value="Pusat">Jurnal Pusat</SelectItem>
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
                    <TableHead>Akun</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Debet</TableHead>
                    <TableHead>Kredit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedJournals.length > 0 ? (
                    paginatedJournals.map((journal) => (
                      <TableRow key={journal._id}>
                        <TableCell>{formatDate(journal.tanggal)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{journal.keterangan}</div>
                          <div className="text-xs text-muted-foreground">Tipe: {journal.tipe || '-'}</div>
                        </TableCell>
                        <TableCell>{getAccountName(journal.accountId)}</TableCell>
                        <TableCell>{getBranchName(journal.cabangId)}</TableCell>
                        <TableCell>{formatPrice(journal.debet)}</TableCell>
                        <TableCell>{formatPrice(journal.kredit)}</TableCell>
                        <TableCell>{getStatusBadge(journal.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenForm(journal)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Jurnal
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleOpenDeleteDialog(journal)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Jurnal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        Tidak ada data jurnal yang ditemukan
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
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredJournals.length)} dari {filteredJournals.length} data
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
              Apakah Anda yakin ingin menghapus jurnal ini?
              Tindakan ini tidak dapat dibatalkan.
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

export default JournalList;