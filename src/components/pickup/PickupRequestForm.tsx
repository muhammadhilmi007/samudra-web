// src/components/pickup/PickupRequestForm.tsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  MapPin,
  Package,
  User,
  Search,
  Info,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Customer } from "@/types/pickupRequest";

// Schema validation for the form
const pickupRequestFormSchema = z.object({
  pengirimId: z.string().min(1, "Harap pilih pengirim"),
  alamatPengambilan: z.string().min(5, "Alamat pengambilan minimal 5 karakter"),
  tujuan: z.string().min(2, "Tujuan minimal 2 karakter"),
  jumlahColly: z.coerce.number().min(1, "Jumlah colly harus lebih dari 0"),
  cabangId: z.string().min(1, "Cabang harus dipilih"),
  tanggal: z.string().min(1, "Tanggal harus diisi"),
  estimasiPengambilan: z.string().optional(),
  notes: z.string().optional(),
});

type PickupRequestFormValues = z.infer<typeof pickupRequestFormSchema>;

interface PickupRequestFormProps {
  initialData?: any;
  onSubmit: (data: PickupRequestFormValues) => void;
  loading?: boolean;
}

const PickupRequestForm = ({
  initialData,
  onSubmit,
  loading = false,
}: PickupRequestFormProps) => {
  const { branches } = useSelector((state: RootState) => state.branch);
  const { customers } = useSelector((state: RootState) => state.customer);
  const { user } = useSelector((state: RootState) => state.auth);

  const [customerSearch, setCustomerSearch] = useState("");
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  // Initialize form with default values
  const form = useForm<PickupRequestFormValues>({
    resolver: zodResolver(pickupRequestFormSchema),
    defaultValues: {
      pengirimId: initialData?.pengirimId || "",
      alamatPengambilan: initialData?.alamatPengambilan || "",
      tujuan: initialData?.tujuan || "",
      jumlahColly: initialData?.jumlahColly || 1,
      cabangId: initialData?.cabangId || user?.cabangId || "",
      tanggal: initialData?.tanggal
        ? format(new Date(initialData.tanggal), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      estimasiPengambilan: initialData?.estimasiPengambilan || "",
      notes: initialData?.notes || "",
    },
  });

  // Filter customers by search and "pengirim" type
  const filteredCustomers = customers
    .filter((customer) => {
      // Filter by search term if any
      if (customerSearch) {
        const search = customerSearch.toLowerCase();
        return (
          customer.nama?.toLowerCase().includes(search) ||
          customer.telepon?.includes(search) ||
          customer.alamat?.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .filter((customer) => {
      // Only include customers that can be senders
      const type = customer.tipe?.toLowerCase();
      return type === "pengirim" || type === "keduanya";
    })
    .sort((a, b) => a.nama.localeCompare(b.nama, "id-ID"));

  // Prefill address when selecting a customer
  const handleCustomerSelect = (customerId: string) => {
    form.setValue("pengirimId", customerId);

    const selectedCustomer = customers.find((c) => c._id === customerId);
    if (selectedCustomer && !form.getValues("alamatPengambilan")) {
      form.setValue("alamatPengambilan", selectedCustomer.alamat || "");
    }
  };

  return (
    <Form {...form} onSubmit={form.handleSubmit(onSubmit) as any}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>
              {initialData
                ? "Edit Permintaan Pengambilan"
                : "Buat Permintaan Pengambilan Baru"}
            </CardTitle>
            <CardDescription>
              {initialData
                ? "Edit data permintaan pengambilan barang"
                : "Isi formulir untuk request pengambilan barang dari pelanggan"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi Dasar</h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Date */}
                <Controller
                  control={form.control}
                  name="tanggal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Tanggal
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Branch */}
                <Controller
                  control={form.control}
                  name="cabangId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cabang</FormLabel>
                      <Select
                        disabled={loading || Boolean(user?.cabangId)}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih cabang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {filteredCustomers.length === 0 ? (
                            <div className="p-2 text-center text-muted-foreground">
                              {customerSearch
                                ? `Tidak ada hasil untuk "${customerSearch}"`
                                : "Tidak ada data pengirim"}
                            </div>
                          ) : (
                            filteredCustomers
                              .filter(
                                (customer) =>
                                  customer._id && customer._id.trim() !== ""
                              ) // Ensure _id is valid
                              .map((customer) => (
                                <SelectItem
                                  key={customer._id}
                                  value={customer._id.trim()}
                                >
                                  {customer.nama}{" "}
                                  {customer.telepon
                                    ? `- ${customer.telepon}`
                                    : ""}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Customer Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Data Pengirim</h3>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => setShowCreateCustomer(!showCreateCustomer)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {showCreateCustomer ? "Batal" : "Pengirim Baru"}
                </Button>
              </div>

              {!showCreateCustomer ? (
                <div className="space-y-4">
                  {/* Search Customer */}
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari pengirim berdasarkan nama atau telepon"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-8"
                      disabled={loading}
                      name={""}
                    />
                  </div>

                  {/* Customer Select */}
                  <Controller
                    control={form.control}
                    name="pengirimId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pengirim</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={(value) => handleCustomerSelect(value)}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih pengirim" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px]">
                            {filteredCustomers.length === 0 ? (
                              <div className="p-2 text-center text-muted-foreground">
                                {customerSearch
                                  ? `Tidak ada hasil untuk "${customerSearch}"`
                                  : "Tidak ada data pengirim"}
                              </div>
                            ) : (
                              filteredCustomers
                                .filter(
                                  (customer) =>
                                    customer._id && customer._id.trim() !== ""
                                )
                                .map((customer) => (
                                  <SelectItem
                                    key={customer._id}
                                    value={customer._id}
                                  >
                                    {customer.nama}{" "}
                                    {customer.telepon
                                      ? `- ${customer.telepon}`
                                      : ""}
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Display selected customer info */}
                  {form.watch("pengirimId") && (
                    <div className="rounded-md bg-muted p-3">
                      <h4 className="text-sm font-medium mb-1">
                        Detail Pengirim
                      </h4>
                      {(() => {
                        const selectedCustomer = customers.find(
                          (c) => c._id === form.getValues("pengirimId")
                        );
                        if (!selectedCustomer)
                          return (
                            <p className="text-sm text-muted-foreground">
                              Detail tidak tersedia
                            </p>
                          );

                        return (
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Nama:</span>{" "}
                              {selectedCustomer.nama}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Telepon:</span>{" "}
                              {selectedCustomer.telepon || "-"}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Alamat:</span>{" "}
                              {selectedCustomer.alamat || "-"}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <Alert variant="standard">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Fitur tambah pengirim tersedia di modul Customer. Silakan
                    tambah pelanggan baru terlebih dahulu di menu Customer.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Pickup Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detail Pengambilan</h3>

              <div className="grid grid-cols-1 gap-6">
                {/* Pickup Address */}
                <Controller
                  control={form.control}
                  name="alamatPengambilan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Alamat Pengambilan
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Masukkan alamat lengkap pengambilan"
                          {...field}
                          disabled={loading}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Destination */}
                <Controller
                  control={form.control}
                  name="tujuan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tujuan</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan tujuan pengiriman"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Colly and Estimation - Two column layout */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Number of Packages (Colly) */}
                  <Controller
                    control={form.control}
                    name="jumlahColly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          Jumlah Colly (Paket)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value < 1) return;
                              field.onChange(value);
                            }}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Estimated Pickup Time */}
                  <Controller
                    control={form.control}
                    name="estimasiPengambilan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Estimasi Waktu Pengambilan (Opsional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Contoh: Pagi antara jam 8-10"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <Controller
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Masukkan catatan tambahan jika ada"
                          {...field}
                          disabled={loading}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-4 border-t px-6 py-4">
            <Button
              type="button"
              variant="outlined"
              onClick={() => form.reset()}
              disabled={loading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : initialData ? (
                "Perbarui"
              ) : (
                "Simpan"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default PickupRequestForm;
