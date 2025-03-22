// src/components/dashboard/RecentActivity.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Replay as ReplayIcon,
  AttachMoney as AttachMoneyIcon,
  DirectionsCar as DirectionsCarIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getRecentActivities } from '../../store/slices/dashboardSlice';
import { useRouter } from 'next/router';

// Interface for activity item
interface Activity {
  id: string;
  type: 'STT' | 'MUAT' | 'LANSIR' | 'TERKIRIM' | 'RETUR' | 'PAYMENT' | 'VEHICLE' | 'CUSTOMER';
  description: string;
  timestamp: string;
  referenceId: string;
  status: string;
  user?: {
    id: string;
    name: string;
  };
}

const RecentActivity: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { recentActivities } = useSelector((state: RootState) => state.dashboard);
  const { loading } = useSelector((state: RootState) => state.ui as { loading: boolean });
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Fetch recent activities
    dispatch(getRecentActivities());
    
    // Use sample data if no activities available
    if (!recentActivities?.length) {
      // Sample data
      const sampleActivities: Activity[] = [
        {
          id: '1',
          type: 'STT',
          description: 'STT #JKT-150323-0025 telah dibuat',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
          referenceId: 'JKT-150323-0025',
          status: 'CREATED',
          user: { id: '101', name: 'Ahmad Junaedi' }
        },
        {
          id: '2',
          type: 'MUAT',
          description: 'STT #BDG-150323-0042 telah dimuat',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutes ago
          referenceId: 'BDG-150323-0042',
          status: 'MUAT',
          user: { id: '102', name: 'Budi Santoso' }
        },
        {
          id: '3',
          type: 'LANSIR',
          description: 'STT #JKT-150323-0018 sedang dalam pengiriman',
          timestamp: new Date(Date.now() - 90 * 60000).toISOString(), // 90 minutes ago
          referenceId: 'JKT-150323-0018',
          status: 'LANSIR',
          user: { id: '103', name: 'Citra Dewi' }
        },
        {
          id: '4',
          type: 'TERKIRIM',
          description: 'STT #SBY-140323-0056 telah diterima oleh Ani Widodo',
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
          referenceId: 'SBY-140323-0056',
          status: 'TERKIRIM',
          user: { id: '104', name: 'Dedi Irawan' }
        },
        {
          id: '5',
          type: 'PAYMENT',
          description: 'Pembayaran diterima untuk STT #JKT-140323-0078',
          timestamp: new Date(Date.now() - 180 * 60000).toISOString(), // 3 hours ago
          referenceId: 'JKT-140323-0078',
          status: 'PAID',
          user: { id: '105', name: 'Eka Fitriani' }
        },
        {
          id: '6',
          type: 'RETUR',
          description: 'STT #JKT-140323-0065 diretur karena alamat tidak ditemukan',
          timestamp: new Date(Date.now() - 240 * 60000).toISOString(), // 4 hours ago
          referenceId: 'JKT-140323-0065',
          status: 'RETUR',
          user: { id: '106', name: 'Faisal Rahman' }
        },
        {
          id: '7',
          type: 'VEHICLE',
          description: 'Kendaraan B 1234 CD ditambahkan ke sistem',
          timestamp: new Date(Date.now() - 300 * 60000).toISOString(), // 5 hours ago
          referenceId: 'VHC-001',
          status: 'ADDED',
          user: { id: '107', name: 'Gita Savitri' }
        },
        {
          id: '8',
          type: 'CUSTOMER',
          description: 'Pelanggan baru PT. Maju Jaya telah ditambahkan',
          timestamp: new Date(Date.now() - 360 * 60000).toISOString(), // 6 hours ago
          referenceId: 'CST-001',
          status: 'ADDED',
          user: { id: '108', name: 'Hendra Kusuma' }
        }
      ];
      setActivities(sampleActivities);
    } else {
      setActivities(recentActivities);
    }
  }, [dispatch, recentActivities]);

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    
    return activityTime.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get avatar icon based on activity type
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'STT':
        return <ReceiptIcon />;
      case 'MUAT':
        return <AssignmentIcon />;
      case 'LANSIR':
        return <LocalShippingIcon />;
      case 'TERKIRIM':
        return <AssignmentIcon color="success" />;
      case 'RETUR':
        return <ReplayIcon color="error" />;
      case 'PAYMENT':
        return <AttachMoneyIcon color="success" />;
      case 'VEHICLE':
        return <DirectionsCarIcon />;
      case 'CUSTOMER':
        return <PersonIcon />;
      default:
        return <ReceiptIcon />;
    }
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return theme.palette.info.main;
      case 'MUAT':
        return theme.palette.primary.main;
      case 'LANSIR':
        return theme.palette.warning.main;
      case 'TERKIRIM':
        return theme.palette.success.main;
      case 'RETUR':
        return theme.palette.error.main;
      case 'PAID':
        return theme.palette.success.main;
      case 'ADDED':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Handle click to navigate to detail page
  const handleActivityClick = (activity: Activity) => {
    // Navigate based on activity type
    switch (activity.type) {
      case 'STT':
        router.push(`/stt/${activity.referenceId}`);
        break;
      case 'MUAT':
        router.push(`/loading/${activity.referenceId}`);
        break;
      case 'LANSIR':
      case 'TERKIRIM':
        router.push(`/delivery/${activity.referenceId}`);
        break;
      case 'RETUR':
        router.push(`/return/${activity.referenceId}`);
        break;
      case 'PAYMENT':
        router.push(`/collection/${activity.referenceId}`);
        break;
      case 'VEHICLE':
        router.push(`/vehicle/${activity.referenceId}`);
        break;
      case 'CUSTOMER':
        router.push(`/customer/${activity.referenceId}`);
        break;
      default:
        break;
    }
  };

  // Refresh activities
  const handleRefresh = () => {
    dispatch(getRecentActivities());
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2">
          Aktivitas Terbaru
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh} size="small">
            <ReplayIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={32} />
        </Box>
      ) : activities.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <Typography variant="body2" color="text.secondary">
            Tidak ada aktivitas terbaru
          </Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', maxHeight: 400, overflow: 'auto' }} disablePadding>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => handleActivityClick(activity)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getStatusColor(activity.status) }}>
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" component="span">
                      {activity.description}
                    </Typography>
                  }
                  secondary={
                    <Box component="span" mt={0.5}>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        display="block"
                      >
                        {formatRelativeTime(activity.timestamp)}
                        {activity.user && ` • ${activity.user.name}`}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={activity.status} 
                        sx={{ 
                          mt: 0.5, 
                          bgcolor: `${getStatusColor(activity.status)}20`,
                          color: getStatusColor(activity.status),
                          fontWeight: 500
                        }} 
                      />
                    </Box>
                  }
                />
                <Box display="flex" alignItems="center">
                  <KeyboardArrowRightIcon color="action" />
                </Box>
              </ListItem>
              {index < activities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}

      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="text"
          size="small"
          endIcon={<KeyboardArrowRightIcon />}
          onClick={() => router.push('/activity')}
        >
          Lihat Semua Aktivitas
        </Button>
      </Box>
    </Box>
  );
};

