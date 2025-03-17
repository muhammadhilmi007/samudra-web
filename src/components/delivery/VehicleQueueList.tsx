import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { VehicleQueue } from '../../types/delivery';
import VehicleQueueForm from './VehicleQueueForm';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
  getVehicleQueues, 
  createVehicleQueue, 
  deleteVehicleQueue 
} from '../../store/slices/deliverySlice';

const VehicleQueueList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicleQueues, loading } = useSelector((state: RootState) => state.delivery);
  const { user } = useSelector((state: RootState) => state.auth);

  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<VehicleQueue | null>(null);

  useEffect(() => {
    // Fetch vehicle queues for the user's branch
    if (user?.cabangId) {
      dispatch(getVehicleQueues(user.cabangId));
    }
  }, [dispatch, user]);

  const handleOpenForm = (queue?: VehicleQueue) => {
    setSelectedQueue(queue || null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedQueue(null);
  };

  const handleSubmit = (data: any) => {
    dispatch(createVehicleQueue(data));
    handleCloseForm();
  };

  const handleDeleteConfirm = () => {
    if (selectedQueue) {
      dispatch(deleteVehicleQueue(selectedQueue._id));
      setOpenDeleteDialog(false);
    }
  };

  const handleOpenDeleteDialog = (queue: VehicleQueue) => {
    setSelectedQueue(queue);
    setOpenDeleteDialog(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Antrian Kendaraan</CardTitle>
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              Tambah Antrian
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedQueue ? 'Edit Antrian Kendaraan' : 'Tambah Antrian Kendaraan'}
              </DialogTitle>
            </DialogHeader>
            <VehicleQueueForm
              initialData={selectedQueue || undefined}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="grid grid-cols-6 border-b font-bold py-2">
            <div>Kendaraan</div>
            <div>Supir</div>
            <div>Kenek</div>
            <div>Urutan</div>
            <div>Status</div>
            <div className="text-right">Aksi</div>
          </div>
          {vehicleQueues.map((queue) => (
            <div key={queue._id} className="grid grid-cols-6 border-b py-2 items-center">
              <div>
                {queue.kendaraan 
                  ? `${queue.kendaraan.noPolisi} - ${queue.kendaraan.namaKendaraan}` 
                  : '-'}
              </div>
              <div>{queue.supir?.nama || '-'}</div>
              <div>{queue.kenek?.nama || '-'}</div>
              <div>{queue.urutan}</div>
              <div>
                <Badge variant={queue.status === 'MENUNGGU' ? 'secondary' : 'outline'}>
                  {queue.status}
                </Badge>
              </div>
              <div className="text-right space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenForm(queue)}
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleOpenDeleteDialog(queue)}
                    >
                      Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus antrian kendaraan ini?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteConfirm}>
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {vehicleQueues.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Tidak ada antrian kendaraan
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleQueueList;