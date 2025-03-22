import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { MoreVertical, Edit, Trash2, Search, Truck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  deleteTruckQueue,
  updateTruckQueueStatus,
} from "../../store/slices/truckQueueSlice";
import TruckQueueForm from "./TruckQueueForm";

import { TruckQueue } from "@/types/loading";

interface TruckQueueListProps {
  truckQueues: TruckQueue[];
  loading: boolean;
}

const TruckQueueList: React.FC<TruckQueueListProps> = ({ truckQueues, loading }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);

  // State for form and dialogs
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [selectedQueue, setSelectedQueue] = useState<TruckQueue | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // Convert to constant since setter is unused

  // Get vehicle details
  const getVehicleDetails = (queue?: TruckQueue) => {
    if (!queue) return { noPolisi: "-", namaKendaraan: "-" };
    return {
      noPolisi: queue.truck?.noPolisi || "-",
      namaKendaraan: queue.truck?.namaKendaraan || "-",
    };
  };

  // Get employee details
  const getEmployeeDetails = (employeeId?: string) => {
    if (!employeeId) return { nama: "-", telepon: "-" };
    const employee = employees.find((e) => e._id === employeeId);
    return {
      nama: employee?.nama || "-",
      telepon: employee?.telepon || "-",
    };
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "MENUNGGU":
        return (
          <Badge variant="outline" className="bg-yellow-50">
            Menunggu
          </Badge>
        );
      case "MUAT":
        return (
          <Badge variant="outline" className="bg-blue-50">
            Sedang Muat
          </Badge>
        );
      case "BERANGKAT":
        return (
          <Badge variant="outline" className="bg-green-50">
            Berangkat
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter and paginate truck queues
  const filteredQueues = truckQueues.filter(
    (queue: TruckQueue) =>
      (branchId ? queue.cabangId === branchId : true) &&
      (status ? queue.status === status : true) &&
      (searchTerm
        ? getVehicleDetails(queue)
            .noPolisi.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          queue.supir?.nama.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );

  const totalPages = Math.ceil(filteredQueues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQueues = filteredQueues.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedQueue) {
      dispatch(deleteTruckQueue(selectedQueue._id));
      setOpenDeleteDialog(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = (queueId: string, newStatus: string) => {
    dispatch(
      updateTruckQueueStatus({
        id: queueId,
        status: newStatus,
      })
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Antrian Truck</CardTitle>
          <CardDescription>
            Kelola antrian truck untuk proses muat dan pengiriman
          </CardDescription>
        </div>

        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedQueue(null)}>
              <Truck className="mr-2 h-4 w-4" />
              Tambah Antrian Truck
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedQueue
                  ? "Edit Antrian Truck"
                  : "Tambah Antrian Truck Baru"}
              </DialogTitle>
            </DialogHeader>
            <TruckQueueForm
              initialData={selectedQueue}
              onSubmit={() => setOpenForm(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor polisi atau nama supir..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8" name={""}              />
            </div>

            <div className="flex gap-2">
              <Select value={branchId} onValueChange={setBranchId}>
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

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="MENUNGGU">Menunggu</SelectItem>
                  <SelectItem value="MUAT">Sedang Muat</SelectItem>
                  <SelectItem value="BERANGKAT">Berangkat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                    <TableHead>No. Polisi</TableHead>
                    <TableHead>Supir</TableHead>
                    <TableHead>Kenek</TableHead>
                    <TableHead>Urutan</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQueues.length > 0 ? (
                    paginatedQueues.map((queue) => {
                      return (
                        <TableRow key={queue._id}>
                          <TableCell className="font-medium">
                            <div>{queue.truck?.noPolisi || "-"}</div>
                            <div className="text-xs text-muted-foreground">
                              {queue.truck?.namaKendaraan || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{queue.supir?.nama || "-"}</div>
                            <div className="text-xs text-muted-foreground">
                              {queue.noTelp || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{queue.kenek?.nama || "-"}</div>
                            <div className="text-xs text-muted-foreground">
                              {queue.noTelpKenek || "-"}
                            </div>
                          </TableCell>
                          <TableCell>{queue.urutan}</TableCell>
                          <TableCell>{branch?.namaCabang || "-"}</TableCell>
                          <TableCell>{getStatusBadge(queue.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedQueue(queue);
                                    setOpenForm(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>

                                {queue.status === "MENUNGGU" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusUpdate(queue._id, "MUAT")
                                    }
                                  >
                                    <Truck className="mr-2 h-4 w-4" />
                                    Update ke Muat
                                  </DropdownMenuItem>
                                )}

                                {queue.status === "MUAT" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusUpdate(queue._id, "BERANGKAT")
                                    }
                                  >
                                    <Truck className="mr-2 h-4 w-4" />
                                    Update ke Berangkat
                                  </DropdownMenuItem>
                                )}

                                {queue.status === "MENUNGGU" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedQueue(queue);
                                      setOpenDeleteDialog(true);
                                    }}
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
                      <TableCell
                        colSpan={7}
                        className="text-center h-24 text-muted-foreground"
                      >
                        Tidak ada antrian truck yang ditemukan
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
                  Menampilkan {startIndex + 1}-
                  {Math.min(startIndex + itemsPerPage, filteredQueues.length)}{" "}
                  dari {filteredQueues.length} data
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
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
                        (pageNumber === totalPages - 1 &&
                          currentPage < totalPages - 2)
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
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        className={
                          currentPage === totalPages
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus antrian truck{" "}
              {getVehicleDetails(selectedQueue?.vehicleId).noPolisi}? Tindakan ini
              tidak dapat dibatalkan.
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
    </Card>
  );
};

export default TruckQueueList;