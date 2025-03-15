// src/pages/dashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Chip,
  useTheme
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import Head from 'next/head';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import { getDashboardStats } from '../store/slices/reportSlice';
import withAuth from '../components/auth/withAuth';
import DashboardCard from '../components/dashboard/DashboardCard';

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { dashboardStats, loading } = useSelector((state: RootState) => state.report);
  
  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);
  
  const pieColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
  ];
  
  // Dummy data (will be replaced with actual data from API)
  const paymentMethodData = [
    { name: 'CASH', value: 40 },
    { name: 'COD', value: 30 },
    { name: 'CAD', value: 30 },
  ];
  
  const monthlyRevenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'Mei', revenue: 6000 },
    { name: 'Jun', revenue: 5500 },
  ];
  
  const deliveryStatusData = [
    { name: 'Menunggu', count: 65 },
    { name: 'Dalam Perjalanan', count: 45 },
    { name: 'Terkirim', count: 120 },
    { name: 'Retur', count: 15 },
  ];
  
  const topBranchesData = [
    { name: 'Jakarta', value: 120 },
    { name: 'Surabaya', value: 80 },
    { name: 'Bandung', value: 70 },
    { name: 'Medan', value: 50 },
  ];
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <>
      <Head>
        <title>Dashboard - Samudra ERP</title>
      </Head>
      
      <Box>
        <Typography variant="h4" mb={4}>
          Dashboard
        </Typography>
        
        <Box mb={2}>
          <Typography variant="h6">
            Selamat Datang, {user?.nama}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.jabatan} | {user?.cabang?.namaCabang || 'Kantor Pusat'}
          </Typography>
        </Box>
        
        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Total STT"
              value="256"
              icon={<ReceiptLongIcon fontSize="large" color="primary" />}
              subtitle="Bulan Ini"
              change="+15%"
              changeType="increase"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Pengiriman"
              value="189"
              icon={<LocalShippingIcon fontSize="large" color="secondary" />}
              subtitle="Bulan Ini"
              change="+8%"
              changeType="increase"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Pendapatan"
              value="Rp 45,8 Jt"
              icon={<AttachMoneyIcon fontSize="large" color="success" />}
              subtitle="Bulan Ini"
              change="+12%"
              changeType="increase"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard
              title="Customer"
              value="78"
              icon={<PersonIcon fontSize="large" color="info" />}
              subtitle="Total Customer"
              change="+5"
              changeType="increase"
            />
          </Grid>
        </Grid>
        
        {/* Charts */}
        <Grid container spacing={3}>
          {/* Monthly Revenue Chart */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" mb={2}>
                Pendapatan Bulanan
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`Rp ${value.toLocaleString()}`, 'Pendapatan']} />
                  <Legend />
                  <Bar dataKey="revenue" name="Pendapatan" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          {/* Payment Method Pie Chart */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" mb={2}>
                Metode Pembayaran
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={theme.palette.primary.main}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Persentase']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          {/* Delivery Status Chart */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Status Pengiriman
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Jumlah" fill={theme.palette.success.main} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          {/* Top Branches Chart */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Top Cabang
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topBranchesData}>
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
          
          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Aktivitas Terbaru
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box>
                {/* Will be replaced with actual data from API */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="body1">STT #JKT-150323-0025 telah terkirim</Typography>
                    <Typography variant="caption" color="text.secondary">15 Mar 2023, 14:30</Typography>
                  </Box>
                  <Chip label="Terkirim" color="success" size="small" />
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="body1">STT #BDG-150323-0042 dalam pengiriman</Typography>
                    <Typography variant="caption" color="text.secondary">15 Mar 2023, 13:45</Typography>
                  </Box>
                  <Chip label="Dalam Pengiriman" color="primary" size="small" />
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="body1">Pembayaran diterima untuk STT #JKT-140323-0078</Typography>
                    <Typography variant="caption" color="text.secondary">15 Mar 2023, 11:20</Typography>
                  </Box>
                  <Chip label="Pembayaran" color="secondary" size="small" />
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="body1">STT #SBY-150323-0019 diproses</Typography>
                    <Typography variant="caption" color="text.secondary">15 Mar 2023, 10:15</Typography>
                  </Box>
                  <Chip label="Diproses" color="info" size="small" />
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1">STT #JKT-140323-0065 diretur</Typography>
                    <Typography variant="caption" color="text.secondary">15 Mar 2023, 09:30</Typography>
                  </Box>
                  <Chip label="Retur" color="warning" size="small" />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default withAuth(Dashboard);