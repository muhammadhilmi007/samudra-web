import { styled } from '@mui/material/styles';
import { Card as MuiCard, CardContent as MuiCardContent, Typography } from '@mui/material';

export const Card = styled(MuiCard)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

export const CardContent = styled(MuiCardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}));

export { Typography };