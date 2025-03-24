import React, { useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, Control } from 'react-hook-form';
import { RootState, AppDispatch } from '../../store';
import { getBranches, getBranchesByDivision } from '../../store/slices/branchSlice';
import { Branch } from '../../types/branch';

interface BranchSelectProps {
  name: string;
  label?: string;
  control: Control<any>;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  divisionId?: string;
  onChange?: (value: string) => void;
}

const BranchSelect: React.FC<BranchSelectProps> = ({
  name,
  label = 'Cabang',
  control,
  error,
  helperText,
  disabled = false,
  required = false,
  divisionId,
  onChange
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches, loading } = useSelector((state: RootState) => state.branch);

  useEffect(() => {
    if (divisionId) {
      dispatch(getBranchesByDivision(divisionId));
    } else {
      dispatch(getBranches());
    }
  }, [dispatch, divisionId]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl
          fullWidth
          error={error}
          disabled={disabled || loading}
          required={required}
        >
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            {...field}
            labelId={`${name}-label`}
            label={label}
            value={field.value || ""} // Ensure value is never undefined
            onChange={(e) => {
              field.onChange(e);
              if (onChange) {
                onChange(e.target.value as string);
              }
            }}
          >
            <MenuItem value="" disabled>
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading...
                </>
              ) : (
                'Pilih Cabang'
              )}
            </MenuItem>
            
            {branches.length === 0 && !loading ? (
              <MenuItem value="" disabled>
                Tidak ada data cabang
              </MenuItem>
            ) : (
              branches.map((branch: Branch) => (
                <MenuItem key={branch._id} value={branch._id}>
                  {branch.namaCabang}
                </MenuItem>
              ))
            )}
          </Select>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

export default BranchSelect;