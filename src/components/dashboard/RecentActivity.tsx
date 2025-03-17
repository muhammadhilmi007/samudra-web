import React, { useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getRecentActivities } from '../../store/slices/dashboardSlice';
import { formatDistance } from 'date-fns';
import { id } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface Activity {
  _id: string;
  type: 'stt' | 'loading' | 'delivery' | 'return' | 'payment' | 'employee' | 'branch';
  title: string;
  description: string;
  userId: string;
  userAvatar?: string;
  userName: string;
  timestamp: string;
  status?: string;
  referenceId?: string;
  referenceNo?: string;
}

const RecentActivity: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { recentActivities, loading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(getRecentActivities());
  }, [dispatch]);

  // Helper function to render the appropriate link based on activity type
  const getActivityLink = (activity: Activity) => {
    if (!activity.referenceId) return null;

    switch (activity.type) {
      case 'stt':
        return `/stt/${activity.referenceId}`;
      case 'loading':
        return `/loading/${activity.referenceId}`;
      case 'delivery':
        return `/delivery/${activity.referenceId}`;
      case 'return':
        return `/return/${activity.referenceId}`;
      case 'payment':
        return `/collection/${activity.referenceId}`;
      case 'employee':
        return `/employee/${activity.referenceId}`;
      case 'branch':
        return `/branch/${activity.referenceId}`;
      default:
        return null;
    }
  };

  // Helper function to get badge color based on status
  const getStatusColor = (status?: string) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
      case 'pending':
      case 'belum lunas':
        return 'warning';
      case 'success':
      case 'terkirim':
      case 'lunas':
        return 'success';
      case 'error':
      case 'return':
      case 'gagal':
        return 'destructive';
      case 'processing':
      case 'muat':
      case 'lansir':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistance(new Date(timestamp), new Date(), { 
        addSuffix: true,
        locale: id 
      });
    } catch (error) {
      return 'Waktu tidak valid';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
        <CardDescription>
          Aktivitas terbaru di seluruh sistem
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity: Activity) => (
                <div key={activity._id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={activity.userAvatar} />
                      <AvatarFallback>
                        {activity.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{activity.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{activity.userName}</span>
                          {activity.status && (
                            <Badge variant={getStatusColor(activity.status) as any}>
                              {activity.status}
                            </Badge>
                          )}
                          {activity.referenceNo && (
                            <Badge variant="outline">
                              {activity.referenceNo}
                            </Badge>
                          )}
                        </div>
                        
                        {getActivityLink(activity) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-6 text-xs px-2"
                          >
                            <Link to={getActivityLink(activity) as string}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Lihat
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Belum ada aktivitas terbaru
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;