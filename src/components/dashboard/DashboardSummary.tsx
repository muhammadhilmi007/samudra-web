// src/components/dashboard/DashboardSummary.tsx
import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Divider,
  CircularProgress,
  useTheme,
  Button
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';

interface DashboardStats {
  totalSTT: number;
  totalShipments: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingShipments: number;
  returShipments: number;
}

interface ChartData {
  monthlyRevenue: { name: string; revenue: number }[];
  paymentMethods: { name: string; value: number }[];
  shipmentStatus: { name: string; value: number }[];
  topBranches: { name: string; value: number }[];
}

interface Activity {
  id: number;
  desc: string;
  time: string;
  status: string;
}

const DashboardSummary: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  
  // Sample data - in a real application, this would come from API
  const [stats, setStats] = useState<DashboardStats>({
    totalSTT: 245,
    totalShipments: 189,
    totalRevenue: 45800000,
    totalCustomers: 78,
    pendingShipments: 32,
    returShipments: 8
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    monthlyRevenue: [
      { name: 'Jan', revenue: 4000000 },
      { name: 'Feb', revenue: 3000000 },
      { name: 'Mar', revenue: 5000000 },
      { name: 'Apr', revenue: 4500000 },
      { name: 'Mei', revenue: 6000000 },
      { name: 'Jun', revenue: 5500000 }
    ],
    paymentMethods: [
      { name: 'CASH', value: 40 },
      { name: 'COD', value: 30 },
      { name: 'CAD', value: 30 }
    ],
    shipmentStatus: [
      { name: 'PENDING', value: 20 },
      { name: 'MUAT', value: 15 },
      { name: 'TRANSIT', value: 25 },
      { name: 'LANSIR', value: 10 },
      { name: 'TERKIRIM', value: 25 },
      { name: 'RETURN', value: 5 }
    ],
    topBranches: [
      { name: 'Jakarta', value: 120 },
      { name: 'Surabaya', value: 80 },
      { name: 'Bandung', value: 70 },
      { name: 'Medan', value: 50 }
    ]
  });
  
  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    { id: 1, desc: 'STT #JKT-150323-0025 telah terkirim', time: '15 Mar 2023, 14:30', status: 'TERKIRIM' },
    { id: 2, desc: 'STT #BDG-150323-0042 dalam pengiriman', time: '15 Mar 2023, 13:45', status: 'TRANSIT' },
    { id: 3, desc: 'Pembayaran diterima untuk STT #JKT-140323-0078', time: '15 Mar 2023, 11:20', status: 'PAYMENT' },
    { id: 4, desc: 'STT #SBY-150323-0019 diproses', time: '15 Mar 2023, 10:15', status: 'MUAT' },
    { id: 5, desc: 'STT #JKT-140323-0065 diretur', time: '15 Mar 2023, 09:30', status: 'RETURN' }
  ]);
  
  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        // In a real application, this would be an API call
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Pie chart colors
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main
  ];
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TERKIRIM':
        return theme.palette.success.main;
      case 'TRANSIT':
        return theme.palette.info.main;
      case 'PAYMENT':
        return theme.palette.secondary.main;
      case 'MUAT':
        return theme.palette.primary.main;
      case 'RETURN':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <ReceiptLongIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="subtitle2" color="textSecondary">
                  Total STT
                </Typography>
              </Box>
              <Typography variant="h4">{stats.totalSTT}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <LocalShippingIcon sx={{ color: theme.palette.secondary.main, mr: 1 }} />
                <Typography variant="subtitle2" color="textSecondary">
                  Pengiriman
                </Typography>
              </Box>
              <Typography variant="h4">{stats.totalShipments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoneyIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="subtitle2" color="textSecondary">
                  Pendapatan
                </Typography>
              </Box>
              <Typography variant="h4">{formatCurrency(stats.totalRevenue)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PersonIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                <Typography variant="subtitle2" color="textSecondary">
                  Customer
                </Typography>
              </Box>
              <Typography variant="h4">{stats.totalCustomers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <InventoryIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Typography variant="subtitle2" color="textSecondary">
                  Belum Selesai
                </Typography>
              </Box>
              <Typography variant="h4">{stats.pendingShipments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AssignmentReturnIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                <Typography variant="subtitle2" color="textSecondary">
                  Retur
                </Typography>
              </Box>
              <Typography variant="h4">{stats.returShipments}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        {/* Monthly Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Pendapatan Bulanan
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact',
                      compactDisplay: 'short'
                    }).format(value)
                  }
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                />
                <Legend />
                <Bar dataKey="revenue" name="Pendapatan" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Payment Method Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Metode Pembayaran
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Shipment Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Status Pengiriman
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.shipmentStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Jumlah" fill={theme.palette.success.main}>
                  {chartData.shipmentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Top Branches Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Cabang
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.topBranches}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Total STT" fill={theme.palette.info.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Activity */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Aktivitas Terbaru
          </Typography>
          <Button variant="text" size="small">
            Lihat Semua
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {recentActivities.map((activity) => (
          <Box key={activity.id} mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body1">{activity.desc}</Typography>
                <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: getStatusColor(activity.status) }}>
                {activity.status}
              </Typography>
            </Box>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default DashboardSummary;