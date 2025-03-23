// src/pages/branch/index.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Tab,
  Tabs,
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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BusinessCenter as BusinessIcon,
  Domain as DomainIcon,
} from "@mui/icons-material";
import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import {
  selectBranchData,
  selectDivisionList,
  selectUiState
} from "../../store/selectors/branchSelectors";
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchesByDivision,
} from "../../store/slices/branchSlice";
import {
  getDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
} from "../../store/slices/divisionSlice";
import { clearError, clearSuccess } from "../../store/slices/uiSlice";
import { Branch } from "../../types/branch";
import type { Division, DivisionFormInputs } from "../../types/division";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import withAuth from "../../components/auth/withAuth";

// Schema for division form validation
const divisionSchema = z.object({
  namaDivisi: z.string().min(1, "Nama divisi wajib diisi"),
});

// Schema for branch form validation
const branchSchema = z.object({
  namaCabang: z.string().min(1, "Nama cabang wajib diisi"),
  divisiId: z.string().min(1, "Divisi wajib dipilih"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  kelurahan: z.string().min(1, "Kelurahan wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
  kota: z.string().min(1, "Kota wajib diisi"),
  provinsi: z.string().min(1, "Provinsi wajib diisi"),
  "kontakPenanggungJawab.nama": z.string().optional(),
  "kontakPenanggungJawab.telepon": z.string().optional(),
  "kontakPenanggungJawab.email": z
    .string()
    .email("Email tidak valid")
    .optional()
    .or(z.literal("")),
});

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
      tabIndex={0}
      onClick={() => {
        const element = document.querySelector(`[role="tabpanel"][hidden="false"]`);
        if (element) (element as HTMLElement).focus();
      }}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const BranchAndDivisionPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Ensure branches are initialized as arrays
  // Branch state
  const { branches, isLoading } = useSelector(selectBranchData);
  const divisions = useSelector(selectDivisionList);
  const { error: uiError, success } = useSelector(selectUiState);

  const [tabValue, setTabValue] = useState(0);
  const [openDivisionDialog, setOpenDivisionDialog] = useState(false);
  const [openBranchDialog, setOpenBranchDialog] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "branch" | "division";
  } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterDivision, setFilterDivision] = useState<string>("");

  const {
    control: divisionControl,
    handleSubmit: handleDivisionSubmit,
    reset: resetDivisionForm,
    formState: { errors: divisionErrors },
  } = useForm<DivisionFormInputs>({
    resolver: zodResolver(divisionSchema),
    defaultValues: {
      namaDivisi: "",
    },
  });

  const {
    control: branchControl,
    handleSubmit: handleBranchSubmit,
    reset: resetBranchForm,
    formState: { errors: branchErrors },
  } = useForm<z.infer<typeof branchSchema>>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      namaCabang: "",
      divisiId: "",
      alamat: "",
      kelurahan: "",
      kecamatan: "",
      kota: "",
      provinsi: "",
      "kontakPenanggungJawab.nama": "",
      "kontakPenanggungJawab.telepon": "",
      "kontakPenanggungJawab.email": "",
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await dispatch(getDivisions()).unwrap();
        const branchesResult = await dispatch(getBranches()).unwrap();
        console.log("Branches loaded:", branchesResult);
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };
    loadInitialData();
  }, [dispatch]);

  useEffect(() => {
    if (filterDivision) {
      dispatch(getBranchesByDivision(filterDivision));
    } else {
      dispatch(getBranches());
    }
  }, [dispatch, filterDivision]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDivisionDialog = (division?: Division) => {
    if (division) {
      setEditingDivision(division);
      resetDivisionForm({
        namaDivisi: division.namaDivisi,
      });
    } else {
      setEditingDivision(null);
      resetDivisionForm({
        namaDivisi: "",
      });
    }
    setOpenDivisionDialog(true);
  };

  const handleCloseDivisionDialog = () => {
    setOpenDivisionDialog(false);
    setEditingDivision(null);
  };

  const handleOpenBranchDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      resetBranchForm({
        namaCabang: branch.namaCabang,
        divisiId: branch.divisiId._id,
        alamat: branch.alamat,
        kelurahan: branch.kelurahan,
        kecamatan: branch.kecamatan,
        kota: branch.kota,
        provinsi: branch.provinsi,
        "kontakPenanggungJawab.nama": branch.kontakPenanggungJawab?.nama || "",
        "kontakPenanggungJawab.telepon": branch.kontakPenanggungJawab?.telepon || "",
        "kontakPenanggungJawab.email": branch.kontakPenanggungJawab?.email || "",
      });
    } else {
      setEditingBranch(null);
      resetBranchForm({
        namaCabang: "",
        divisiId: "",
        alamat: "",
        kelurahan: "",
        kecamatan: "",
        kota: "",
        provinsi: "",
        "kontakPenanggungJawab.nama": "",
        "kontakPenanggungJawab.telepon": "",
        "kontakPenanggungJawab.email": "",
      });
    }
    setOpenBranchDialog(true);
  };

  const handleCloseBranchDialog = () => {
    setOpenBranchDialog(false);
    setEditingBranch(null);
  };

  const handleOpenDeleteDialog = (id: string, type: "branch" | "division") => {
    setItemToDelete({ id, type });
    setConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog(false);
    setItemToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      if (itemToDelete.type === "division") {
        dispatch(deleteDivision(itemToDelete.id));
      } else {
        dispatch(deleteBranch(itemToDelete.id));
      }
    }
    handleCloseDeleteDialog();
  };

  const onSubmitDivision = (data: DivisionFormInputs) => {
    if (editingDivision) {
      dispatch(updateDivision({ id: editingDivision._id, divisionData: data }));
    } else {
      dispatch(createDivision(data));
    }
    handleCloseDivisionDialog();
  };

  const onSubmitBranch = (data: z.infer<typeof branchSchema>) => {
    // Transform data from form format to API format
    const branchData: Partial<Branch> = {
      namaCabang: data.namaCabang,
      divisiId: { _id: data.divisiId, namaDivisi: '', createdAt: '', updatedAt: '', __v: 0 },
      alamat: data.alamat,
      kelurahan: data.kelurahan,
      kecamatan: data.kecamatan,
      kota: data.kota,
      provinsi: data.provinsi,
      kontakPenanggungJawab: {
        nama: data["kontakPenanggungJawab.nama"] || "",
        telepon: data["kontakPenanggungJawab.telepon"] || "",
        email: data["kontakPenanggungJawab.email"] || "",
      },
    };

    console.log("Submitting branch data:", branchData);

    if (editingBranch) {
      dispatch(updateBranch({ id: editingBranch._id, branchData }));
    } else {
      dispatch(createBranch({
        namaCabang: branchData.namaCabang!,
        divisiId: data.divisiId,
        alamat: branchData.alamat!,
        kelurahan: branchData.kelurahan!,
        kecamatan: branchData.kecamatan!,
        kota: branchData.kota!,
        provinsi: branchData.provinsi!,
        kontakPenanggungJawab: branchData.kontakPenanggungJawab || {
          nama: "",
          telepon: "",
          email: ""
        }
      }));
    }
    handleCloseBranchDialog();
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

  const handleDivisionFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDivision(event.target.value);
  };

  // Add this helper function
  const branchesInDivision = (divisionId: string) => {
    return Array.isArray(branches)
      ? branches.filter((branch) => branch.divisiId._id === divisionId)
      : [];
  };

  // Pagination
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedBranches = useMemo(() => {
    if (!Array.isArray(branches)) {
      console.warn("Branches is not an array:", branches);
      return [];
    }
    return branches.slice(startIndex, endIndex);
  }, [branches, startIndex, endIndex]);
  const paginatedDivisions = divisions.slice(startIndex, endIndex);

  return (
    <>
      <Head>
        <title>Cabang & Divisi - Samudra ERP</title>
      </Head>

      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Cabang & Divisi</Typography>
        </Box>

        <Paper sx={{ width: "100%", mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Cabang" icon={<BusinessIcon />} iconPosition="start" />
            <Tab label="Divisi" icon={<DomainIcon />} iconPosition="start" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <TextField
                select
                label="Filter Divisi"
                value={filterDivision}
                onChange={handleDivisionFilter}
                sx={{ width: 200 }}
              >
                <MenuItem value="">Semua Divisi</MenuItem>
                {divisions.map((division) => (
                  <MenuItem key={division._id} value={division._id}>
                    {division.namaDivisi}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenBranchDialog()}
              >
                Tambah Cabang
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Cabang</TableCell>
                    <TableCell>Divisi</TableCell>
                    <TableCell>Alamat</TableCell>
                    <TableCell>Kota</TableCell>
                    <TableCell>Provinsi</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : paginatedBranches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Tidak ada data cabang
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBranches.map((branch) => (
                      <TableRow key={branch._id}>
                        <TableCell>{branch.namaCabang}</TableCell>
                        <TableCell>
                          {isLoading ? (
                            <CircularProgress size={20} />
                          ) : divisions && Array.isArray(divisions) && divisions.length > 0 && branch.divisiId ? (
                            branch.divisiId?.namaDivisi || "-"
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{branch.alamat}</TableCell>
                        <TableCell>{branch.kota}</TableCell>
                        <TableCell>{branch.provinsi}</TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleOpenBranchDialog(branch)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus">
                            <IconButton
                              onClick={() =>
                                handleOpenDeleteDialog(branch._id, "branch")
                              }
                            >
                              <DeleteIcon />
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
              count={Array.isArray(branches) ? branches.length : 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDivisionDialog()}
              >
                Tambah Divisi
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Divisi</TableCell>
                    <TableCell>Jumlah Cabang</TableCell>
                    <TableCell>Tanggal Dibuat</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : paginatedDivisions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Tidak ada data divisi
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDivisions.map((division) => (
                      <TableRow key={division._id}>
                        <TableCell>{division.namaDivisi}</TableCell>
                        <TableCell>
                          {branchesInDivision(division._id).length}
                        </TableCell>
                        <TableCell>
                          {new Date(division.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleOpenDivisionDialog(division)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus">
                            <IconButton
                              onClick={() =>
                                handleOpenDeleteDialog(division._id, "division")
                              }
                            >
                              <DeleteIcon />
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
              count={divisions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TabPanel>
        </Paper>
      </Box>

      {/* Division Dialog */}
      <Dialog
        open={openDivisionDialog}
        onClose={handleCloseDivisionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingDivision ? "Edit Divisi" : "Tambah Divisi"}
        </DialogTitle>
        <Box component="form" onSubmit={handleDivisionSubmit(onSubmitDivision)}>
          <DialogContent>
            <Controller
              name="namaDivisi"
              control={divisionControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nama Divisi"
                  fullWidth
                  margin="normal"
                  error={!!divisionErrors.namaDivisi}
                  helperText={(divisionErrors.namaDivisi?.message || '') as string}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDivisionDialog}>Batal</Button>
            <Button type="submit" variant="contained">
              {editingDivision ? "Perbarui" : "Simpan"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Branch Dialog */}
      <Dialog
        open={openBranchDialog}
        onClose={handleCloseBranchDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingBranch ? "Edit Cabang" : "Tambah Cabang"}
        </DialogTitle>
        <Box component="form" onSubmit={handleBranchSubmit(onSubmitBranch)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="namaCabang"
                  control={branchControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nama Cabang"
                      fullWidth
                      margin="normal"
                      error={!!branchErrors.namaCabang}
                      helperText={branchErrors.namaCabang?.message as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="divisiId"
                  control={branchControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Divisi"
                      fullWidth
                      margin="normal"
                      error={!!branchErrors.divisiId}
                      helperText={branchErrors.divisiId?.message as string}
                    >
                      {divisions.map((division) => (
                        <MenuItem key={division._id} value={division._id}>
                          {division.namaDivisi}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="alamat"
                  control={branchControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Alamat"
                      fullWidth
                      margin="normal"
                      error={!!branchErrors.alamat}
                      helperText={(branchErrors.alamat?.message || '') as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="kelurahan"
                  control={branchControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kelurahan"
                      fullWidth
                      margin="normal"
                      error={!!branchErrors.kelurahan}
                      helperText={branchErrors.kelurahan?.message as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="kecamatan"
                  control={branchControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kecamatan"
                      fullWidth
                      margin="normal"
                      error={!!branchErrors.kecamatan}
                      helperText={(branchErrors.kecamatan?.message || '') as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="kota"
                  control={branchControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kota"
                      fullWidth
                      margin="normal"
                      error={!!branchErrors.kota}
                      helperText={(branchErrors.kota?.message || '') as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="provinsi"
                  control={branchControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Provinsi"
                      fullWidth
                      margin="normal"
                      error={!!branchErrors.provinsi}
                      helperText={(branchErrors.provinsi?.message || '') as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" mt={2}>
                  Informasi Penanggung Jawab
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="kontakPenanggungJawab.nama"
                  control={branchControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nama Penanggung Jawab"
                      fullWidth
                      margin="normal"
                      error={!!branchErrors["kontakPenanggungJawab.nama"]}
                      helperText={(branchErrors["kontakPenanggungJawab.nama"]?.message || '') as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="kontakPenanggungJawab.telepon"
                  control={branchControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Telepon Penanggung Jawab"
                      fullWidth
                      margin="normal"
                      error={!!branchErrors["kontakPenanggungJawab.telepon"]}
                      helperText={(branchErrors["kontakPenanggungJawab.telepon"]?.message || '') as string}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="kontakPenanggungJawab.email"
                  control={branchControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email Penanggung Jawab"
                      fullWidth
                      margin="normal"
                      error={!!branchErrors["kontakPenanggungJawab.email"]}
                      helperText={(branchErrors["kontakPenanggungJawab.email"]?.message || '') as string}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBranchDialog}>Batal</Button>
            <Button type="submit" variant="contained">
              {editingBranch ? "Perbarui" : "Simpan"}
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
            Apakah Anda yakin ingin menghapus{" "}
            {itemToDelete?.type === "division" ? "divisi" : "cabang"} ini?
            {itemToDelete?.type === "division" && (
              <Box mt={1}>
                <Typography color="error">
                  Perhatian: Menghapus divisi akan menghapus semua cabang yang
                  terkait dengan divisi tersebut!
                </Typography>
              </Box>
            )}
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
        open={!!uiError || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={uiError ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {uiError || success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default withAuth(BranchAndDivisionPage);