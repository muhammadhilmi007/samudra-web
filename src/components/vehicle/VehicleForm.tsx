import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { getBranches } from "../../store/slices/branchSlice";
import { getEmployeesByBranch } from "../../store/slices/employeeSlice";
import { Vehicle } from "../../types/vehicle";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileInput } from "@/components/ui/file-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Employee } from "@/types/employee";

// File size validation (max 2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Validation schema
const vehicleSchema = z.object({
  noPolisi: z.string().min(1, "Nomor polisi harus diisi"),
  namaKendaraan: z.string().min(1, "Nama kendaraan harus diisi"),
  cabangId: z.string().min(1, "Cabang harus dipilih"),
  tipe: z.string().min(1, "Tipe kendaraan harus dipilih"),
  grup: z.string().optional(),
  supirId: z.string().optional(),
  noTeleponSupir: z.string().optional(),
  noKTPSupir: z.string().optional(),
  alamatSupir: z.string().optional(),
  kenekId: z.string().optional(),
  noTeleponKenek: z.string().optional(),
  noKTPKenek: z.string().optional(),
  alamatKenek: z.string().optional(),
});

type VehicleFormInputs = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  initialData?: Vehicle;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  loading?: boolean;
  drivers: Employee[];
  assistants?: Employee[];
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);

  const [currentTab, setCurrentTab] = useState<
    "vehicle" | "driver" | "assistant"
  >("vehicle");
  const [selectedBranch, setSelectedBranch] = useState<string>(
    initialData?.cabangId || ""
  );

  const [fotoSupir, setFotoSupir] = useState<File | null>(null);
  const [fotoKTPSupir, setFotoKTPSupir] = useState<File | null>(null);
  const [fotoKenek, setFotoKenek] = useState<File | null>(null);
  const [fotoKTPKenek, setFotoKTPKenek] = useState<File | null>(null);

  const [fotoSupirPreview, setFotoSupirPreview] = useState<string | null>(
    initialData?.fotoSupir || null
  );
  const [fotoKTPSupirPreview, setFotoKTPSupirPreview] = useState<string | null>(
    initialData?.fotoKTPSupir || null
  );
  const [fotoKenekPreview, setFotoKenekPreview] = useState<string | null>(
    initialData?.fotoKenek || null
  );
  const [fotoKTPKenekPreview, setFotoKTPKenekPreview] = useState<string | null>(
    initialData?.fotoKTPKenek || null
  );

  const form = useForm<VehicleFormInputs>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      noPolisi: initialData?.noPolisi || "",
      namaKendaraan: initialData?.namaKendaraan || "",
      cabangId: initialData?.cabangId || "",
      tipe: initialData?.tipe || "",
      grup: initialData?.grup || "",
      supirId: initialData?.supirId || "",
      noTeleponSupir: initialData?.noTeleponSupir || "",
      noKTPSupir: initialData?.noKTPSupir || "",
      alamatSupir: initialData?.alamatSupir || "",
      kenekId: initialData?.kenekId || "",
      noTeleponKenek: initialData?.noTeleponKenek || "",
      noKTPKenek: initialData?.noKTPKenek || "",
      alamatKenek: initialData?.alamatKenek || "",
    },
  });

  const selectedCabangId = form.watch("cabangId");
  const selectedTipe = form.watch("tipe");
  const selectedSupirId = form.watch("supirId");
  const selectedKenekId = form.watch("kenekId");

  useEffect(() => {
    dispatch(getBranches());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCabangId) {
      dispatch(getEmployeesByBranch(selectedCabangId));
      setSelectedBranch(selectedCabangId);
    }
  }, [dispatch, selectedCabangId]);

  useEffect(() => {
    if (selectedSupirId) {
      const supir = employees.find((emp) => emp._id === selectedSupirId);
      if (supir) {
        form.setValue("noTeleponSupir", supir.telepon || "");
        form.setValue("alamatSupir", supir.alamat || "");
      }
    }
  }, [employees, selectedSupirId, form]);

  useEffect(() => {
    if (selectedKenekId) {
      const kenek = employees.find((emp) => emp._id === selectedKenekId);
      if (kenek) {
        form.setValue("noTeleponKenek", kenek.telepon || "");
        form.setValue("alamatKenek", kenek.alamat || "");
      }
    }
  }, [employees, selectedKenekId, form]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        form.setError("root", {
          message: "Ukuran file terlalu besar (maksimal 2MB)",
        });
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        form.setError("root", {
          message: "Format file tidak didukung",
        });
        return;
      }
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = (data: VehicleFormInputs) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    if (fotoSupir) formData.append("fotoSupir", fotoSupir);
    if (fotoKTPSupir) formData.append("fotoKTPSupir", fotoKTPSupir);
    if (fotoKenek) formData.append("fotoKenek", fotoKenek);
    if (fotoKTPKenek) formData.append("fotoKTPKenek", fotoKTPKenek);

    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="vehicle"
        value={currentTab}
        onValueChange={(value) =>
          setCurrentTab(value as "vehicle" | "driver" | "assistant")
        }
      >
        <TabsList className="flex w-full border-b border-gray-200 mb-4">
          <TabsTrigger value="vehicle" className="flex-1">
            Informasi Kendaraan
          </TabsTrigger>
          <TabsTrigger value="driver" className="flex-1">
            Informasi Supir
          </TabsTrigger>
          <TabsTrigger value="assistant" className="flex-1">
            Informasi Kenek
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <TabsContent value="vehicle">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="noPolisi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Polisi</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Masukkan nomor polisi"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="namaKendaraan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kendaraan</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Masukkan nama kendaraan"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="cabangId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cabang</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih cabang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch._id} value={branch._id}>
                              {branch.namaCabang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="tipe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Kendaraan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe kendaraan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lansir">
                            Lansir (Pengiriman Lokal)
                          </SelectItem>
                          <SelectItem value="antar_cabang">
                            Antar Cabang
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedTipe === "Antar Cabang" && (
                  <Controller
                    control={form.control}
                    name="grup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grup Armada</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Masukkan grup armada (opsional)"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="driver">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="supirId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supir</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading || !selectedBranch}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih supir" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">-- Pilih Supir --</SelectItem>
                          {employees
                            .filter((emp) =>
                              ["supir", "driver"].includes(
                                emp.jabatan.toLowerCase()
                              )
                            )
                            .map((employee) => (
                              <SelectItem key={employee._id} value={employee._id}>
                                {employee.nama}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="noTeleponSupir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon Supir</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Masukkan nomor telepon"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="noKTPSupir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor KTP Supir</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Masukkan nomor KTP"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="alamatSupir"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Supir</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Masukkan alamat"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2 space-y-4">
                  <div>
                    <Label>Foto KTP Supir</Label>
                    <FileInput
                      accept="image/*"
                      className="mt-2"
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          setFotoKTPSupir,
                          setFotoKTPSupirPreview
                        )
                      }
                      disabled={loading}
                    />
                    {fotoKTPSupirPreview && (
                      <div className="mt-2">
                        <img
                          src={fotoKTPSupirPreview}
                          alt="KTP Supir"
                          className="max-w-[300px] max-h-[200px] object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Foto Supir</Label>
                    <FileInput
                      accept="image/*"
                      className="mt-2"
                      onChange={(e) =>
                        handleFileChange(e, setFotoSupir, setFotoSupirPreview)
                      }
                      disabled={loading}
                    />
                    {fotoSupirPreview && (
                      <div className="mt-2">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={fotoSupirPreview} alt="Supir" />
                          <AvatarFallback>SP</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assistant">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="kenekId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kenek</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading || !selectedBranch}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kenek" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">-- Pilih Kenek --</SelectItem>
                          {employees
                            .filter((emp) =>
                              ["kenek", "asisten driver"].includes(
                                emp.jabatan.toLowerCase()
                              )
                            )
                            .map((employee) => (
                              <SelectItem key={employee._id} value={employee._id}>
                                {employee.nama}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="noTeleponKenek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon Kenek</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Masukkan nomor telepon"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="noKTPKenek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor KTP Kenek</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Masukkan nomor KTP"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Controller
                  control={form.control}
                  name="alamatKenek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Kenek</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Masukkan alamat"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2 space-y-4">
                  <div>
                    <Label>Foto KTP Kenek</Label>
                    <FileInput
                      accept="image/*"
                      className="mt-2"
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          setFotoKTPKenek,
                          setFotoKTPKenekPreview
                        )
                      }
                      disabled={loading}
                    />
                    {fotoKTPKenekPreview && (
                      <div className="mt-2">
                        <img
                          src={fotoKTPKenekPreview}
                          alt="KTP Kenek"
                          className="max-w-[300px] max-h-[200px] object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Foto Kenek</Label>
                    <FileInput
                      accept="image/*"
                      className="mt-2"
                      onChange={(e) =>
                        handleFileChange(e, setFotoKenek, setFotoKenekPreview)
                      }
                      disabled={loading}
                    />
                    {fotoKenekPreview && (
                      <div className="mt-2">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={fotoKenekPreview} alt="Kenek" />
                          <AvatarFallback>KN</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <div className="flex items-center justify-between mt-6">
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => {
                  if (currentTab === "driver") setCurrentTab("vehicle");
                  if (currentTab === "assistant") setCurrentTab("driver");
                }}
                disabled={loading || currentTab === "vehicle"}
              >
                Sebelumnya
              </Button>

              {currentTab !== "assistant" ? (
                <Button
                  type="button"
                  size="small"
                  onClick={() => {
                    if (currentTab === "vehicle") setCurrentTab("driver");
                    if (currentTab === "driver") setCurrentTab("assistant");
                  }}
                >
                  Selanjutnya
                </Button>
              ) : (
                <Button type="submit" size="small" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {initialData ? "Perbarui" : "Simpan"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </Tabs>
    </div>
  );
};

export default VehicleForm;
