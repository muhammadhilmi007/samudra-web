// src/components/dashboard/RevenueChart.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  useTheme, 
  FormControl, 
  Select, 
  MenuItem, 
  InputLabel,
  SelectChangeEvent,
  Paper,
  Typography
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getRevenueData } from '../../store/slices/dashboardSlice';

// Interface for revenue data
interface RevenueData {
  name: string;
  revenue: number;
  target?: number;
  expenses?: number;
  profit?: number;
}

const RevenueChart: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { revenueData, loading } = useSelector((state: RootState) => state.dashboard);
  const [timeRange, setTimeRange] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [data, setData] = useState<RevenueData[]>([]);

  // Fetch revenue data when component mounts or filters change
  useEffect(() => {
    dispatch(getRevenueData({ period: timeRange }));
  }, [dispatch, timeRange]);

  // Update local data when API data changes
  useEffect(() => {
    if (revenueData && revenueData.length > 0) {
      setData(revenueData);
    } else {
      // Fallback to sample data if API returns empty data
      let sampleData: RevenueData[] = [];

      if (timeRange === 'monthly') {
        const months = [
          'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
          'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
        ];
        sampleData = months.map((month) => ({
          name: month,
          revenue: Math.floor(Math.random() * 50000000) + 20000000,
          target: Math.floor(Math.random() * 60000000) + 30000000,
          expenses: Math.floor(Math.random() * 30000000) + 15000000,
          profit: Math.floor(Math.random() * 25000000) + 5000000
        }));
      } else if (timeRange === 'quarterly') {
        sampleData = [
          { name: 'Q1', revenue: 120000000, target: 150000000, expenses: 80000000, profit: 40000000 },
          { name: 'Q2', revenue: 180000000, target: 170000000, expenses: 90000000, profit: 90000000 },
          { name: 'Q3', revenue: 150000000, target: 160000000, expenses: 85000000, profit: 65000000 },
          { name: 'Q4', revenue: 200000000, target: 190000000, expenses: 100000000, profit: 100000000 }
        ];
      } else {
        sampleData = [
          { name: '2020', revenue: 450000000, target: 500000000, expenses: 300000000, profit: 150000000 },
          { name: '2021', revenue: 580000000, target: 550000000, expenses: 320000000, profit: 260000000 },
          { name: '2022', revenue: 650000000, target: 680000000, expenses: 350000000, profit: 300000000 },
          { name: '2023', revenue: 820000000, target: 800000000, expenses: 400000000, profit: 420000000 },
          { name: '2024', revenue: 720000000, target: 850000000, expenses: 380000000, profit: 340000000 }
        ];
      }
      setData(sampleData);
    }
  }, [revenueData, timeRange]);

  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
    setTimeRange(event.target.value as 'monthly' | 'quarterly' | 'yearly');
  };

  // Handle chart type change
  const handleChartTypeChange = (event: SelectChangeEvent<string>) => {
    setChartType(event.target.value as 'line' | 'bar');
  };

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    const displayName = name === 'revenue' 
      ? 'Pendapatan' 
      : name === 'target' 
        ? 'Target' 
        : name === 'profit'
          ? 'Profit'
          : 'Pengeluaran';
    
    return [formatCurrency(value), displayName];
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Pendapatan & Pengeluaran
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel id="time-range-label">Rentang Waktu</InputLabel>
          <Select
            labelId="time-range-label"
            value={timeRange}
            label="Rentang Waktu"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="monthly">Bulanan</MenuItem>
            <MenuItem value="quarterly">Kuartalan</MenuItem>
            <MenuItem value="yearly">Tahunan</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ width: 150 }}>
          <InputLabel id="chart-type-label">Tipe Grafik</InputLabel>
          <Select
            labelId="chart-type-label"
            value={chartType}
            label="Tipe Grafik"
            onChange={handleChartTypeChange}
          >
            <MenuItem value="line">Line Chart</MenuItem>
            <MenuItem value="bar">Bar Chart</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <Typography variant="body1" color="text.secondary">Memuat data...</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          {chartType === 'line' ? (
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => {
                  return new Intl.NumberFormat('id-ID', {
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value);
                }}
              />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Pendapatan"
                stroke={theme.palette.primary.main} 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                name="Target"
                stroke={theme.palette.secondary.main} 
                strokeDasharray="5 5" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                name="Pengeluaran"
                stroke={theme.palette.error.main}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="profit"
                name="Profit"
                stroke={theme.palette.success.main}
                strokeWidth={2}
              />
            </LineChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => {
                  return new Intl.NumberFormat('id-ID', {
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value);
                }}
              />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Bar dataKey="revenue" name="Pendapatan" fill={theme.palette.primary.main} />
              <Bar dataKey="target" name="Target" fill={theme.palette.secondary.main} />
              <Bar dataKey="expenses" name="Pengeluaran" fill={theme.palette.error.main} />
              <Bar dataKey="profit" name="Profit" fill={theme.palette.success.main} />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default RevenueChart;