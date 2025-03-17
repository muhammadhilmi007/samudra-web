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
import { Loading } from '../../types/loading';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getLoadings, deleteLoading, updateLoadingStatus } from '../../store/slices/loadingSlice';
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
import LoadingForm from './LoadingForm';
import LoadingDetail from './LoadingDetail';
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
  CheckCircle,
  Truck,
  FileText,
  ArrowRight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface LoadingListProps {
  branchFilter?: string;
  statusFilter?: string;
  createOnly?: boolean;
}

const LoadingList: React.FC<LoadingListProps> = ({ 
  branchFilter,
  statusFilter,
  createOnly = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loadings, loading } = useSelector((state: RootState) => state.loading);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { truckQueues } = useSelector((state: RootState) => state.truckQueue);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [openForm, setOpenForm] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedLoading, setSelectedLoading] = useState<Loading | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
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
    
    dispatch(getLoadings(filters));
  }, [dispatch, branchId, status, searchTerm, startDate, endDate]);
  
  // Handle opening loading form for create
  const handleOpenForm = () => {
    setSelectedLoading(null);
    setOpenForm(true);
  };
  
  // Handle opening loading detail
  const handleOpenDetail = (loadingData: Loading) => {
    setSelectedLoading(loadingData);
    setOpenDetail(true);
  };
  
  // Handle form submission
  const handleSubmit = (data: any) => {
    dispatch(createLoading(data));
    setOpenForm(false);
  };
  
  // Handle status update
  const handleStatusUpdate = (loadingId: string, newStatus: string) => {
    setSelectedLoading(loadings.find(l => l._id === loadingId) || null);
    setSelectedStatus(newStatus);
    setOpenStatusDialog(true);
  };
  
  // Confirm status update
  const confirmStatusUpdate = () => {
    if (selectedLoading && selectedStatus) {
      const updateData = {
        status: selectedStatus
      };
      
      // Add appropriate timestamp based on status
      if (selectedStatus === 'BERANGKAT' && !selectedLoading.waktuBerangkat) {
        updateData.waktuBerangkat = new Date().toISOString();
      } else if (selectedStatus === 'SAMPAI' && !selectedLoading.waktuSampai) {
        updateData.waktuSampai = new Date().toISOString();
      }
      
      dispatch(updateLoadingStatus({
        id: selectedLoading._id,
        statusData: updateData
      }));
      setOpenStatusDialog(false);
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedLoading) {
      dispatch(deleteLoading(selectedLoading._id));
      setOpenDeleteDialog(false);
    }
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (loadingData: Loading) => {
    setSelectedLoading(loadingData);
    setOpenDeleteDialog(true);
  };
  
  // Get branch name by ID
  const getBranchName = (branchId?: string) => {
    if (!branchId) return '-';
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };
  
  // Get employee name by ID
  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return '-';
    const employee = employees.find(e => e._id === employeeId);
    return employee ? employee.nama : '-';
  };
  
  // Get truck information from queue
  const getTruckInfo = (truckQueueId?: string) => {
    if (!truckQueueId) return { noPolisi: '-', supirName: '-' };
    
    const truckQueue = truckQueues.find(tq => tq._id === truckQueueId);
    if (!truckQueue) return { noPolisi: '-', supirName: '-' };
    
    // Find truck details
    const truck = truckQueue.truckId ? { noPolisi: truckQueue.truckId } : null;
    
    // Find driver details
    const driver = employees.find(emp => emp._id === truckQueue.supirId);
    
    return {
      noPolisi: truck?.noPolisi || '-',
      supirName: driver?.nama || '-'
    };
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd MMM yyyy, HH:mm', { locale: id });
    } catch (error) {
      return '-';
    }
  };
  
  // Get status badge
  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge>-</Badge>;
    
    switch (status.toUpperCase()) {
      case 'MUAT':
        return <Badge variant="outline" className="bg-blue-50">Muat</Badge>;
      case 'BERANGKAT':
        return <Badge variant="outline" className="bg-yellow-50">Berangkat</Badge>;
      case 'SAMPAI':
        return <Badge variant="outline" className="bg-green-50">Sampai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Filter and paginate loadings
  const filteredLoadings = loadings
    .filter(loading => 
      (branchId ? 
        loading.cabangMuatId === branchId || 
        loading.cabangBongkarId === branchId : 
        true
      ) &&
      (status ? loading.status === status : true) &&
      (searchTerm ? 
        loading.idMuat.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (loading.keterangan && loading.keterangan.toLowerCase().includes(searchTerm.toLowerCase())) : 
        true
      ) &&
      (startDate ? new Date(loading.createdAt) >= new Date(startDate) : true) &&
      (endDate ? new Date(loading.createdAt) <= new Date(endDate) : true)
    );
  
  const totalPages = Math.ceil(filteredLoadings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLoadings = filteredLoadings.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Daftar Muat Barang</CardTitle>
          <CardDescription>
            Kelola proses muat barang ke dalam truck
          </CardDescription>
        </div>
        
        {!createOnly && (
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenForm}>
                <Plus className="mr-2 h-4 w-4" />
                Buat Muat Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Buat Muat Barang Baru</DialogTitle>
              </DialogHeader>
              <LoadingForm
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
                  placeholder="Cari ID muat atau keterangan..."
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
                    <SelectItem value="MUAT">Muat</SelectItem>
                    <SelectItem value="BERANGKAT">Berangkat</SelectItem>
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
                    <TableHead>ID Muat</TableHead>
                    <TableHead>Rute</TableHead>
                    <TableHead>Truck</TableHead>
                    <TableHead>Checker</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLoadings.length > 0 ? (
                    paginatedLoadings.map((loadingItem) => {
                      const truckInfo = getTruckInfo(loadingItem.antrianTruckId);
                      return (
                        <TableRow key={loadingItem._id}>
                          <TableCell className="font-medium">{loadingItem.idMuat}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{getBranchName(loadingItem.cabangMuatId)}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span>{getBranchName(loadingItem.cabangBongkarId)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {loadingItem.sttIds?.length || 0} STT
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{truckInfo.noPolisi}</div>
                            <div className="text-xs text-muted-foreground">{truckInfo.supirName}</div>
                          </TableCell>
                          <TableCell>{getEmployeeName(loadingItem.checkerId)}</TableCell>
                          <TableCell>{getStatusBadge(loadingItem.status)}</TableCell>
                          <TableCell>
                            {loadingItem.status === 'BERANGKAT' || loadingItem.status === 'SAMPAI' ? (
                              <div>
                                <div className="text-xs">
                                  <span className="font-medium">Berangkat:</span> {formatDate(loadingItem.waktuBerangkat)}
                                </div>
                                {loadingItem.status === 'SAMPAI' && (
                                  <div className="text-xs mt-1">
                                    <span className="font-medium">Sampai:</span> {formatDate(loadingItem.waktuSampai)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Belum berangkat</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDetail(loadingItem)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/loading/print/${loadingItem._id}`} target="_blank">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Cetak DMB
                                  </Link>
                                </DropdownMenuItem>
                                
                                {loadingItem.status === 'MUAT' && (
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(loadingItem._id, 'BERANGKAT')}>
                                    <Truck className="mr-2 h-4 w-4" />
                                    Update ke Berangkat
                                  </DropdownMenuItem>
                                )}
                                
                                {loadingItem.status === 'BERANGKAT' && (
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(loadingItem._id, 'SAMPAI')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Update ke Sampai
                                  </DropdownMenuItem>
                                )}
                                
                                {loadingItem.status === 'MUAT' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleOpenDeleteDialog(loadingItem)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        Tidak ada data muat barang yang ditemukan
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
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLoadings.length)} dari {filteredLoadings.length} data
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
      
      {/* Loading Detail Dialog */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Muat Barang</DialogTitle>
          </DialogHeader>
          {selectedLoading && <LoadingDetail loading={selectedLoading} />}
        </DialogContent>
      </Dialog>
      
      {/* Status Update Confirmation Dialog */}
      <AlertDialog open={openStatusDialog} onOpenChange={setOpenStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Update Status</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus === 'BERANGKAT' ? (
                <>
                  Apakah Anda yakin akan mengubah status muat {selectedLoading?.idMuat} menjadi <strong>Berangkat</strong>?
                  Waktu keberangkatan akan dicatat.
                </>
              ) : selectedStatus === 'SAMPAI' ? (
                <>
                  Apakah Anda yakin akan mengubah status muat {selectedLoading?.idMuat} menjadi <strong>Sampai</strong>?
                  Waktu kedatangan akan dicatat.
                </>
              ) : (
                <>
                  Apakah Anda yakin akan mengubah status muat {selectedLoading?.idMuat}?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusUpdate}>
              Konfirmasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data muat {selectedLoading?.idMuat}?
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

export default LoadingList;