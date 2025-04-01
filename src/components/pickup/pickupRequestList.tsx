// src/components/pickup/PickupRequestList.tsx (continued)
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  FileText,
  User,
  MapPin,
  Building,
  Loader2,
  Info,
  ArrowRightCircle,
} from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  PickupRequest,
  PickupRequestFilterParams,
} from "@/types/pickupRequest";
import PickupRequestDetail from "./PickupRequestDetail";
import { Textarea } from "../ui/textarea";

interface PickupRequestListProps {
  pickupRequests: PickupRequest[];
  loading: boolean;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string, notes?: string) => void;
  onLinkToPickup?: (id: string, pickupId: string) => void;
  onFilterChange?: (filters: PickupRequestFilterParams) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onPageChange?: (page: number) => void;
  showCreateButton?: boolean;
  showFilters?: boolean;
  pendingOnly?: boolean;
}

const PickupRequestList: React.FC<PickupRequestListProps> = ({
  pickupRequests,
  loading,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
  onLinkToPickup,
  onFilterChange,
  pagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  onPageChange,
  showCreateButton = true,
  showFilters = true,
  pendingOnly = false,
}) => {
  const { branches } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);

  // State for filters
  const [filters, setFilters] = useState<PickupRequestFilterParams>({
    search: "",
    cabangId: user?.cabangId || "",
    status: pendingOnly ? "PENDING" : "",
    startDate: "",
    endDate: "",
    page: 1,
  });

  // State for dialogs
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(
    null
  );
  const [statusNotes, setStatusNotes] = useState("");
  const [pendingStatus, setPendingStatus] = useState<"FINISH" | "CANCELLED">(
    "FINISH"
  );

  // Apply filters
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  // Format date with Indonesian locale
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(parseISO(dateString), "dd MMM yyyy", { locale: id });
    } catch (error) {
      return "-";
    }
  };

  // Handle opening details
  const handleViewRequest = (request: PickupRequest) => {
    setSelectedRequest(request);
    setViewDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (request: PickupRequest) => {
    setSelectedRequest(request);
    setDeleteDialogOpen(true);
  };

  // Handle status change
  const handleStatusChangeClick = (
    request: PickupRequest,
    status: "FINISH" | "CANCELLED"
  ) => {
    setSelectedRequest(request);
    setPendingStatus(status);
    setStatusNotes("");
    setStatusDialogOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    if (selectedRequest && onDelete) {
      onDelete(selectedRequest._id);
      setDeleteDialogOpen(false);
    }
  };

  // Confirm status change
  const handleStatusConfirm = () => {
    if (selectedRequest && onStatusChange) {
      onStatusChange(
        selectedRequest._id,
        pendingStatus,
        statusNotes || undefined
      );
      setStatusDialogOpen(false);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      search: "",
      cabangId: user?.cabangId || "",
      status: pendingOnly ? "PENDING" : "",
      startDate: "",
      endDate: "",
      page: 1,
    });
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning">Menunggu</Badge>;
      case "FINISH":
        return <Badge variant="success">Selesai</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>
            {pendingOnly
              ? "Permintaan Pengambilan Menunggu"
              : "Daftar Permintaan Pengambilan"}
          </CardTitle>
          <CardDescription>
            {pendingOnly
              ? "Daftar permintaan pengambilan yang belum diproses"
              : "Kelola permintaan pengambilan barang dari pelanggan"}
          </CardDescription>
        </div>

        {showCreateButton && (
          <Link href="/pickup-request/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Permintaan
            </Button>
          </Link>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 mb-4">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nomor permintaan, pengirim, atau alamat..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        search: e.target.value,
                        page: 1,
                      })
                    }
                    className="pl-8"
                    name={""}
                  />
                </div>
              </div>

              {/* Branch filter */}
              {!user?.cabangId && (
                <div className="w-[200px]">
                  <Select
                    value={filters.cabangId}
                    onValueChange={(value) =>
                      setFilters({ ...filters, cabangId: value, page: 1 })
                    }
                  >
                    <SelectTrigger>
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
              )}

              {/* Status filter (if not pending only) */}
              {!pendingOnly && (
                <div className="w-[200px]">
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value, page: 1 })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Semua Status</SelectItem>
                      <SelectItem value="PENDING">Menunggu</SelectItem>
                      <SelectItem value="FINISH">Selesai</SelectItem>
                      <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Date range filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Dari:</span>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      startDate: e.target.value,
                      page: 1,
                    })
                  }
                  className="w-[180px]"
                  name={""}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sampai:</span>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value, page: 1 })
                  }
                  className="w-[180px]"
                  name={""}
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

        {/* Loading state */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Memuat data...</span>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Request</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Pengirim</TableHead>
                    <TableHead>Tujuan</TableHead>
                    <TableHead>Colly</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickupRequests.length > 0 ? (
                    pickupRequests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell className="font-medium">
                          {request.noRequest || "N/A"}
                        </TableCell>
                        <TableCell>{formatDate(request.tanggal)}</TableCell>
                        <TableCell>
                          {request.cabang?.namaCabang || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span>{request.pengirim?.nama || "-"}</span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {request.alamatPengambilan.length > 30
                                ? `${request.alamatPengambilan.substring(
                                    0,
                                    30
                                  )}...`
                                : request.alamatPengambilan}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <ArrowRightCircle className="h-3 w-3 text-muted-foreground" />
                            <span>{request.tujuan}</span>
                          </div>
                        </TableCell>
                        <TableCell>{request.jumlahColly}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outlined" size="small">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewRequest(request)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                              </DropdownMenuItem>

                              {request.status === "PENDING" && onEdit && (
                                <DropdownMenuItem
                                  onClick={() => onEdit(request._id)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}

                              {request.status === "PENDING" &&
                                onStatusChange && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChangeClick(request, "FINISH")
                                    }
                                  >
                                    <Info className="h-4 w-4 mr-2" />
                                    Selesaikan
                                  </DropdownMenuItem>
                                )}

                              {request.status === "PENDING" &&
                                onStatusChange && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChangeClick(
                                        request,
                                        "CANCELLED"
                                      )
                                    }
                                  >
                                    <Info className="h-4 w-4 mr-2 text-destructive" />
                                    <span className="text-destructive">
                                      Batalkan
                                    </span>
                                  </DropdownMenuItem>
                                )}

                              {request.status === "PENDING" && onDelete && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(request)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                  <span className="text-destructive">
                                    Hapus
                                  </span>
                                </DropdownMenuItem>
                              )}

                              <Link
                                href={`/pickup-request/print/${request._id}`}
                                target="_blank"
                              >
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Cetak
                                </DropdownMenuItem>
                              </Link>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Info className="h-8 w-8 mb-2" />
                          <p>Tidak ada data yang ditemukan</p>
                          {(filters.search ||
                            filters.startDate ||
                            filters.endDate ||
                            (filters.status && !pendingOnly)) && (
                            <Button
                              variant="text"
                              onClick={handleClearFilters}
                              className="mt-2"
                            >
                              Hapus filter
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
            {pickupRequests.length > 0 && pagination && onPageChange && (
              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan{" "}
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}{" "}
                  dari {pagination.totalItems} data
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => {
                          if (pagination.currentPage > 1) {
                            onPageChange(pagination.currentPage - 1);
                          }
                        }}
                        className={
                          pagination.currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: pagination.totalPages }).map(
                      (_, index) => {
                        const page = index + 1;
                        // Show first page, last page, and pages around current page
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.currentPage - 1 &&
                            page <= pagination.currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                isActive={page === pagination.currentPage}
                                onClick={() => onPageChange(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }

                        // Show ellipsis if needed
                        if (
                          (page === 2 && pagination.currentPage > 3) ||
                          (page === pagination.totalPages - 1 &&
                            pagination.currentPage < pagination.totalPages - 2)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }

                        return null;
                      }
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => {
                          if (pagination.currentPage < pagination.totalPages) {
                            onPageChange(pagination.currentPage + 1);
                          }
                        }}
                        className={
                          pagination.currentPage >= pagination.totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Permintaan Pengambilan</DialogTitle>
          </DialogHeader>
          <PickupRequestDetail
            pickupRequest={selectedRequest}
            loading={false}
            showActions={false}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          open={false}
          onOpenChange={function (open: boolean): void {
            throw new Error("Function not implemented.");
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Permintaan Pengambilan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus permintaan pengambilan ini?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent
          open={false}
          onOpenChange={(open: boolean): void => {
            throw new Error("Function not implemented.");
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus === "FINISH"
                ? "Selesaikan Permintaan"
                : "Batalkan Permintaan"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === "FINISH"
                ? "Permintaan pengambilan akan ditandai sebagai selesai."
                : "Permintaan pengambilan akan dibatalkan."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Catatan (Opsional)
              </label>
              <Textarea
                id="notes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Tambahkan catatan jika diperlukan"
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusConfirm}>
              {pendingStatus === "FINISH" ? "Selesaikan" : "Batalkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default PickupRequestList;
