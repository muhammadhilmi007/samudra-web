// // src/components/dashboard/RevenueChart.tsx
// import React, { useState, useEffect } from 'react';
// import { 
//   Box, 
//   useTheme, 
//   FormControl, 
//   Select, 
//   MenuItem, 
//   InputLabel,
//   SelectChangeEvent
// } from '@mui/material';
// import { 
//   LineChart, 
//   Line, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   Legend, 
//   ResponsiveContainer,
//   BarChart,
//   Bar
// } from 'recharts';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../store';

// // Interface for revenue data
// interface RevenueData {
//   name: string;
//   revenue: number;
//   target?: number;
//   expenses?: number;
// }

// const RevenueChart: React.FC = () => {
//   const theme = useTheme();
//   const { statistics } = useSelector((state: RootState) => state.dashboard);
//   const [timeRange, setTimeRange] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
//   const [chartType, setChartType] = useState<'line' | 'bar'>('line');
//   const [data, setData] = useState<RevenueData[]>([]);

//   // Generate sample data based on time range
//   useEffect(() => {
//     // Use sample data if statistics not available
//     if (!statistics || !statistics.revenueData) {
//       let sampleData: RevenueData[] = [];

//       if (timeRange === 'monthly') {
//         const months = [
//           'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
//           'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
//         ];
//         sampleData = months.map((month, index) => ({
//           name: month,
//           revenue: Math.floor(Math.random() * 50000000) + 20000000,
//           target: Math.floor(Math.random() * 60000000) + 30000000,
//           expenses: Math.floor(Math.random() * 30000000) + 15000000
//         }));
//       } else if (timeRange === 'quarterly') {
//         sampleData = [
//           { name: 'Q1', revenue: 120000000, target: 150000000, expenses: 80000000 },
//           { name: 'Q2', revenue: 180000000, target: 170000000, expenses: 90000000 },
//           { name: 'Q3', revenue: 150000000, target: 160000000, expenses: 85000000 },
//           { name: 'Q4', revenue: 200000000, target: 190000000, expenses: 100000000 }
//         ];
//       } else {
//         sampleData = [
//           { name: '2020', revenue: 450000000, target: 500000000, expenses: 300000000 },
//           { name: '2021', revenue: 580000000, target: 550000000, expenses: 320000000 },
//           { name: '2022', revenue: 650000000, target: 680000000, expenses: 350000000 },
//           { name: '2023', revenue: 820000000, target: 800000000, expenses: 400000000 },
//           { name: '2024', revenue: 720000000, target: 850000000, expenses: 380000000 }
//         ];
//       }
//       setData(sampleData);
//     } else {
//       // Process actual statistics data when available
//       // TODO: Format statistics.revenueData based on selected timeRange
//       setData(statistics.revenueData);
//     }
//   }, [timeRange, statistics]);

//   // Handle time range change
//   const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
//     setTimeRange(event.target.value as 'monthly' | 'quarterly' | 'yearly');
//   };

//   // Handle chart type change
//   const handleChartTypeChange = (event: SelectChangeEvent<string>) => {
//     setChartType(event.target.value as 'line' | 'bar');
//   };

//   // Format currency for tooltip
//   const formatCurrency = (value: number) => {
//     return new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(value);
//   };

//   // Custom tooltip formatter
//   const tooltipFormatter = (value: number, name: string) => {
//     const displayName = name === 'revenue' 
//       ? 'Pendapatan' 
//       : name === 'target' 
//         ? 'Target' 
//         : 'Pengeluaran';
    
//     return [formatCurrency(value), displayName];
//   };

//   return (
//     <Box sx={{ height: '100%', width: '100%' }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
//         <FormControl size="small" sx={{ width: 150 }}>
//           <InputLabel id="time-range-label">Rentang Waktu</InputLabel>
//           <Select
//             labelId="time-range-label"
//             value={timeRange}
//             label="Rentang Waktu"
//             onChange={handleTimeRangeChange}
//           >
//             <MenuItem value="monthly">Bulanan</MenuItem>
//             <MenuItem value="quarterly">Kuartalan</MenuItem>
//             <MenuItem value="yearly">Tahunan</MenuItem>
//           </Select>
//         </FormControl>
        
//         <FormControl size="small" sx={{ width: 150 }}>
//           <InputLabel id="chart-type-label">Tipe Grafik</InputLabel>
//           <Select
//             labelId="chart-type-label"
//             value={chartType}
//             label="Tipe Grafik"
//             onChange={handleChartTypeChange}
//           >
//             <MenuItem value="line">Line Chart</MenuItem>
//             <MenuItem value="bar">Bar Chart</MenuItem>
//           </Select>
//         </FormControl>
//       </Box>

//       <ResponsiveContainer width="100%" height={350}>
//         {chartType === 'line' ? (
//           <LineChart
//             data={data}
//             margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis 
//               tickFormatter={(value) => {
//                 return new Intl.NumberFormat('id-ID', {
//                   notation: 'compact',
//                   compactDisplay: 'short'
//                 }).format(value);
//               }}
//             />
//             <Tooltip formatter={tooltipFormatter} />
//             <Legend />
//             <Line 
//               type="monotone" 
//               dataKey="revenue" 
//               name="Pendapatan"
//               stroke={theme.palette.primary.main} 
//               activeDot={{ r: 8 }} 
//               strokeWidth={2}
//             />
//             <Line 
//               type="monotone" 
//               dataKey="target" 
//               name="Target"
//               stroke={theme.palette.secondary.main} 
//               strokeDasharray="5 5" 
//               strokeWidth={2}
//             />
//             <Line 
//               type="monotone" 
//               dataKey="expenses" 
//               name="Pengeluaran"
//               stroke={theme.palette.error.main}
//               strokeWidth={2}
//             />
//           </LineChart>
//         ) : (
//           <BarChart
//             data={data}
//             margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis 
//               tickFormatter={(value) => {
//                 return new Intl.NumberFormat('id-ID', {
//                   notation: 'compact',
//                   compactDisplay: 'short'
//                 }).format(value);
//               }}
//             />
//             <Tooltip formatter={tooltipFormatter} />
//             <Legend />
//             <Bar dataKey="revenue" name="Pendapatan" fill={theme.palette.primary.main} />
//             <Bar dataKey="target" name="Target" fill={theme.palette.secondary.main} />
//             <Bar dataKey="expenses" name="Pengeluaran" fill={theme.palette.error.main} />
//           </BarChart>
//         )}
//       </ResponsiveContainer>
//     </Box>
//   );
// };

// export default RevenueChart;