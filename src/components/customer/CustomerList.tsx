// src/components/customer/CustomerList.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Grid,
  Avatar,
  Badge,
  Alert,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Add as AddIcon,
  GridView as GridViewIcon,
  List as ListIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  getCustomers,
  getCustomersByBranch,
  getCustomersByType,
  deleteCustomer,
} from '../../store/slices/customerSlice';
import { getBranches } from '../../store/slices/branchSlice';
import { Customer } from '../../types/customer';
import ConfirmDialog from '../shared/ConfirmDialog';

interface CustomerListProps {
  onAdd: () => void;
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  viewMode?: 'table' | 'card';
  branchFilter?: string;
  typeFilter?: string;
}

const CustomerList: React.FC<CustomerListProps> = ({
  onAdd,
  onEdit,
  onView,
  viewMode = 'table',
  branchFilter,
  typeFilter,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { customers } = useSelector((state: RootState) => state.customer);
  const { branches } = useSelector((state: RootState) => state.branch);
  const { loading } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(branchFilter || (typeof user?.cabangId === 'string' ? user.cabangId : ''));
  const [selectedType, setSelectedType] = useState(typeFilter || '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [displayMode, setDisplayMode] = useState<'table' | 'card'>(viewMode);

  // Fetch initial data
  useEffect(() => {
    if (branches.length === 0) {
      dispatch(getBranches());
    }
    
    if (branchFilter) {
      setSelectedBranch(branchFilter);
    }
    
    if (typeFilter) {
      setSelectedType(typeFilter);
    }
    
    // Apply filters on initial load
    applyFilters();
  }, [dispatch, branchFilter, typeFilter, branches.length]);

  // Apply branch and type filters
  useEffect(() => {
    applyFilters();
  }, [selectedBranch, selectedType]);

  // Apply all filters
  const applyFilters = () => {
    if (selectedBranch && selectedType) {
      // If both filters are active, fetch by branch and then filter by type client-side
      dispatch(getCustomersByBranch(selectedBranch));
    } else if (selectedBranch) {
      dispatch(getCustomersByBranch(selectedBranch));
    } else if (selectedType) {
      dispatch(getCustomersByType(selectedType));
    } else {
      dispatch(getCustomers());
    }
  };

  // Handle refresh data
  const handleRefresh = () => {
    applyFilters();
  };

  // Handle branch filter change
  const handleBranchChange = (event: SelectChangeEvent<string>) => {
    setSelectedBranch(event.target.value);
    setPage(0);
  };

  // Handle customer type filter change
  const handleTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedType(event.target.value as string);
    setPage(0);
  };

  // Handle search term change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    if (!branchFilter) setSelectedBranch('');
    if (!typeFilter) setSelectedType('');
    setPage(0);
  };

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      customer.nama.toLowerCase().includes(searchTermLower) ||
      (customer.perusahaan?.toLowerCase() || '').includes(searchTermLower) ||
      customer.telepon.includes(searchTerm) ||
      (customer.email?.toLowerCase() || '').includes(searchTermLower) ||
      customer.alamat.toLowerCase().includes(searchTermLower) ||
      customer.kota.toLowerCase().includes(searchTermLower)
    );
  });

  // Apply type filter manually if both filters are active
  const finalFilteredCustomers = selectedBranch && selectedType
    ? filteredCustomers.filter(customer => customer.tipe === selectedType)
    : filteredCustomers;

  // Get paginated customers
  const paginatedCustomers = finalFilteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Open delete confirmation dialog
  const handleConfirmDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setConfirmDelete(true);
  };

  // Close delete confirmation dialog
  const handleCancelDelete = () => {
    setSelectedCustomer(null);
    setConfirmDelete(false);
  };

  // Delete customer
  const handleDelete = () => {
    if (selectedCustomer) {
      dispatch(deleteCustomer(selectedCustomer._id)).then((result) => {
        // Check if the action was fulfilled (successful)
        if (result.meta.requestStatus === 'fulfilled') {
          applyFilters();
        }
      });
      handleCancelDelete();
    }
  };

  // Get customer type chip color
  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'Pengirim':
        return 'primary';
      case 'Penerima':
        return 'secondary';
      case 'Keduanya':
        return 'success';
      default:
        return 'default';
    }
  };

  // Toggle display mode
  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'table' ? 'card' : 'table');
  };

  // Get branch name by ID
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };

  // Render table view
  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nama</TableCell>
            <TableCell>Tipe</TableCell>
            <TableCell>Perusahaan</TableCell>
            <TableCell>Telepon</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Alamat</TableCell>
            <TableCell>Kota</TableCell>
            <TableCell>Cabang</TableCell>
            <TableCell align="center">Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && !paginatedCustomers.length ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <CircularProgress size={24} sx={{ my: 2 }} />
              </TableCell>
            </TableRow>
          ) : !paginatedCustomers.length ? (
            <TableRow>
              <TableCell colSpan={9} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  Tidak ada data customer
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedCustomers.map((customer) => (
              <TableRow
                key={customer._id}
                hover
                onClick={() => onView(customer)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{customer.nama}</TableCell>
                <TableCell>
                  <Chip
                    label={customer.tipe}
                    color={getCustomerTypeColor(customer.tipe) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{customer.perusahaan || '-'}</TableCell>
                <TableCell>{customer.telepon}</TableCell>
                <TableCell>{customer.email || '-'}</TableCell>
                <TableCell>{customer.alamat}</TableCell>
                <TableCell>{customer.kota}</TableCell>
                <TableCell>{getBranchName(customer.cabangId)}</TableCell>
                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Lihat Detail">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(customer);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(customer);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Hapus">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmDelete(customer);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render card view
  const renderCardView = () => (
    <Grid container spacing={2}>
      {loading && !paginatedCustomers.length ? (
        <Grid item xs={12} textAlign="center">
          <CircularProgress size={24} sx={{ my: 2 }} />
        </Grid>
      ) : !paginatedCustomers.length ? (
        <Grid item xs={12} textAlign="center">
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Tidak ada data customer
          </Typography>
        </Grid>
      ) : (
        paginatedCustomers.map((customer) => (
          <Grid item xs={12} sm={6} md={4} key={customer._id}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 }
              }}
              onClick={() => onView(customer)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ mr: 2, bgcolor: getCustomerTypeColor(customer.tipe) + '.main' }}>
                    {customer.nama.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" component="div">
                      {customer.nama}
                    </Typography>
                    <Chip
                      label={customer.tipe}
                      color={getCustomerTypeColor(customer.tipe) as any}
                      size="small"
                    />
                  </Box>
                </Box>

                {customer.perusahaan && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{customer.perusahaan}</Typography>
                  </Box>
                )}

                <Box display="flex" alignItems="center" mb={1}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{customer.telepon}</Typography>
                </Box>

                {customer.email && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" noWrap>{customer.email}</Typography>
                  </Box>
                )}

                <Box display="flex" alignItems="flex-start" mb={1}>
                  <LocationOnIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" noWrap>
                    {customer.alamat}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="caption" color="text.secondary">
                    {getBranchName(customer.cabangId)}
                  </Typography>
                  
                  <Box onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Lihat Detail">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(customer);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(customer);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmDelete(customer);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );

  return (
    <Box>
      {/* Filters and Controls */}
      <Box mb={3} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" gap={2}>
        <TextField
          size="small"
          label="Cari Customer"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                  edge="end"
                  aria-label="clear search"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="branch-filter-label">Cabang</InputLabel>
          <Select
            labelId="branch-filter-label"
            label="Cabang"
            value={selectedBranch}
            onChange={(event) => handleBranchChange(event)}
            disabled={!!branchFilter}
          >
            <MenuItem value="">Semua Cabang</MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch._id} value={branch._id}>
                {branch.namaCabang}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="type-filter-label">Tipe</InputLabel>
          <Select
            labelId="type-filter-label"
            label="Tipe"
            value={selectedType}
            onChange={handleTypeChange as any}
            disabled={!!typeFilter}
          >
            <MenuItem value="">Semua Tipe</MenuItem>
            <MenuItem value="Pengirim">Pengirim</MenuItem>
            <MenuItem value="Penerima">Penerima</MenuItem>
            <MenuItem value="Keduanya">Keduanya</MenuItem>
          </Select>
        </FormControl>
        
        <Tooltip title="Refresh Data">
          <IconButton onClick={handleRefresh} color="default">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={displayMode === 'table' ? 'Tampilan Kartu' : 'Tampilan Tabel'}>
          <IconButton onClick={toggleDisplayMode} color="primary">
            {displayMode === 'table' ? <GridViewIcon /> : <ListIcon />}
          </IconButton>
        </Tooltip>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Tambah Customer
        </Button>
      </Box>

      {/* Filter info alert */}
      {(searchTerm || selectedBranch || selectedType) && (
        <Box mb={2}>
          <Alert 
            severity="info"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
            }
          >
            Menampilkan data dengan filter
            {selectedBranch && <Chip 
              label={`Cabang: ${getBranchName(selectedBranch)}`} 
              size="small" 
              sx={{ ml: 1 }} 
              onDelete={!branchFilter ? () => setSelectedBranch('') : undefined}
            />}
            {selectedType && <Chip 
              label={`Tipe: ${selectedType}`}
              size="small"
              sx={{ ml: 1 }}
              color={getCustomerTypeColor(selectedType) as any}
              onDelete={!typeFilter ? () => setSelectedType('') : undefined}
            />}
            {searchTerm && <Chip 
              label={`Pencarian: ${searchTerm}`} 
              size="small" 
              sx={{ ml: 1 }} 
              onDelete={() => setSearchTerm('')}
            />}
          </Alert>
        </Box>
      )}

      {/* Data count summary */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Total: {finalFilteredCustomers.length} customer{finalFilteredCustomers.length !== 1 ? 's' : ''}
          {finalFilteredCustomers.length !== customers.length && ` (dari ${customers.length} total)`}
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Badge badgeContent={customers.filter(c => c.tipe === 'Pengirim').length} color="primary" showZero>
            <Chip label="Pengirim" size="small" color="primary" variant="outlined" />
          </Badge>
          <Badge badgeContent={customers.filter(c => c.tipe === 'Penerima').length} color="secondary" showZero>
            <Chip label="Penerima" size="small" color="secondary" variant="outlined" />
          </Badge>
          <Badge badgeContent={customers.filter(c => c.tipe === 'Keduanya').length} color="success" showZero>
            <Chip label="Keduanya" size="small" color="success" variant="outlined" />
          </Badge>
        </Box>
      </Box>

      {/* Display customers based on view mode */}
      {displayMode === 'table' ? renderTableView() : renderCardView()}

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={finalFilteredCustomers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Baris per halaman:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete}
        title="Hapus Customer"
        content={`Apakah Anda yakin ingin menghapus customer "${selectedCustomer?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        onClose={handleCancelDelete}
      />
    </Box>
  );
};

export default CustomerList;