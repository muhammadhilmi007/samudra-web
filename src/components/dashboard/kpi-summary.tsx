import React from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  CardContent, 
  Divider, 
  Grid, 
  Typography, 
  LinearProgress,
  useTheme
} from '@mui/material';

export interface KpiItem {
  label: string;
  value: number;
  target: number;
  unit: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

interface KpiSummaryProps {
  title: string;
  subtitle?: string;
  kpis: KpiItem[];
  loading?: boolean;
}

const KpiSummary: React.FC<KpiSummaryProps> = ({
  title,
  subtitle,
  kpis,
  loading = false,
}) => {
  const theme = useTheme();

  const calculateProgress = (value: number, target: number) => {
    // Calculate percentage with a cap at 100%
    return Math.min(100, (value / target) * 100);
  };

  const getProgressColor = (value: number, target: number, color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning') => {
    // Default color is primary
    if (color) return color;
    
    // Calculate percentage
    const percentage = (value / target) * 100;
    
    // Return color based on percentage
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardHeader 
        title={title} 
        subheader={subtitle}
        titleTypographyProps={{ variant: 'h6' }}
        subheaderTypographyProps={{ variant: 'body2' }}
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          {loading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Memuat data...
                </Typography>
              </Box>
            </Grid>
          ) : kpis.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Tidak ada data KPI
                </Typography>
              </Box>
            </Grid>
          ) : (
            kpis.map((kpi, index) => {
              const progress = calculateProgress(kpi.value, kpi.target);
              const progressColor = getProgressColor(kpi.value, kpi.target, kpi.color);

              return (
                <Grid item xs={12} key={index}>
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {kpi.label}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {`${kpi.value} ${kpi.unit} / ${kpi.target} ${kpi.unit}`}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      color={progressColor}
                      sx={{ 
                        height: 8, 
                        borderRadius: 1,
                        backgroundColor: theme.palette.mode === 'light' 
                          ? theme.palette.grey[200] 
                          : theme.palette.grey[700]
                      }}
                    />
                  </Box>
                </Grid>
              );
            })
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default KpiSummary;