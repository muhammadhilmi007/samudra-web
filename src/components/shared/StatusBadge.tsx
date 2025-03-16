// src/components/shared/StatusBadge.tsx
import React from 'react';
import { Chip, ChipProps, useTheme } from '@mui/material';

interface StatusBadgeProps {
  status: string;
  variant?: ChipProps['variant'];
  size?: ChipProps['size'];
  customColors?: {
    [key: string]: {
      color: string;
      backgroundColor: string;
    };
  };
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'filled',
  size = 'small',
  customColors,
}) => {
  const theme = useTheme();
  
  // Default color mapping
  const defaultColorMap: { [key: string]: { color: string; backgroundColor: string } } = {
    // STT Status
    'PENDING': { color: theme.palette.warning.main, backgroundColor: theme.palette.warning.light },
    'MUAT': { color: theme.palette.info.main, backgroundColor: theme.palette.info.light },
    'TRANSIT': { color: theme.palette.info.main, backgroundColor: theme.palette.info.light },
    'LANSIR': { color: theme.palette.info.main, backgroundColor: theme.palette.info.light },
    'TERKIRIM': { color: theme.palette.success.main, backgroundColor: theme.palette.success.light },
    'RETURN': { color: theme.palette.error.main, backgroundColor: theme.palette.error.light },
    
    // Payment Status
    'LUNAS': { color: theme.palette.success.main, backgroundColor: theme.palette.success.light },
    'BELUM LUNAS': { color: theme.palette.warning.main, backgroundColor: theme.palette.warning.light },
    
    // Queue Status
    'MENUNGGU': { color: theme.palette.warning.main, backgroundColor: theme.palette.warning.light },
    'BERANGKAT': { color: theme.palette.info.main, backgroundColor: theme.palette.info.light },
    'SAMPAI': { color: theme.palette.success.main, backgroundColor: theme.palette.success.light },
    'KEMBALI': { color: theme.palette.success.main, backgroundColor: theme.palette.success.light },
    
    // General Status
    'ACTIVE': { color: theme.palette.success.main, backgroundColor: theme.palette.success.light },
    'INACTIVE': { color: theme.palette.error.main, backgroundColor: theme.palette.error.light },
    'DRAFT': { color: theme.palette.warning.main, backgroundColor: theme.palette.warning.light },
    'FINAL': { color: theme.palette.success.main, backgroundColor: theme.palette.success.light },
    'VALIDATED': { color: theme.palette.success.main, backgroundColor: theme.palette.success.light },
    'UNVALIDATED': { color: theme.palette.warning.main, backgroundColor: theme.palette.warning.light },
    'MERGED': { color: theme.palette.info.main, backgroundColor: theme.palette.info.light },
    
    // Payment Type
    'CASH': { color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light },
    'COD': { color: theme.palette.secondary.main, backgroundColor: theme.palette.secondary.light },
    'CAD': { color: theme.palette.info.main, backgroundColor: theme.palette.info.light },
  };
  
  // Combine default with custom colors
  const colorMap = { ...defaultColorMap, ...customColors };
  
  // Handle uppercase status input for matching
  const normalizedStatus = status.toUpperCase();
  
  // Get color for status or use default
  const statusColor = colorMap[normalizedStatus] || { 
    color: theme.palette.text.primary, 
    backgroundColor: theme.palette.grey[300] 
  };
  
  return (
    <Chip
      label={status}
      variant={variant}
      size={size}
      sx={{
        color: statusColor.color,
        backgroundColor: variant === 'outlined' ? 'transparent' : statusColor.backgroundColor,
        borderColor: statusColor.color,
        fontWeight: 'medium',
      }}
    />
  );
};

export default StatusBadge;