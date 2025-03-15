// src/components/dashboard/DashboardCard.tsx
import React, { ReactNode } from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  subtitle: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  change,
  changeType = 'neutral',
}) => {
  return (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" color="text.secondary">
            {title}
          </Typography>
          <Box>{icon}</Box>
        </Box>
        
        <Typography variant="h4" component="div" fontWeight="bold" mb={1}>
          {value}
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
          
          {change && (
            <Box display="flex" alignItems="center">
              {changeType === 'increase' && (
                <ArrowUpwardIcon
                  fontSize="small"
                  color="success"
                  sx={{ mr: 0.5 }}
                />
              )}
              
              {changeType === 'decrease' && (
                <ArrowDownwardIcon
                  fontSize="small"
                  color="error"
                  sx={{ mr: 0.5 }}
                />
              )}
              
              <Typography
                variant="body2"
                color={
                  changeType === 'increase'
                    ? 'success.main'
                    : changeType === 'decrease'
                    ? 'error.main'
                    : 'text.secondary'
                }
              >
                {change}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;