export default RecentActivity;

// import React, { useEffect } from 'react';
// import { 
//   Card, 
//   CardContent, 
//   CardHeader, 
//   CardTitle,
//   CardDescription 
// } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Button } from '@/components/ui/button';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '../../store';
// import { getRecentActivities } from '../../store/slices/dashboardSlice';
// import { formatDistance } from 'date-fns';
// import { id } from 'date-fns/locale';
// import { Link } from 'react-router-dom';
// import { ExternalLink } from 'lucide-react';

// interface Activity {
//   _id: string;
//   type: 'stt' | 'loading' | 'delivery' | 'return' | 'payment' | 'employee' | 'branch';
//   title: string;
//   description: string;
//   userId: string;
//   userAvatar?: string;
//   userName: string;
//   timestamp: string;
//   status?: string;
//   referenceId?: string;
//   referenceNo?: string;
// }

// const RecentActivity: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { recentActivities, loading } = useSelector((state: RootState) => state.dashboard);

//   useEffect(() => {
//     dispatch(getRecentActivities());
//   }, [dispatch]);

//   // Helper function to render the appropriate link based on activity type
//   const getActivityLink = (activity: Activity) => {
//     if (!activity.referenceId) return null;

//     switch (activity.type) {
//       case 'stt':
//         return `/stt/${activity.referenceId}`;
//       case 'loading':
//         return `/loading/${activity.referenceId}`;
//       case 'delivery':
//         return `/delivery/${activity.referenceId}`;
//       case 'return':
//         return `/return/${activity.referenceId}`;
//       case 'payment':
//         return `/collection/${activity.referenceId}`;
//       case 'employee':
//         return `/employee/${activity.referenceId}`;
//       case 'branch':
//         return `/branch/${activity.referenceId}`;
//       default:
//         return null;
//     }
//   };

