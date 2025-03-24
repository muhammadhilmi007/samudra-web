import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Branch } from '../../types/branch';
import BranchForm from './BranchForm';

interface BranchDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  initialData?: Branch;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const BranchDialog: React.FC<BranchDialogProps> = ({
  open,
  onClose,
  title,
  initialData,
  onSubmit,
  loading = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="branch-dialog-title"
    >
      <DialogTitle id="branch-dialog-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <BranchForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Batal
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BranchDialog;