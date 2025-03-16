// src/components/division/DivisionDetail.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Card, CardContent, Typography, Grid, Button, CircularProgress } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { RootState, AppDispatch } from '../../store';
import { getDivisionById } from '../../store/slices/divisionSlice';
import { getBranchesByDivision } from '../../store/slices/branchSlice';

interface DivisionDetailProps {
  id: string;
  onEdit: () => void;
}

const DivisionDetail: React.FC<DivisionDetailProps> = ({ id, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { division, loading } = useSelector((state: RootState) => state.division);
  const { branches, loading: branchesLoading } = useSelector((state: RootState) => state.branch);

  useEffect(() => {
    if (id) {
      dispatch(getDivisionById(id));
      dispatch(getBranchesByDivision(id));
    }
  }, [dispatch, id]);

  if (loading || !division) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {division.namaDivisi}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {division._id}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEdit}
            >
              Edit
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Tanggal Dibuat
              </Typography>
              <Typography variant="body1">
                {new Date(division.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Terakhir Diperbarui
              </Typography>
              <Typography variant="body1">
                {new Date(division.updatedAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cabang ({branches.length})
          </Typography>
          
          {branchesLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          ) : branches.length > 0 ? (
            <Grid container spacing={2}>
              {branches.map((branch) => (
                <Grid item xs={12} sm={6} md={4} key={branch._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {branch.namaCabang}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {branch.kota}, {branch.provinsi}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary" align="center" py={3}>
              Tidak ada cabang dalam divisi ini
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DivisionDetail;