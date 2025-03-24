import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Skeleton,
  CircularProgress
} from '@mui/material';
import {
  Business as BusinessIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';

const BranchQuickAccess: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { branches, loading } = useSelector((state: RootState) => state.branch);
  const { user } = useSelector((state: RootState) => state.auth);

  // Check if user has admin access
  const canCreateBranch = 
    user?.role === 'direktur' || 
    user?.role === 'manajer_admin' ||
    user?.role === 'superadmin';

  useEffect(() => {
    dispatch(getBranches());
  }, [dispatch]);

  const handleViewBranch = (id: string) => {
    router.push(`/branch/${id}`);
  };

  const handleCreateBranch = () => {
    router.push('/branch/create');
  };

  const handleViewAllBranches = () => {
    router.push('/branch');
  };

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6" component="h2" fontWeight="bold">
            Cabang Perusahaan
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
              </Box>
            ))}
          </Box>
        ) : branches.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary" paragraph>
              Belum ada cabang terdaftar.
            </Typography>
            {canCreateBranch && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleCreateBranch}
                size="small"
              >
                Buat Cabang Baru
              </Button>
            )}
          </Box>
        ) : (
          <>
            <List sx={{ p: 0 }}>
              {branches.slice(0, 5).map((branch) => (
                <React.Fragment key={branch._id}>
                  <ListItem
                    button
                    alignItems="flex-start"
                    onClick={() => handleViewBranch(branch._id)}
                    sx={{ 
                      p: 2,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <BusinessIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={branch.namaCabang}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'inline' }}
                          >
                            {branch.kota}, {branch.provinsi}
                          </Typography>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: 'block', fontSize: '0.75rem' }}
                          >
                            {branch.kontakPenanggungJawab?.nama || 'Belum ada penanggung jawab'}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                    <ChevronRightIcon color="action" sx={{ alignSelf: 'center' }} />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
            
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                color="primary" 
                onClick={handleViewAllBranches}
                size="small"
              >
                Lihat Semua ({branches.length})
              </Button>
              
              {canCreateBranch && (
                <Button 
                  variant="contained" 
                  size="small" 
                  startIcon={<AddIcon />}
                  onClick={handleCreateBranch}
                >
                  Tambah Cabang
                </Button>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BranchQuickAccess;