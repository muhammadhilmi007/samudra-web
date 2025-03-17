// src/components/shared/ConfirmDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  severity?: AlertSeverity;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  content,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  severity = 'warning',
  loading = false,
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main', fontSize: 32, mr: 2 }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main', fontSize: 32, mr: 2 }} />;
      case 'info':
        return <InfoIcon sx={{ color: 'info.main', fontSize: 32, mr: 2 }} />;
      case 'success':
        return <SuccessIcon sx={{ color: 'success.main', fontSize: 32, mr: 2 }} />;
    }
  };

  const getButtonColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'primary';
      case 'success':
        return 'success';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">
        <Box display="flex" alignItems="center">
          {getIcon()}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          color={getButtonColor()} 
          variant="contained" 
          autoFocus
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;