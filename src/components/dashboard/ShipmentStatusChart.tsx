// src/components/dashboard/ShipmentStatusChart.tsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, useTheme, Typography } from '@mui/material';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { RootState } from '../../store';

// Interface for shipment status data
interface ShipmentStatusData {
  name: string;
  value: number;
  color: string;
}

const ShipmentStatusChart: React.FC = () => {
  const theme = useTheme();
  const { statistics } = useSelector((state: RootState) => state.dashboard);
  const [chartData, setChartData] = useState<ShipmentStatusData[]>([]);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('bar');

  // Prepare data for the chart
  useEffect(() => {
    // Use sample data if no statistics available
    if (!statistics || !statistics.shipmentStatusCount) {
      const sampleData: ShipmentStatusData[] = [
        { name: 'PENDING', value: 30, color: theme.palette.grey[500] },
        { name: 'MUAT', value: 15, color: theme.palette.primary.main },
        { name: 'TRANSIT', value: 25, color: theme.palette.info.main },
        { name: 'LANSIR', value: 10, color: theme.palette.warning.main },
        { name: 'TERKIRIM', value: 25, color: theme.palette.success.main },
        { name: 'RETURN', value: 5, color: theme.palette.error.main }
      ];
      setChartData(sampleData);
    } else {
      // Use actual data from statistics
      const statusColors = {
        PENDING: theme.palette.grey[500],
        MUAT: theme.palette.primary.main,
        TRANSIT: theme.palette.info.main,
        LANSIR: theme.palette.warning.main,
        TERKIRIM: theme.palette.success.main,
        RETURN: theme.palette.error.main
      };

      const preparedData = Object.entries(statistics.shipmentStatusCount).map(([status, count]) => ({
        name: status,
        value: count,
        color: statusColors[status as keyof typeof statusColors] || theme.palette.grey[500]
      }));

      setChartData(preparedData);
    }
  }, [statistics, theme]);

  // Toggle between chart types
  const toggleChartType = () => {
    setChartType(prev => prev === 'pie' ? 'bar' : 'pie');
  };

  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <Typography variant="body2" color="text.primary" fontWeight="bold">
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Jumlah: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Render Bar Chart
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />
        <Bar dataKey="value" name="Jumlah Pengiriman">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Render Pie Chart
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={toggleChartType}
        >
          Ubah ke {chartType === 'pie' ? 'Bar Chart' : 'Pie Chart'}
        </Typography>
      </Box>
      {chartType === 'bar' ? renderBarChart() : renderPieChart()}
    </Box>
  );
};

export default ShipmentStatusChart;

// import React from 'react';
// import { 
//   BarChart, 
//   Bar, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip,
//   ResponsiveContainer 
// } from 'recharts';
// import { Card, CardContent, Typography } from '@mui/material';

// interface ShipmentStatusChartProps {
//   data?: Array<{
//     status: string;
//     count: number;
//   }>;
// }

// const ShipmentStatusChart: React.FC<ShipmentStatusChartProps> = ({ 
//   data = [
//     { status: 'PENDING', count: 20 },
//     { status: 'MUAT', count: 15 },
//     { status: 'TRANSIT', count: 25 },
//     { status: 'LANSIR', count: 10 },
//     { status: 'TERKIRIM', count: 25 },
//     { status: 'RETURN', count: 5 }
//   ] 
// }) => {
//   // Warna untuk setiap status
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'PENDING': return 'gray';
//       case 'MUAT': return 'blue';
//       case 'TRANSIT': return 'skyblue';
//       case 'LANSIR': return 'orange';
//       case 'TERKIRIM': return 'green';
//       case 'RETURN': return 'red';
//       default: return 'gray';
//     }
//   };

//   return (
//     <Card>
//       <CardContent>
//         <Typography variant="h6" className="mb-4">
//           Status Pengiriman
//         </Typography>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={data} layout="vertical">
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis type="number" />
//             <YAxis dataKey="status" type="category" width={100} />
//             <Tooltip />
//             <Bar dataKey="count" name="Jumlah Pengiriman">
//               {data.map((entry, index) => (
//                 <Bar 
//                   key={`bar-${index}`} 
//                   dataKey="count" 
//                   fill={getStatusColor(entry.status)} 
//                 />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   );
// };

// export default ShipmentStatusChart;