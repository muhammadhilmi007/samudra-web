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
import { Pickup } from '../../types/pickup';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getPickups, deletePickup } from '../../store/slices/pickupSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { getEmployees } from '../../store/slices/employeeSlice';
import { getVehicles } from '../../store/slices/vehicleSlice';
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
import PickupDetail from './PickupDetail';
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
  Truck,
  MapPin
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface PickupListProps {
  branchFilter?: string;
  statusFilter?: string;
  createOnly?: boolean;
}

const PickupList: React.FC<PickupListProps> = ({ 
  branchFilter,
  statusFilter,
  createOnly = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { pickups, loading } = useSelector((state: RootState) => state.pickup);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [openDetail, setOpenDetail] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  
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
    dispatch(getEmployees());
    dispatch(getVehicles());
    
    const filters = {
      ...(branchId ? { branchId } : {}),
      ...(status ? { status } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {})
    };
    
    dispatch(getPickups(filters));
  }, [dispatch, branchId, status, searchTerm, startDate, endDate]);
  
  // Handle opening pickup detail
  const handleOpenDetail = (pickupData: Pickup) => {
    setSelectedPickup(pickupData);
    setOpenDetail(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedPickup) {
      dispatch(deletePickup(selectedPickup._id));
      setOpenDeleteDialog(false);
    }
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (pickupData: Pickup) => {
    setSelectedPickup(pickupData);
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
  
  // Get vehicle info by ID
  const getVehicleInfo = (vehicleId?: string) => {
    if (!vehicleId) return { noPolisi: '-', namaKendaraan: '-' };
    const vehicle = vehicles.find(v => v._id === vehicleId);
    return vehicle 
      ? { noPolisi: vehicle.noPolisi, namaKendaraan: vehicle.namaKendaraan } 
      : { noPolisi: '-', namaKendaraan: '-' };
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
  
  // Filter and paginate pickups
  const filteredPickups = pickups
    .filter(pickup => 
      (branchId ? pickup.cabangId === branchId : true) &&
      (searchTerm ? 
        pickup.noPengambilan?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (pickup.estimasiPengambilan && pickup.estimasiPengambilan.toLowerCase().includes(searchTerm.toLowerCase())) : 
        true
      ) &&
      (startDate ? new Date(pickup.tanggal) >= new Date(startDate) : true) &&
      (endDate ? new Date(pickup.tanggal) <= new Date(endDate) : true)
    );
  
  const totalPages = Math.ceil(filteredPickups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPickups = filteredPickups.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Daftar Pengambilan Barang</CardTitle>
          <CardDescription>
            Kelola proses pengambilan barang dari pelanggan
          </CardDescription>
        </div>
        
        {!createOnly && (
          <Button asChild>
            <Link to="/pickup/create">
              <Plus className="mr-2 h-4 w-4" />
              Buat Pengambilan Baru
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
                  placeholder="Cari nomor pengambilan..."
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
                    <TableHead>No. Pengambilan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Pengirim</TableHead>
                    <TableHead>Kendaraan</TableHead>
                    <TableHead>Supir & Kenek</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPickups.length > 0 ? (
                    paginatedPickups.map((pickup) => {
                      const vehicleInfo = getVehicleInfo(pickup.kendaraanId);
                      return (
                        <TableRow key={pickup._id}>
                          <TableCell className="font-medium">{pickup.noPengambilan}</TableCell>
                          <TableCell>{formatDate(pickup.tanggal)}</TableCell>
                          <TableCell>{getBranchName(pickup.cabangId)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>{pickup.pengirimId}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {pickup.sttIds?.length || 0} STT
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{vehicleInfo.noPolisi}</div>
                            <div className="text-xs text-muted-foreground">{vehicleInfo.namaKendaraan}</div>
                          </TableCell>
                          <TableCell>
                            <div>{getEmployeeName(pickup.supirId)}</div>
                            <div className="text-xs text-muted-foreground">{getEmployeeName(pickup.kenekId)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <span className="font-medium">Berangkat:</span> {formatDate(pickup.waktuBerangkat)}
                            </div>
                            <div className="text-xs mt-1">
                              <span className="font-medium">Pulang:</span> {formatDate(pickup.waktuPulang)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDetail(pickup)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/pickup/${pickup._id}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/pickup/print/${pickup._id}`} target="_blank">
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Cetak
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleOpenDeleteDialog(pickup)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        Tidak ada data pengambilan yang ditemukan
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
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPickups.length)} dari {filteredPickups.length} data
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
      
      {/* Pickup Detail Dialog */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pengambilan Barang</DialogTitle>
          </DialogHeader>
          {selectedPickup && <PickupDetail pickup={selectedPickup} />}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pengambilan {selectedPickup?.noPengambilan}?
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

export default PickupList;