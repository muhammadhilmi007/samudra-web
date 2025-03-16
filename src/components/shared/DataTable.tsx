// src/components/shared/DataTable.tsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string | React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  title: string;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  title,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  onSelectionChange,
  searchable = true,
  searchPlaceholder = 'Cari...',
  loading = false,
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      if (onSelectionChange) {
        onSelectionChange(rows);
      }
      return;
    }
    setSelected([]);
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    if (!selectable) return;

    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);

    if (onSelectionChange) {
      const selectedRows = rows.filter((row) => newSelected.includes(row.id));
      onSelectionChange(selectedRows);
    }
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const filteredRows = rows.filter((row) => {
    if (!searchTerm) return true;
    
    return Object.keys(row).some((key) => {
      const value = row[key];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        {searchable && (
          <TextField
            variant="outlined"
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: 300 }}
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
                    aria-label="clear search"
                    onClick={clearSearch}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}
                >
                  {column.label}
                </TableCell>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableCell 
                  align="center" 
                  style={{ minWidth: 100, fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}
                >
                  Aksi
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => {
              const isItemSelected = isSelected(row.id);
              
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.id || index}
                  selected={isItemSelected}
                  onClick={(event) => selectable && handleClick(event, row.id)}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                  {(onEdit || onDelete || onView) && (
                    <TableCell align="center">
                      {onView && (
                        <Tooltip title="Lihat Detail">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(row);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onEdit && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <Tooltip title="Hapus">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {paginatedRows.length === 0 && (
              <TableRow style={{ height: 53 * 5 }}>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + ((onEdit || onDelete || onView) ? 1 : 0)}
                  align="center"
                >
                  {loading ? (
                    'Memuat data...'
                  ) : searchTerm ? (
                    'Tidak ada data yang sesuai dengan pencarian'
                  ) : (
                    'Tidak ada data'
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Baris per halaman:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
      />
    </Paper>
  );
};

export default DataTable;