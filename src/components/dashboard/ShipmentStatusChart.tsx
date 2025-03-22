// src/components/dashboard/ShipmentStatusChart.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  useTheme, 
  Typography, 
  Paper, 
  ToggleButtonGroup, 
  ToggleButton,
  CircularProgress
} from '@mui/material';
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
  ResponsiveContainer,
  Sector
} from 'recharts';
import { 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon 
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { getShipmentStatusData } from '../../store/slices/dashboardSlice';

// Interface for shipment status data
interface ShipmentStatusData {
  name: string;
  value: number;
  color: string;
}

const ShipmentStatusChart: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { shipmentStatusData, loading } = useSelector((state: RootState) => state.dashboard);
  const [chartData, setChartData] = useState<ShipmentStatusData[]>([]);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('bar');
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch shipment status data when component mounts
  useEffect(() => {
    dispatch(getShipmentStatusData());
  }, [dispatch]);

  // Prepare data for the chart
  useEffect(() => {
    // Define status colors
    const statusColors = {
      PENDING: theme.palette.grey[500],
      MUAT: theme.palette.primary.main,
      TRANSIT: theme.palette.info.main,
      LANSIR: theme.palette.warning.main,
      TERKIRIM: theme.palette.success.main,
      RETURN: theme.palette.error.main
    };

    if (shipmentStatusData && Object.keys(shipmentStatusData).length > 0) {
      // Use actual data from API
      const preparedData = Object.entries(shipmentStatusData).map(([status, count]) => ({
        name: status,
        value: count,
        color: statusColors[status as keyof typeof statusColors] || theme.palette.grey[500]
      }));
      setChartData(preparedData);
    } else {
      // Fallback to sample data
      const sampleData: ShipmentStatusData[] = [
        { name: 'PENDING', value: 30, color: theme.palette.grey[500] },
        { name: 'MUAT', value: 15, color: theme.palette.primary.main },
        { name: 'TRANSIT', value: 25, color: theme.palette.info.main },
        { name: 'LANSIR', value: 10, color: theme.palette.warning.main },
        { name: 'TERKIRIM', value: 25, color: theme.palette.success.main },
        { name: 'RETURN', value: 5, color: theme.palette.error.main }
      ];
      setChartData(sampleData);
    }
  }, [shipmentStatusData, theme]);

  // Toggle between chart types
  const handleChartTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: 'pie' | 'bar' | null) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  // Handle pie chart active sector
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'background.paper' }}>
          <Typography variant="body2" color="text.primary" fontWeight="bold">
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Jumlah: {payload[0].value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Presentase: {((payload[0].value / totalShipments) * 100).toFixed(1)}%
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Renderactive shape for pie chart
  const renderActiveShape = (props: any) => {
    const {
      cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
    
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{payload.name}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`${value} (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  // Calculate total shipments
  const totalShipments = chartData.reduce((sum, item) => sum + item.value, 0);

  // Render Bar Chart
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 10
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={80}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
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
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={onPieEnter}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Legend />
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Status Pengiriman</Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          aria-label="chart type"
          size="small"
        >
          <ToggleButton value="bar" aria-label="bar chart">
            <BarChartIcon />
          </ToggleButton>
          <ToggleButton value="pie" aria-label="pie chart">
            <PieChartIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      ) : chartData.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <Typography variant="body1" color="text.secondary">
            Tidak ada data status pengiriman
          </Typography>
        </Box>
      ) : (
        <>
          {chartType === 'bar' ? renderBarChart() : renderPieChart()}
          
          <Box mt={2} p={1} bgcolor="background.default" borderRadius={1}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Total Pengiriman: {totalShipments} | 
              Sukses: {chartData.find(d => d.name === 'TERKIRIM')?.value || 0} ({((chartData.find(d => d.name === 'TERKIRIM')?.value || 0) / totalShipments * 100).toFixed(1)}%) | 
              Dalam Proses: {(totalShipments - (chartData.find(d => d.name === 'TERKIRIM')?.value || 0) - (chartData.find(d => d.name === 'RETURN')?.value || 0))} | 
              Retur: {chartData.find(d => d.name === 'RETURN')?.value || 0}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ShipmentStatusChart;