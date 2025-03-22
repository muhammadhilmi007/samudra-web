import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { AppDispatch } from '../../store/index';

interface STTDetailProps {
  id?: string;
  data?: any;
  loading?: boolean;
}

const STTDetail: React.FC<STTDetailProps> = ({ id, data, loading = false }) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">No STT data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* STT Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Speech-to-Text Details
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            ID: {id}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* STT Status */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2">Status</Typography>
                <Chip 
                  label={data.status || 'Completed'} 
                  color={data.status === 'Completed' ? 'success' : 'primary'} 
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<ShippingIcon />}
                  onClick={() => setOpenDialog(true)}
                >
                  View Tracking
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Processing Steps */}
          <Typography variant="h6" gutterBottom>
            Tracking Progress
          </Typography>
          <Stepper activeStep={data.status === 'DELIVERED' ? 4 : 0} alternativeLabel sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Processing</StepLabel>
            </Step>
            <Step>
              <StepLabel>In Transit</StepLabel>
            </Step>
            <Step>
              <StepLabel>Delivering</StepLabel>
            </Step>
            <Step>
              <StepLabel>Delivered</StepLabel>
            </Step>
          </Stepper>

          {/* Timeline */}
          <Typography variant="h6" gutterBottom>
            Shipment Timeline
          </Typography>
          <Timeline position="alternate">
            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                {new Date(data.uploadTime).toLocaleString('id-ID')}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>Shipment Created</TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                {new Date(data.processingTime).toLocaleString('id-ID')}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>Processing Started</TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                {new Date(data.completionTime).toLocaleString('id-ID')}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
              </TimelineSeparator>
              <TimelineContent>Delivered</TimelineContent>
            </TimelineItem>
          </Timeline>
        </CardContent>
      </Card>

      {/* Package Information */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Package Information
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Package ID
                  </TableCell>
                  <TableCell>{id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Status
                  </TableCell>
                  <TableCell>{data.status}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    Created At
                  </TableCell>
                  <TableCell>{new Date(data.createdAt).toLocaleString('id-ID')}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Tracking Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tracking Information</DialogTitle>
        <DialogContent dividers>
          <Typography>
            {data.trackingInfo || 'This is a sample tracking information. The actual content would appear here.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button variant="contained">Refresh</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default STTDetail;