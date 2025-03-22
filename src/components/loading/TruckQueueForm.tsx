import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  createTruckQueue,
  updateTruckQueue,
} from "../../store/slices/truckQueueSlice";
import { getVehicles } from "../../store/slices/vehicleSlice";
import { getEmployees } from "../../store/slices/employeeSlice";

const truckQueueFormSchema = z.object({
  truckId: z.string().min(1, "Truck harus dipilih"),
  supirId: z.string().min(1, "Supir harus dipilih"),
  kenekId: z.string().min(1, "Kenek harus dipilih"),
  urutan: z.coerce.number().min(1, "Urutan harus lebih dari 0"),
  status: z.string().default("MENUNGGU"),
});

type TruckQueueFormInputs = z.infer<typeof truckQueueFormSchema>;

interface TruckQueueFormProps {
  initialData?: any;
  onSubmit?: (data: any) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const TruckQueueForm: React.FC<TruckQueueFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { vehicles, loading: vehiclesLoading } = useSelector(
    (state: RootState) => state.vehicle
  );
  const { employees, loading: employeesLoading } = useSelector(
    (state: RootState) => state.employee
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getVehicles());
    dispatch(getEmployees());
  }, [dispatch]);

  const drivers = employees.filter(
    (emp) =>
      emp.jabatan?.toLowerCase() === "supir" ||
      emp.jabatan?.toLowerCase() === "driver"
  );

  const assistants = employees.filter(
    (emp) =>
      emp.jabatan?.toLowerCase() === "kenek" ||
      emp.jabatan?.toLowerCase() === "assistant driver"
  );

  const form = useForm<TruckQueueFormInputs>({
    resolver: zodResolver(truckQueueFormSchema),
    defaultValues: {
      truckId: initialData?.truckId || "",
      supirId: initialData?.supirId || "",
      kenekId: initialData?.kenekId || "",
      urutan: initialData?.urutan || 1,
      status: initialData?.status || "MENUNGGU",
    },
  });

  const handleFormSubmit = async (data: TruckQueueFormInputs) => {
    try {
      const submitData = {
        ...data,
        cabangId: user?.cabangId,
        createdBy: user?._id,
      };

      if (initialData) {
        await dispatch(
          updateTruckQueue({
            id: initialData._id,
            truckData: {
              ...submitData,
              status: submitData.status as
                | "waiting"
                | "processing"
                | "completed",
            },
          })
        ).unwrap();
      } else {
        const vehicle = vehicles.find((v) => v._id === submitData.truckId);
        const driver = drivers.find((d) => d._id === submitData.supirId);
        await dispatch(
          createTruckQueue({
            ...submitData,
            licensePlate: vehicle?.noPolisi || "",
            driverName: driver?.nama || "",
            arrivalTime: new Date().toISOString(),
            status: submitData.status,
          })
        ).unwrap();
      }

      onSubmit?.(submitData);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const isFormProcessing =
    loading ||
    form.formState.isSubmitting ||
    vehiclesLoading ||
    employeesLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="truckId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Truck</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isFormProcessing}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih truck" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles
                      .filter(
                        (vehicle) =>
                          vehicle.tipe === "Lansir" ||
                          vehicle.tipe === "Antar Cabang"
                      )
                      .map((vehicle) => (
                        <SelectItem key={vehicle._id} value={vehicle._id}>
                          {vehicle.noPolisi} - {vehicle.namaKendaraan}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supirId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Supir</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isFormProcessing}
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

          <FormField
            control={form.control}
            name="kenekId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Kenek</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isFormProcessing}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kenek" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                    disabled={isFormProcessing}
                    placeholder="Masukkan urutan antrian"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Antrian</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isFormProcessing}
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
          {onCancel && (
            <Button
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={isFormProcessing}
            >
              Batal
            </Button>
          )}
          <Button
            type="button"
            variant="outlined"
            onClick={() => form.reset()}
            disabled={isFormProcessing}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isFormProcessing}>
            {isFormProcessing ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Menyimpan...
              </>
            ) : initialData ? (
              "Perbarui Antrian"
            ) : (
              "Tambah Antrian"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TruckQueueForm;