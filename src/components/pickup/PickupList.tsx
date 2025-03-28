import React, { useState, useEffect, useMemo } from 'react';
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
  DialogTitle 
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
import { Pickup } from '../../types/pickupRequest';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getPickupRequests, deletePickup } from '../../store/slices/pickupSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { getEmployees } from '../../store/slices/employeeSlice';
import { getVehicles } from '../../store/slices/vehicleSlice';
import { getCustomers } from '../../store/slices/customerSlice';
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
  Calendar,
  Truck,
  MapPin,
  Info,
  Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const { pickup: pickups, loading } = useSelector((state: RootState) => state.pickup);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { customers } = useSelector((state: RootState) => state.customer);
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
  const [driverFilter, setDriverFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Load initial data
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getEmployees({}));
    dispatch(getVehicles());
    dispatch(getCustomers());
    
    const filters = {
      ...(branchId ? { branchId } : {}),
      ...(status ? { status } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {})
    };
    
    dispatch(getPickupRequests());
  }, [dispatch, branchId, status, searchTerm, startDate, endDate]);
  
  // Handle opening pickup detail
  const handleOpenDetail = (pickupData: Pickup) => {
    setSelectedPickup(pickupData);
    setOpenDetail(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedPickup) {
      dispatch(deletePickup(selectedPickup._id))
        .unwrap()
        .then(() => {
          toast({
            title: 'Berhasil',
            description: 'Data pengambilan berhasil dihapus',
          });
          setOpenDeleteDialog(false);
        })
        .catch((error) => {
          toast({
            title: 'Gagal',
            description: error || 'Terjadi kesalahan saat menghapus data pengambilan',
            variant: 'destructive',
          });
        });
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
  
  // Get customer name by ID
  const getCustomerName = (customerId?: string) => {
    if (!customerId) return '-';
    const customer = customers.find(c => c._id === customerId);
    return customer ? customer.nama : '-';
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
  
    // Filter pickups
    const filteredPickups = useMemo(() => {
      return pickups.filter((pickup: Pickup) => {
        // Branch filter
        if (branchId && pickup.cabangId !== branchId) return false;
        
        // Driver filter
        if (driverFilter && pickup.supirId !== driverFilter) return false;
        
        // Search term filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          const matchesNo = pickup.noPengambilan?.toLowerCase().includes(search);
          const matchesSender = getCustomerName(pickup.pengirimId)?.toLowerCase().includes(search);
          const matchesDriver = getEmployeeName(pickup.supirId)?.toLowerCase().includes(search);
          
          if (!matchesNo && !matchesSender && !matchesDriver) return false;
        }
        
        // Date range filter
        if (startDate && endDate) {
          const pickupDate = new Date(pickup.tanggal);
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59); // Include the full end day
          
          if (pickupDate < start || pickupDate > end) return false;
        } else if (startDate) {
          const pickupDate = new Date(pickup.tanggal);
          const start = new Date(startDate);
          
          if (pickupDate < start) return false;
        } else if (endDate) {
          const pickupDate = new Date(pickup.tanggal);
          const end = new Date(endDate);
          end.setHours(23, 59, 59); // Include the full end day
          
          if (pickupDate > end) return false;
        }
        
        return true;
      });
    }, [pickups, branchId, driverFilter, searchTerm, startDate, endDate]);
  
    // Pagination
    const totalPages = Math.ceil(filteredPickups.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPickups = filteredPickups.slice(startIndex, startIndex + itemsPerPage);
    
    // Handle page change
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };
    
    // Clear filters
    const handleClearFilters = () => {
      setSearchTerm('');
      setBranchId(branchFilter || '');
      setDriverFilter('');
      setStartDate('');
      setEndDate('');
      setCurrentPage(1);
    };
    
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
            <Link to="/pickup/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Buat Pengambilan Baru
              </Button>
            </Link>
          )}
        </CardHeader>
        
        <CardContent>
          {!createOnly && (
            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="search"
                    placeholder="Cari nomor pengambilan, pengirim, atau supir..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
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
                    value={driverFilter}
                    onValueChange={setDriverFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Semua Supir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Semua Supir</SelectItem>
                      {employees
                        .filter(e => e.jabatan?.toLowerCase().includes('supir'))
                        .map((driver) => (
                          <SelectItem key={driver._id} value={driver._id}>
                            {driver.nama}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 flex-wrap">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Tanggal:</span>
                  <Input
                    name="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[160px]"
                  />
                  <span className="text-sm text-muted-foreground">s/d</span>
                  <Input
                    name="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[160px]"
                  />
                </div>
                
                <div className="ml-auto">
                  <Button variant="outlined" onClick={handleClearFilters}>
                    Hapus Filter
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Memuat data pengambilan...</span>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Pengambilan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Cabang</TableHead>
                      <TableHead>Pengirim</TableHead>
                      <TableHead>Kendaraan</TableHead>
                      <TableHead>Supir & Kenek</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPickups.length > 0 ? (
                      paginatedPickups.map((pickup: Pickup) => {
                        const vehicleInfo = getVehicleInfo(pickup.kendaraanId);
                        return (
                          <TableRow key={pickup._id}>
                            <TableCell className="font-medium">{pickup.noPengambilan}</TableCell>
                            <TableCell>{formatDate(pickup.tanggal)}</TableCell>
                            <TableCell>{getBranchName(pickup.cabangId)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span>{getCustomerName(pickup.pengirimId)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {pickup.alamatPengambilan?.substring(0, 20)}...
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Truck className="h-3 w-3 text-muted-foreground" />
                                <span>{vehicleInfo.noPolisi}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">{vehicleInfo.namaKendaraan}</div>
                            </TableCell>
                            <TableCell>
                              <div>{getEmployeeName(pickup.supirId)}</div>
                              <div className="text-xs text-muted-foreground">{getEmployeeName(pickup.kenekId)}</div>
                            </TableCell>
                            <TableCell>
                              {pickup.waktuPulang ? (
                                <Badge className="bg-green-100 text-green-800">Selesai</Badge>
                              ) : pickup.waktuBerangkat ? (
                                <Badge className="bg-blue-100 text-blue-800">Berangkat</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <Button variant="outlined" size="small">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenDetail(pickup)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Lihat Detail
                                  </DropdownMenuItem>
                                  <Link to={`/pickup/${pickup._id}`}>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                  </Link>
                                  <Link to={`/pickup/print/${pickup._id}`} target="_blank">
                                    <DropdownMenuItem>
                                      <FileDown className="mr-2 h-4 w-4" />
                                      Cetak
                                    </DropdownMenuItem>
                                  </Link>
                                  <DropdownMenuItem onClick={() => handleOpenDeleteDialog(pickup)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span className="text-destructive">Hapus</span>
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
                          <div className="flex flex-col items-center justify-center">
                            <Info className="h-8 w-8 text-muted-foreground mb-2" />
                            <p>Tidak ada data pengambilan yang ditemukan</p>
                            {(branchId || searchTerm || startDate || endDate || driverFilter) && (
                              <Button 
                                variant="text" 
                                onClick={handleClearFilters}
                                className="mt-2"
                              >
                                Hapus semua filter
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {filteredPickups.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPickups.length)} dari {filteredPickups.length} data
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
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
                                onClick={() => handlePageChange(pageNumber)}
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
                          onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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
            {selectedPickup && <PickupDetail pickupId={selectedPickup._id} />}
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
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default PickupList;

  
