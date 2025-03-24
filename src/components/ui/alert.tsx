import React from 'react';
import { styled } from '@mui/material/styles';
import { 
  Alert as MuiAlert, 
  AlertProps as MuiAlertProps,
  AlertTitle
} from '@mui/material';

export interface AlertProps extends MuiAlertProps {
  title?: string;
  onClose?: () => void;
}

const StyledAlert = styled(MuiAlert)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  '&.MuiAlert-standardSuccess': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  },
  '&.MuiAlert-standardError': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  },
  '&.MuiAlert-standardWarning': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  },
  '&.MuiAlert-standardInfo': {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark,
  },
}));

// Create AlertDescription component
const AlertDescription = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

export const Alert = ({ title, children, onClose, ...props }: AlertProps) => {
  return (
    <StyledAlert
      onClose={onClose}
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </StyledAlert>
  );
};

export { AlertTitle, AlertDescription };
export default Alert;