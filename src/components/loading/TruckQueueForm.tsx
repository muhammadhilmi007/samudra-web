import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createTruckQueue, updateTruckQueue } from '../../store/slices/truckQueueSlice';
import { getVehicles } from '../../store/slices/vehicleSlice';
import { getEmployees } from '../../store/slices/employeeSlice';

// Skema validasi untuk form antrian truck
const truckQueueFormSchema = z.object({
  truckId: z.string().min(1, 'Truck harus dipilih'),
  supirId: z.string().min(1, 'Supir harus dipilih'),
  kenekId: z.string().optional(),
  urutan: z.coerce.number().min(1, 'Urutan harus lebih dari 0'),
  status: z.string().default('MENUNGGU')
});

type TruckQueueFormInputs = z.infer<typeof truckQueueFormSchema>;

interface TruckQueueFormProps {
  initialData?: any;
  onSubmit?: (data: any) => void;
  loading?: boolean;
}

const TruckQueueForm: React.FC<TruckQueueFormProps> = ({ 
  initialData, 
  onSubmit, 
  loading = false 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles } = useSelector((state: RootState) => state.vehicle);
  const { employees } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch vehicles and employees on component mount
  useEffect(() => {
    dispatch(getVehicles());
    dispatch(getEmployees());
  }, [dispatch]);

  // Filter drivers and assistants
  const drivers = employees.filter(emp => 
    emp.jabatan?.toLowerCase() === 'supir' || 
    emp.jabatan?.toLowerCase() === 'driver'
  );

  const assistants = employees.filter(emp => 
    emp.jabatan?.toLowerCase() === 'kenek' || 
    emp.jabatan?.toLowerCase() === 'assistant driver'
  );

  // Initialize form
  const form = useForm<TruckQueueFormInputs>({
    resolver: zodResolver(truckQueueFormSchema),
    defaultValues: {
      truckId: initialData?.truckId || '',
      supirId: initialData?.supirId || '',
      kenekId: initialData?.kenekId || '',
      urutan: initialData?.urutan || 1,
      status: initialData?.status || 'MENUNGGU'
    }
  });

  // Handle form submission
  const handleFormSubmit = (data: TruckQueueFormInputs) => {
    const submitData = {
      ...data,
      cabangId: user?.cabangId,
      createdBy: user?._id
    };

    if (initialData) {
      // Update existing truck queue
      dispatch(updateTruckQueue({ 
        id: initialData._id, 
        truckQueueData: submitData 
      })).unwrap();
    } else {
      // Create new truck queue
      dispatch(createTruckQueue(submitData)).unwrap();
    }

    // Call optional onSubmit prop if provided
    onSubmit?.(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Truck Selection */}
          <FormField
            control={form.control}
            name="truckId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Truck</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih truck" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles
                      .filter(vehicle => vehicle.tipe === 'Truck')
                      .map((vehicle) => (
                        <SelectItem key={vehicle._id} value={vehicle._id}>
                          {vehicle.noPolisi} - {vehicle.namaKendaraan}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Driver Selection */}
          <FormField
            control={form.control}
            name="supirId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Supir</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih supir" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver._id} value={driver._id}>
                        {driver.nama} - {driver.telepon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Assistant Driver Selection (Optional) */}
          <FormField
            control={form.control}
            name="kenekId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Kenek (Opsional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kenek" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Tidak Ada Kenek</SelectItem>
                    {assistants.map((assistant) => (
                      <SelectItem key={assistant._id} value={assistant._id}>
                        {assistant.nama} - {assistant.telepon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Queue Order */}
          <FormField
            control={form.control}
            name="urutan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urutan Antrian</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    disabled={loading}
                    placeholder="Masukkan urutan antrian"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Antrian</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MENUNGGU">Menunggu</SelectItem>
                    <SelectItem value="MUAT">Sedang Muat</SelectItem>
                    <SelectItem value="BERANGKAT">Berangkat</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => form.reset()}
            disabled={loading}
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={loading || form.formState.isSubmitting}
          >
            {loading || form.formState.isSubmitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Menyimpan...
              </>
            ) : initialData ? 'Perbarui Antrian' : 'Tambah Antrian'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TruckQueueForm;