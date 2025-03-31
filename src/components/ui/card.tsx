import { 
  Card as MuiCard, 
  CardContent as MuiCardContent, 
  CardHeader as MuiCardHeader,
  Typography,
  CardContent as MuiCardDescription,
  CardActions as MuiCardFooter
} from '@mui/material';
import Box from '@mui/material/Box';

// Re-export MUI components with your preferred naming
export const Card = MuiCard;
export const CardContent = MuiCardContent;
export const CardDescription = MuiCardDescription;
export const CardHeader = MuiCardHeader;
export const CardTitle = Typography;
export const CardFooter = MuiCardFooter;
export { Box };