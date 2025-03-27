import React, { forwardRef } from 'react';
import { styled } from '@mui/material/styles';
import { 
  TextField as MuiTextField, 
  TextFieldProps as MuiTextFieldProps,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';

export interface InputProps extends Omit<MuiTextFieldProps, 'variant'> {
  label?: string;
  name: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  accept?: string;
}

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.error.main,
    },
  },
  '& .MuiInputLabel-outlined': {
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 2),
  },
}));

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, error, helperText, fullWidth = true, accept, ...props }, ref) => {
    return (
      <FormControl fullWidth={fullWidth} error={error}>
        {label && <InputLabel htmlFor={name} shrink={true}>{label}</InputLabel>}
        <StyledTextField
          id={name}
          name={name}
          inputRef={ref}
          error={error}
          variant="outlined"
          fullWidth={fullWidth}
          inputProps={{ ...props.inputProps, accept }}
          {...props}
        />
        {helperText && (
          <FormHelperText>{helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }
);

Input.displayName = 'Input';

export default Input;