//   // Helper function to get badge color based on status
//   const getStatusColor = (status?: string) => {
//     if (!status) return 'default';
    
//     switch (status.toLowerCase()) {
//       case 'pending':
//       case 'belum lunas':
//         return 'warning';
//       case 'success':
//       case 'terkirim':
//       case 'lunas':
//         return 'success';
//       case 'error':
//       case 'return':
//       case 'gagal':
//         return 'destructive';
//       case 'processing':
//       case 'muat':
//       case 'lansir':
//         return 'secondary';
//       default:
//         return 'default';
//     }
//   };

//   const getTimeAgo = (timestamp: string) => {
//     try {
//       return formatDistance(new Date(timestamp), new Date(), { 
//         addSuffix: true,
//         locale: id 
//       });
//     } catch (error) {
//       return 'Waktu tidak valid';
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Aktivitas Terbaru</CardTitle>
//         <CardDescription>
//           Aktivitas terbaru di seluruh sistem
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {loading ? (
//           <div className="flex justify-center py-4">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {recentActivities.length > 0 ? (
//               recentActivities.map((activity: Activity) => (
//                 <div key={activity._id} className="border-b pb-4 last:border-0">
//                   <div className="flex items-start gap-4">
//                     <Avatar>
//                       <AvatarImage src={activity.userAvatar} />
//                       <AvatarFallback>
//                         {activity.userName.charAt(0).toUpperCase()}
//                       </AvatarFallback>
//                     </Avatar>
                    
//                     <div className="flex-1">
//                       <div className="flex justify-between items-start">
//                         <h4 className="font-medium text-sm">{activity.title}</h4>
//                         <span className="text-xs text-muted-foreground">
//                           {getTimeAgo(activity.timestamp)}
//                         </span>
//                       </div>
                      
//                       <p className="text-sm text-muted-foreground mt-1">
//                         {activity.description}
//                       </p>
                      
//                       <div className="flex justify-between items-center mt-2">
//                         <div className="flex items-center gap-2">
//                           <span className="text-xs font-medium">{activity.userName}</span>
//                           {activity.status && (
//                             <Badge variant={getStatusColor(activity.status) as any}>
//                               {activity.status}
//                             </Badge>
//                           )}
//                           {activity.referenceNo && (
//                             <Badge variant="outline">
//                               {activity.referenceNo}
//                             </Badge>
//                           )}
//                         </div>
                        
//                         {getActivityLink(activity) && (
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             asChild
//                             className="h-6 text-xs px-2"
//                           >
//                             <Link to={getActivityLink(activity) as string}>
//                               <ExternalLink className="h-3 w-3 mr-1" />
//                               Lihat
//                             </Link>
//                           </Button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-4 text-muted-foreground">
//                 Belum ada aktivitas terbaru
//               </div>
//             )}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default RecentActivity;