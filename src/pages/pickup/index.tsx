// src/pages/pickup/index.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  TablePagination,
  CircularProgress,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  Divider,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocalShipping as LocalShippingIcon,
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon,
  Place as PlaceIcon,
  Inventory as InventoryIcon,
  FileCopy as FileCopyIcon,
  Schedule as ScheduleIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  getPickupRequests,
  getPendingPickupRequests,
  createPickupRequest,
  updatePickupRequest,
  deletePickupRequest,
  updatePickupRequestStatus,
  getPickups,
  createPickup,
} from "../../store/slices/pickupRequestSlice";
import { getBranches } from "../../store/slices/branchSlice";
import { getSenders } from "../../store/slices/customerSlice";
import { getVehicles } from "../../store/slices/vehicleSlice";
import { getEmployees } from "../../store/slices/employeeSlice";
import { clearError, clearSuccess } from "../../store/slices/uiSlice";
import {
  PickupRequest,
  PickupRequestFormInputs,
  PickupFormInputs,
} from "../../types/pickupRequest";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import withAuth from "../../components/auth/withAuth";
import { useRouter } from "next/router";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Schema for pickup request form validation
const pickupRequestSchema = z.object({
  pengirimId: z.string().min(1, "Pengirim wajib dipilih"),
  alamatPengambilan: z.string().min(1, "Alamat pengambilan wajib diisi"),
  tujuan: z.string().min(1, "Tujuan wajib diisi"),
  jumlahColly: z.number().min(1, "Jumlah colly minimal 1"),
  cabangId: z.string().min(1, "Cabang wajib dipilih"),
});

// Schema for pickup form validation
const pickupSchema = z.object({
  pengirimId: z.string().min(1, "Pengirim wajib dipilih"),
  sttIds: z.array(z.string()).min(1, "STT wajib dipilih minimal 1"),
  supirId: z.string().min(1, "Supir wajib dipilih"),
  kenekId: z.string().optional(),
  kendaraanId: z.string().min(1, "Kendaraan wajib dipilih"),
  estimasiPengambilan: z.string().min(1, "Estimasi pengambilan wajib diisi"),
  cabangId: z.string().min(1, "Cabang wajib dipilih"),
  alamatPengambilan: z.string().min(1, "Alamat pengambilan wajib diisi"),
  tujuan: z.string(), // Add missing property validation
  jumlahColly: z.string(), // Add missing property validation
});

const PickupPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { pickupRequests, pendingRequests, pickups } = useSelector(
    (state: RootState) => state.pickupRequest
  );
  const { branches } = useSelector((state: RootState) => state.branch);
  const { senders } = useSelector((state: RootState) => state.customer);
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error, success } = useSelector(
    (state: RootState) => state.ui
  );

  const [tabValue, setTabValue] = useState(0);
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [openPickupDialog, setOpenPickupDialog] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PickupRequest | null>(
    null
  );
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterBranch, setFilterBranch] = useState<string>(
    user?.cabangId || ""
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null
  );

  const {
    control: requestControl,
    handleSubmit: handleRequestSubmit,
    reset: resetRequestForm,
    formState: { errors: requestErrors },
  } = useForm<PickupRequestFormInputs>({
    resolver: zodResolver(pickupRequestSchema),
    defaultValues: {
      pengirimId: "",
      alamatPengambilan: "",
      tujuan: "",
      jumlahColly: 1,
      cabangId: user?.cabangId || "",
    },
  });

  const {
    control: pickupControl,
    handleSubmit: handlePickupSubmit,
    reset: resetPickupForm,
    formState: { errors: pickupErrors },
  } = useForm<PickupFormInputs>({
    resolver: zodResolver(pickupSchema),
    defaultValues: {
      pengirimId: "",
      alamatPengambilan: "",
      cabangId: "",
      estimasiPengambilan: "",
      sttIds: [],
      supirId: "",
      kendaraanId: "",
      kenekId: undefined,
      tujuan: "", // Add missing property
      jumlahColly: "", // Add missing property (or appropriate default)
    },
  });

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      await Promise.all([
        dispatch(getBranches()).unwrap(),
        dispatch(getSenders()).unwrap()
      ]);
      
      dispatch(getVehicles());
      dispatch(getEmployees({}));
      dispatch(getPendingPickupRequests({}));

      // Load requests and pickups
      if (tabValue === 0) {
        dispatch(getPickupRequests({}));
      } else if (tabValue === 2) {
        dispatch(getPickups({}));
      }
    };

    loadData();
  }, [dispatch, tabValue]);

  useEffect(() => {
    // Filter by branch if set
    if (filterBranch) {
      // Here should be branch-specific calls, but skipping for brevity
    }
  }, [dispatch, filterBranch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenRequestDialog = (request?: PickupRequest) => {
    if (request) {
      setEditingRequest(request);
      resetRequestForm({
        pengirimId: request.pengirimId,
        alamatPengambilan: request.alamatPengambilan,
        tujuan: request.tujuan,
        jumlahColly: request.jumlahColly,
        cabangId: typeof request.cabangId === "string" ? request.cabangId : "",
      });
    } else {
      setEditingRequest(null);
      resetRequestForm({
        pengirimId: "",
        alamatPengambilan: "",
        tujuan: "",
        jumlahColly: 1,
        cabangId: user?.cabangId || "",
      });
    }
    setOpenRequestDialog(true);
  };

  const handleCloseRequestDialog = () => {
    setOpenRequestDialog(false);
    setEditingRequest(null);
  };

  const handleOpenPickupDialog = (request: PickupRequest) => {
    resetPickupForm({
      pengirimId: request.pengirimId,
      sttIds: [],
      supirId: "",
      kenekId: "",
      kendaraanId: "",
      estimasiPengambilan: "",
      cabangId: request ? request.cabangId : user?.cabangId || "",
      alamatPengambilan: request.alamatPengambilan,
    });
    setProcessingRequestId(request._id);
    setOpenPickupDialog(true);
  };

  const handleClosePickupDialog = () => {
    setOpenPickupDialog(false);
    setProcessingRequestId(null);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setRequestToDelete(id);
    setConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog(false);
    setRequestToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (requestToDelete) {
      dispatch(deletePickupRequest(requestToDelete));
    }
    handleCloseDeleteDialog();
  };

  const handleUpdateStatus = (id: string, status: "PENDING" | "FINISH") => {
    dispatch(updatePickupRequestStatus({ id, status }));
  };

  const onSubmitRequest = (data: PickupRequestFormInputs) => {
    if (editingRequest) {
      dispatch(
        updatePickupRequest({ id: editingRequest._id, requestData: data })
      );
    } else {
      dispatch(createPickupRequest(data));
    }
    handleCloseRequestDialog();
  };

  const onSubmitPickup = async (data: PickupFormInputs) => {
    try {
      await dispatch(createPickup(data)).unwrap();

      if (processingRequestId) {
        await dispatch(
          updatePickupRequestStatus({
            id: processingRequestId,
            status: "FINISH",
          })
        ).unwrap();
      }

      handleClosePickupDialog();
    } catch (error) {
      console.error("Failed to process pickup:", error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    dispatch(clearError());
    dispatch(clearSuccess());
  };

  const handleBranchFilter = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterBranch(event.target.value as string);
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTimeout(() => {
      setSearchTerm(value);
      setPage(0);
    }, 300); // Debounce for 300ms
  };

  // Filter functions
  const filterPickupRequests = (requests: PickupRequest[]) => {
    if (!Array.isArray(requests)) return [];

    return requests.filter((request) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          request.pengirim?.nama.toLowerCase().includes(searchLower) ||
          request.alamatPengambilan.toLowerCase().includes(searchLower) ||
          request.tujuan.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  };

  // Filtered and paginated data
  const filteredRequests = filterPickupRequests(pickupRequests || []);
  const filteredPendingRequests = filterPickupRequests(pendingRequests || []);

  const paginatedRequests = filteredRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  // No need to paginate pending requests since we're using card view
  const pendingRequestsToShow = filteredPendingRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const paginatedPickups = Array.isArray(pickups)
    ? pickups.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];

  // Filter employees to get drivers and assistants
  const drivers = employees.filter(
    (emp) => emp.jabatan === "Supir" || emp.role?.kodeRole === "supir"
  );

  const assistants = employees.filter(
    (emp) => emp.jabatan === "Kenek" || emp.role?.kodeRole === "kenek"
  );

  // Filter vehicles for pickups (only lansir vehicles)
  const pickupVehicles = Array.isArray(vehicles)
    ? vehicles.filter((vehicle) => vehicle.tipe === "lansir")
    : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Head>
        <title>Pengambilan Barang - Samudra ERP</title>
      </Head>

      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Pengambilan Barang</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenRequestDialog()}
          >
            Buat Permintaan Pengambilan
          </Button>
        </Box>

        <Paper sx={{ width: "100%", mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="pickup tabs"
            >
              <Tab label="Semua Permintaan" />
              <Tab label="Permintaan Pending" />
              <Tab label="Pengambilan" />
            </Tabs>
          </Box>

          <Box p={2}>
            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  label="Cari Permintaan"
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth>
                  <InputLabel id="branch-filter-label">Cabang</InputLabel>
                  <Select
                    labelId="branch-filter-label"
                    value={filterBranch}
                    label="Cabang"
                    onChange={handleBranchFilter as any}
                  >
                    <MenuItem key="all-branches" value="">
                      Semua Cabang
                    </MenuItem>
                    {Array.isArray(branches) &&
                      branches.map((branch) => (
                        <MenuItem key={branch._id} value={branch._id}>
                          {branch.namaCabang}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Pengirim</TableCell>
                      <TableCell>Alamat Pengambilan</TableCell>
                      <TableCell>Tujuan</TableCell>
                      <TableCell>Jumlah Colly</TableCell>
                      <TableCell>Cabang</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : paginatedRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Tidak ada data permintaan pengambilan
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRequests.map((request) => (
                        <TableRow key={request._id}>
                          <TableCell>
                            {formatDate(request.tanggal || request.createdAt)}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const sender = request.pengirim ||
                                (request.pengirimId && senders.find(s => s._id === request.pengirimId));
                              return sender ? sender.nama : "-";
                            })()}
                          </TableCell>
                          <TableCell>{request.alamatPengambilan}</TableCell>
                          <TableCell>{request.tujuan}</TableCell>
                          <TableCell>{request.jumlahColly}</TableCell>
                          <TableCell>
                            {(() => {
                              const branch = request.cabang ||
                                (request.cabangId && branches.find(b => b._id === request.cabangId));
                              return branch ? branch.namaCabang : "-";
                            })()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                request.status === "PENDING"
                                  ? "Pending"
                                  : "Selesai"
                              }
                              color={
                                request.status === "PENDING"
                                  ? "warning"
                                  : "success"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <span>
                                <IconButton
                                  onClick={() =>
                                    handleOpenRequestDialog(request)
                                  }
                                  disabled={request.status !== "PENDING"}
                                >
                                  <EditIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Update Status">
                              <span>
                                <IconButton
                                  onClick={() =>
                                    handleUpdateStatus(request._id, "FINISH")
                                  }
                                  disabled={request.status !== "PENDING"}
                                >
                                  <CheckIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Hapus">
                              <span>
                                <IconButton
                                  onClick={() =>
                                    handleOpenDeleteDialog(request._id)
                                  }
                                  disabled={request.status !== "PENDING"}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            {request.status === "PENDING" && (
                              <Tooltip title="Proses Pengambilan">
                                <IconButton
                                  color="primary"
                                  onClick={() =>
                                    handleOpenPickupDialog(request)
                                  }
                                >
                                  <DirectionsCarIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredRequests.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {loading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : filteredPendingRequests.length === 0 ? (
                  <Typography
                    variant="body1"
                    align="center"
                    color="text.secondary"
                    p={4}
                  >
                    Tidak ada permintaan pengambilan yang pending
                  </Typography>
                ) : (
                  filteredPendingRequests.map((request) => (
                    <Card key={request._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="center" mb={1}>
                              <PersonIcon
                                sx={{ mr: 1, color: "primary.main" }}
                              />
                              <Typography variant="subtitle1">
                                {(() => {
                                  const sender = request.pengirim ||
                                    (request.pengirimId && senders.find(s => s._id === request.pengirimId));
                                  return sender ? sender.nama : "Pengirim tidak diketahui";
                                })()}
                              </Typography>
                            </Box>

                            <Box display="flex" alignItems="flex-start" mb={1}>
                              <PlaceIcon
                                sx={{ mr: 1, color: "secondary.main", mt: 0.5 }}
                              />
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Alamat Pengambilan:
                                </Typography>
                                <Typography variant="body2">
                                  {request.alamatPengambilan}
                                </Typography>
                              </Box>
                            </Box>

                            <Box display="flex" alignItems="center" mb={1}>
                              <InventoryIcon
                                sx={{ mr: 1, color: "warning.main" }}
                              />
                              <Typography variant="body2">
                                {request.jumlahColly} Colly
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="flex-start" mb={1}>
                              <LocalShippingIcon
                                sx={{ mr: 1, color: "info.main", mt: 0.5 }}
                              />
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Tujuan:
                                </Typography>
                                <Typography variant="body2">
                                  {request.tujuan}
                                </Typography>
                              </Box>
                            </Box>

                            <Box display="flex" alignItems="center" mb={1}>
                              <FileCopyIcon
                                sx={{ mr: 1, color: "success.main" }}
                              />
                              <Typography variant="body2">
                                Cabang:{" "}
                                {(() => {
                                  const branch = request.cabang ||
                                    (request.cabangId && branches.find(b => b._id === request.cabangId));
                                  return branch ? branch.namaCabang : "-";
                                })()}
                              </Typography>
                            </Box>

                            <Box display="flex" alignItems="center">
                              <ScheduleIcon
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {formatDate(
                                  request.tanggal || request.createdAt
                                )}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>

                      <CardActions
                        sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}
                      >
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenRequestDialog(request)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleOpenDeleteDialog(request._id)}
                        >
                          Hapus
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<DirectionsCarIcon />}
                          onClick={() => handleOpenPickupDialog(request)}
                        >
                          Proses
                        </Button>
                      </CardActions>
                    </Card>
                  ))
                )}

                <Box mt={2}>
                  <TablePagination
                    component="div"
                    count={filteredPendingRequests.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>No. Pengambilan</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Pengirim</TableCell>
                      <TableCell>Supir</TableCell>
                      <TableCell>Kendaraan</TableCell>
                      <TableCell>Jumlah STT</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : paginatedPickups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Tidak ada data pengambilan
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPickups.map((pickup) => (
                        <TableRow key={pickup._id}>
                          <TableCell>{pickup?.noPengambilan}</TableCell>
                          <TableCell>
                            {formatDate(pickup?.tanggal || pickup?.createdAt)}
                          </TableCell>
                          <TableCell>{pickup?.pengirim?.nama || "-"}</TableCell>
                          <TableCell>{pickup?.supir?.nama || "-"}</TableCell>
                          <TableCell>
                            {pickup?.kendaraan?.noPolisi || "-"}
                          </TableCell>
                          <TableCell>{pickup?.sttIds?.length || 0}</TableCell>
                          <TableCell>
                            <Chip
                              label={
                                pickup?.waktuPulang ? "Selesai" : "Dalam Proses"
                              }
                              color={
                                pickup?.waktuPulang ? "success" : "warning"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Lihat Detail">
                              <IconButton
                                onClick={() =>
                                  router.push(`/pickup/${pickup._id}`)
                                }
                              >
                                <FileCopyIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={pickups.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TabPanel>
          </Box>
        </Paper>
      </Box>

      {/* Pickup Request Dialog */}
      <Dialog
        open={openRequestDialog}
        onClose={handleCloseRequestDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingRequest
            ? "Edit Permintaan Pengambilan"
            : "Buat Permintaan Pengambilan"}
        </DialogTitle>
        <Box component="form" onSubmit={handleRequestSubmit(onSubmitRequest)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="pengirimId"
                  control={requestControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Pengirim"
                      error={!!requestErrors.pengirimId}
                      helperText={requestErrors.pengirimId?.message}
                      fullWidth
                      value={typeof field.value === "string" ? field.value : ""}
                    >
                      <MenuItem key="select-sender" value="">
                        Pilih Pengirim...
                      </MenuItem>
                      {Array.isArray(senders) &&
                        senders.map((sender) => (
                          <MenuItem key={sender._id} value={sender._id}>
                            {sender.nama}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="alamatPengambilan"
                  control={requestControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Alamat Pengambilan"
                      fullWidth
                      margin="normal"
                      multiline
                      rows={2}
                      error={!!requestErrors.alamatPengambilan}
                      helperText={requestErrors.alamatPengambilan?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PlaceIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="tujuan"
                  control={requestControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tujuan"
                      fullWidth
                      margin="normal"
                      error={!!requestErrors.tujuan}
                      helperText={requestErrors.tujuan?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocalShippingIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="jumlahColly"
                  control={requestControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Jumlah Colly"
                      fullWidth
                      margin="normal"
                      type="number"
                      inputProps={{ min: 1 }}
                      error={!!requestErrors.jumlahColly}
                      helperText={requestErrors.jumlahColly?.message}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <InventoryIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="cabangId"
                  control={requestControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Cabang"
                      fullWidth
                      margin="normal"
                      error={!!requestErrors.cabangId}
                      helperText={requestErrors.cabangId?.message}
                      disabled={!!user?.cabangId}
                      value={typeof field.value === "string" ? field.value : ""}
                    >
                      <MenuItem key="select-branch" value="">
                        Pilih Cabang...
                      </MenuItem>
                      {Array.isArray(branches) &&
                        branches.map((branch) => (
                          <MenuItem key={branch._id} value={branch._id}>
                            {branch.namaCabang}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRequestDialog}>Batal</Button>
            <Button type="submit" variant="contained">
              {editingRequest ? "Perbarui" : "Simpan"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Pickup Dialog */}
      <Dialog
        open={openPickupDialog}
        onClose={handleClosePickupDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Proses Pengambilan</DialogTitle>
        <Box component="form" onSubmit={handlePickupSubmit(onSubmitPickup)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Informasi Kendaraan
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="supirId"
                  control={pickupControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Supir"
                      fullWidth
                      margin="normal"
                      error={!!pickupErrors.supirId}
                      helperText={pickupErrors.supirId?.message}
                    >
                      <MenuItem key="select-driver" value="">
                        Pilih Supir...
                      </MenuItem>
                      {Array.isArray(drivers) &&
                        drivers.map((driver) => (
                          <MenuItem key={driver._id} value={driver._id}>
                            {driver.nama}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="kenekId"
                  control={pickupControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Kenek (Opsional)"
                      fullWidth
                      margin="normal"
                      error={!!pickupErrors.kenekId}
                      helperText={pickupErrors.kenekId?.message}
                    >
                      <MenuItem key="select-assistant" value="">
                        Pilih Kenek...
                      </MenuItem>
                      {Array.isArray(assistants) &&
                        assistants.map((assistant) => (
                          <MenuItem key={assistant._id} value={assistant._id}>
                            {assistant.nama}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="kendaraanId"
                  control={pickupControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Kendaraan"
                      fullWidth
                      margin="normal"
                      error={!!pickupErrors.kendaraanId}
                      helperText={pickupErrors.kendaraanId?.message}
                    >
                      <MenuItem key="select-vehicle" value="">
                        Pilih Kendaraan...
                      </MenuItem>
                      {Array.isArray(pickupVehicles) &&
                        pickupVehicles.map((vehicle) => (
                          <MenuItem key={vehicle._id} value={vehicle._id}>
                            {vehicle.namaKendaraan} ({vehicle.noPolisi})
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="estimasiPengambilan"
                  control={pickupControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Estimasi Pengambilan"
                      fullWidth
                      margin="normal"
                      error={!!pickupErrors.estimasiPengambilan}
                      helperText={pickupErrors.estimasiPengambilan?.message}
                      placeholder="contoh: 1 jam"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ScheduleIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box mt={2} mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Catatan: Setelah kendaraan berangkat, Anda dapat menambahkan
                    STT ke dalam pengambilan ini.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePickupDialog}>Batal</Button>
            <Button type="submit" variant="contained">
              Proses Pengambilan
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus permintaan pengambilan ini?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Batal</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar untuk notifikasi */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default withAuth(PickupPage);
