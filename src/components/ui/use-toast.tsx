'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertProps } from '@mui/material/Alert';

type ToastProps = {
  message: string;
  type?: AlertProps['severity'];
  duration?: number;
};

type ToastContextType = {
  toast: (props: ToastProps) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

const StyledAlert = styled(Alert)(({ theme }) => ({
  width: '100%',
  '& .MuiAlert-message': {
    padding: theme.spacing(1),
  },
}));

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState<ToastProps | null>(null);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setToast(null), 1000);
  };

  const showToast = React.useCallback((props: ToastProps) => {
    setToast(props);
    setOpen(true);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      {children}
      {toast && (
        <Snackbar
          open={open}
          autoHideDuration={toast.duration || 6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <StyledAlert
            onClose={handleClose}
            severity={toast.type || 'info'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {toast.message}
          </StyledAlert>
        </Snackbar>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}