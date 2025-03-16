// src/components/shared/LoadingButton.tsx
import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  disabled,
  startIcon,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : startIcon}
    >
      {children}
    </Button>
  );
};

export default LoadingButton;