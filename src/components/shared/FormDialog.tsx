// src/components/shared/FormDialog.tsx
import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disableSubmit?: boolean;
  fullWidth?: boolean;
  hideActions?: boolean;
}

const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Simpan',
  cancelText = 'Batal',
  maxWidth = 'sm',
  loading = false,
  disableSubmit = false,
  fullWidth = true,
  hideActions = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{title}</Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            disabled={loading}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      {!hideActions && (
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          {onSubmit && (
            <Button
              onClick={onSubmit}
              color="primary"
              variant="contained"
              disabled={loading || disableSubmit}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {submitText}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default FormDialog;