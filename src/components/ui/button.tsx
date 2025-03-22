import { styled } from '@mui/material/styles';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Button = styled(MuiButton)<ButtonProps>(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[1],
  },
  '&.MuiButton-contained': {
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '&.MuiButton-containedSecondary': {
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
  },
  '&.MuiButton-containedError': {
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  '&.MuiButton-containedSuccess': {
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  },
  '&.MuiButton-containedInfo': {
    '&:hover': {
      backgroundColor: theme.palette.info.dark,
    },
  },
  '&.MuiButton-containedWarning': {
    '&:hover': {
      backgroundColor: theme.palette.warning.dark,
    },
  },
}));

export default Button;