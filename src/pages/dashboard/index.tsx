// src/pages/dashboard/index.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Container,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
} from "@mui/material";
import Head from "next/head";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import DashboardSummary from "../../components/dashboard/DashboardSummary";
import RevenueChart from "../../components/dashboard/RevenueChart";
import ShipmentStatusChart from "../../components/dashboard/ShipmentStatusChart";
import RecentActivity from "../../components/dashboard/RecentActivity";
import {
  getDashboardStats,
  getRecentActivities,
} from "../../store/slices/dashboardSlice";
import { getBranches } from "../../store/slices/branchSlice";
import withAuth from "../../components/auth/withAuth";

// Interface for tab panels
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    dispatch(getRecentActivities());
  }, [dispatch]);
  const { branches } = useSelector((state: RootState) => state.branch);
  const [tabValue, setTabValue] = useState(0);

  // Fetch initial data on component mount
  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getBranches());
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get user's branch name
  const getUserBranchName = () => {
    if (!user?.cabangId) return "Semua Cabang";
    const branch = branches.find((b) => b._id === user.cabangId);
    return branch ? branch.namaCabang : "Cabang Anda";
  };

  return (
    <>
      <Head>
        <title>Dashboard - Samudra ERP</title>
      </Head>

      <Container maxWidth={false}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard {getUserBranchName()}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Selamat datang, {user?.nama || "Pengguna"}! Berikut adalah ringkasan
            data operasional Anda.
          </Typography>
        </Box>

        <Box sx={{ width: "100%", mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="dashboard tabs"
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Overview" />
              <Tab label="Operasional" />
              <Tab label="Keuangan" />
              <Tab label="Kinerja" />
            </Tabs>
          </Box>

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="50vh"
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Overview Tab */}
              <TabPanel value={tabValue} index={0}>
                <DashboardSummary />
              </TabPanel>

              {/* Operational Tab */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={8}>
                    <ShipmentStatusChart />
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, height: "100%" }}>
                      <Typography variant="h6" gutterBottom>
                        Kinerja Cabang
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        height={400}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="body2" color="textSecondary">
                          Grafik kinerja cabang akan ditampilkan di sini
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Aktivitas Terbaru
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <RecentActivity />
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Financial Tab */}
              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={8}>
                    <RevenueChart />
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, height: "100%" }}>
                      <Typography variant="h6" gutterBottom>
                        Distribusi Pembayaran
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        height={400}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="body2" color="textSecondary">
                          Grafik distribusi pembayaran akan ditampilkan di sini
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Piutang Terbaru
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        height={300}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="body2" color="textSecondary">
                          Daftar piutang terbaru akan ditampilkan di sini
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Penagihan yang Akan Datang
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        height={300}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="body2" color="textSecondary">
                          Daftar penagihan yang akan datang akan ditampilkan di
                          sini
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Performance Tab */}
              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Kinerja Pengiriman
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        height={400}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="body2" color="textSecondary">
                          Grafik kinerja pengiriman akan ditampilkan di sini
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Kinerja Kendaraan
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        height={300}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="body2" color="textSecondary">
                          Grafik kinerja kendaraan akan ditampilkan di sini
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Kinerja Supir
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box
                        height={300}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="body2" color="textSecondary">
                          Grafik kinerja supir akan ditampilkan di sini
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

// Export the wrapped component
const WrappedDashboard = withAuth(Dashboard);
export default WrappedDashboard;
