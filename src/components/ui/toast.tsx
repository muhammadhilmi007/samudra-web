import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, IconButton, Typography, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { RootState } from '@/store';
import { removeToast } from '@/store/slices/ui-slice';

const ToastContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { toasts } = useSelector((state: RootState) => state.ui);
  
  const handleClose = (id: string) => {
    dispatch(removeToast(id));
  };
  
  if (toasts.length === 0) {
    return null;
  }
  
  return (
    <>
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            bottom: `${(index * 80) + 24}px`,
            '& .MuiAlert-root': {
              width: '100%',
              boxShadow: 3,
            },
          }}
        >
          <Alert
            severity={toast.type}
            variant="filled"
            sx={{ width: '100%' }}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => handleClose(toast.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            <Box>
              <Typography variant="body2">
                {toast.message}
              </Typography>
            </Box>
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default ToastContainer;