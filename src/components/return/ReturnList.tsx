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
  DialogDescription 
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
import { Return } from '../../types/return';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getReturns, deleteReturn } from '../../store/slices/returnSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Calendar,
  Package,
  RefreshCw,
  FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface ReturnListProps {
  branchFilter?: string;
  statusFilter?: string;
  createOnly?: boolean;
}

const ReturnList: React.FC<ReturnListProps> = ({ 
  branchFilter,
  statusFilter,
  createOnly = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { returns, loading } = useSelector((state: RootState) => state.return);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { stts } = useSelector((state: RootState) => state.stt);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [openDetail, setOpenDetail] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [branchId, setBranchId] = useState(branchFilter || '');
  const [status, setStatus] = useState(statusFilter || '');
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
      ...(status ? { status } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {})
    };
    
    dispatch(getReturns(filters));
  }, [dispatch, branchId, status, searchTerm, startDate, endDate]);
  
  // Handle opening return detail
  const handleOpenDetail = (returnData: Return) => {
    setSelectedReturn(returnData);
    setOpenDetail(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedReturn) {
      dispatch(deleteReturn(selectedReturn._id));
      setOpenDeleteDialog(false);
    }
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (returnData: Return) => {
    setSelectedReturn(returnData);
    setOpenDeleteDialog(true);
  };
  
  // Get branch name by ID
  const getBranchName = (branchId?: string) => {
    if (!branchId) return '-';
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };
  
  // Get STT numbers as string
  const getSttNumbers = (sttIds?: string[]) => {
    if (!sttIds || sttIds.length === 0) return '-';
    
    const sttNumbers = sttIds.map(id => {
      const stt = stts.find(s => s._id === id);
      return stt ? stt.noSTT : id;
    });
    
    if (sttNumbers.length > 2) {
      return `${sttNumbers.slice(0, 2).join(', ')} +${sttNumbers.length - 2} lainnya`;
    }
    
    return sttNumbers.join(', ');
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: id });
    } catch (error) {
      return '-';
    }
  };
  
  // Get status badge
  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge>-</Badge>;
    
    switch (status.toUpperCase()) {
      case 'PROSES':
        return <Badge variant="outline" className="bg-blue-50">Proses</Badge>;
      case 'SAMPAI':
        return <Badge variant="outline" className="bg-green-50">Sampai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Filter and paginate returns
  const filteredReturns = returns
    .filter(ret => 
      (branchId ? ret.cabangId === branchId : true) &&
      (status ? ret.status === status : true) &&
      (searchTerm ? 
        ret.idRetur.toLowerCase().includes(searchTerm.toLowerCase()) : 
        true
      ) &&
      (startDate ? new Date(ret.createdAt) >= new Date(startDate) : true) &&
      (endDate ? new Date(ret.createdAt) <= new Date(endDate) : true)
    );
  
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReturns = filteredReturns.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Daftar Retur Barang</CardTitle>
          <CardDescription>
            Kelola proses retur barang
          </CardDescription>
        </div>
        
        {!createOnly && (
          <Button asChild>
            <Link to="/return/create">
              <Plus className="mr-2 h-4 w-4" />
              Buat Retur Baru
            </Link>
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {!createOnly && (
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari ID retur..."
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
                  value={status}
                  onValueChange={setStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Status</SelectItem>
                    <SelectItem value="PROSES">Proses</SelectItem>
                    <SelectItem value="SAMPAI">Sampai</SelectItem>
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
                    <TableHead>ID Retur</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>STT</TableHead>
                    <TableHead>Tanggal Kirim</TableHead>
                    <TableHead>Tanggal Sampai</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReturns.length > 0 ? (
                    paginatedReturns.map((returnItem) => (
                      <TableRow key={returnItem._id}>
                        <TableCell className="font-medium">{returnItem.idRetur}</TableCell>
                        <TableCell>{getBranchName(returnItem.cabangId)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span>{getSttNumbers(returnItem.sttIds)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {returnItem.sttIds?.length || 0} STT
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(returnItem.tanggalKirim)}</TableCell>
                        <TableCell>{formatDate(returnItem.tanggalSampai)}</TableCell>
                        <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDetail(returnItem)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/return/${returnItem._id}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/return/print/${returnItem._id}`} target="_blank">
                                  <FileText className="mr-2 h-4 w-4" />
                                  Cetak
                                </Link>
                              </DropdownMenuItem>
                              
                              {returnItem.status === 'PROSES' && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    // Dispatch action to update status
                                    // dispatch(updateReturnStatus({
                                    //   id: returnItem._id,
                                    //   status: 'SAMPAI'
                                    // }));
                                  }}
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Update ke Sampai
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem 
                                onClick={() => handleOpenDeleteDialog(returnItem)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        Tidak ada data retur yang ditemukan
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
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredReturns.length)} dari {filteredReturns.length} data
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
      
      {/* Return Detail Dialog */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Retur</DialogTitle>
            <DialogDescription>
              Informasi detail mengenai retur barang
            </DialogDescription>
          </DialogHeader>
          
          {selectedReturn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">ID Retur</h4>
                  <p className="font-medium">{selectedReturn.idRetur}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Cabang</h4>
                  <p>{getBranchName(selectedReturn.cabangId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tanggal Kirim</h4>
                  <p>{formatDate(selectedReturn.tanggalKirim)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tanggal Sampai</h4>
                  <p>{formatDate(selectedReturn.tanggalSampai)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <p>{getStatusBadge(selectedReturn.status)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tanda Terima</h4>
                  <p>{selectedReturn.tandaTerima || '-'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">STT Terkait</h4>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {selectedReturn.sttIds && selectedReturn.sttIds.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedReturn.sttIds.map((sttId, index) => (
                        <li key={index} className="text-sm flex items-center">
                          <Package className="h-3 w-3 mr-2 text-muted-foreground" />
                          {sttId}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Tidak ada STT terkait</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data retur {selectedReturn?.idRetur}?
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

export default ReturnList;