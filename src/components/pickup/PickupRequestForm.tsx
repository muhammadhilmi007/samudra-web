// src/components/pickup/PickupRequestForm.tsx
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { 
  FormControl,
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getCustomers } from '../../store/slices/customerSlice';
import { Search, PlusCircle, Loader2, Calendar, MapPin, Package, Building, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

// Schema validation for pickup request form
const pickupRequestFormSchema = z.object({
  pengirimId: z.string().min(1, 'Harap pilih pengirim'),
  alamatPengambilan: z.string().min(1, 'Alamat pengambilan harus diisi'),
  tujuan: z.string().min(1, 'Tujuan harus diisi'),
  jumlahColly: z.coerce.number().min(1, 'Jumlah colly harus lebih dari 0'),
  cabangId: z.string().min(1, 'Cabang harus dipilih'),
  tanggal: z.string().min(1, 'Tanggal harus diisi'),
  estimasiPengambilan: z.string().optional(),
});

type PickupRequestFormInputs = z.infer<typeof pickupRequestFormSchema>;

interface PickupRequestFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const PickupRequestForm: React.FC<PickupRequestFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches, loading: branchesLoading } = useSelector((state: RootState) => state.branch);
  const { customers, loading: customersLoading } = useSelector((state: RootState) => state.customer);
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [createCustomer, setCreateCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    nama: '',
    telepon: '',
    alamat: '',
  });
  
  // Initialize form with default values
  const form = useForm<PickupRequestFormInputs>({
    resolver: zodResolver(pickupRequestFormSchema),
    defaultValues: {
      pengirimId: initialData?.pengirimId || '',
      alamatPengambilan: initialData?.alamatPengambilan || '',
      tujuan: initialData?.tujuan || '',
      jumlahColly: initialData?.jumlahColly || 1,
      cabangId: initialData?.cabangId || user?.cabangId || '',
      tanggal: initialData?.tanggal ? 
        format(new Date(initialData.tanggal), 'yyyy-MM-dd') : 
        format(new Date(), 'yyyy-MM-dd'),
      estimasiPengambilan: initialData?.estimasiPengambilan || '',
    },
  });
  
  // Fetch initial data
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getCustomers());
  }, [dispatch]);
  
  // Filter customers by search term
  const filteredCustomers = customers
    .filter(customer => 
      !customerSearch || 
      customer.nama.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (customer.telepon && customer.telepon.includes(customerSearch))
    )
    .sort((a, b) => a.nama.localeCompare(b.nama));

  // Handle form submission
  const handleFormSubmit = (data: PickupRequestFormInputs) => {
    onSubmit(data);
  };
  
  // Validate new customer form
  const validateNewCustomer = () => {
    if (!newCustomer.nama) {
      toast({
        type: "error",
        message: "Nama pelanggan harus diisi",
      });
      return false;
    }
    
    if (!newCustomer.telepon) {
      toast({
        type: "error",
        message: "Nomor telepon pelanggan harus diisi",
      });
      return false;
    }
    
    if (!newCustomer.alamat) {
      toast({
        type: "error",
        message: "Alamat pelanggan harus diisi",
      });
      return false;
    }
    
    return true;
  };
  
  // Handle create new customer
  const handleCreateCustomer = () => {
    if (!validateNewCustomer()) return;
    
    // Create customer data
    const customerData = {
      ...newCustomer,
      tipe: 'Pengirim',
      cabangId: user?.cabangId || form.getValues('cabangId'),
      createdBy: user?._id,
    };
    
    // Here you should dispatch to create the customer 
    // This is where the actual API call would happen
    console.log('Creating customer:', customerData);
    
    toast({
      type: "warning",
      message: "Fungsi tambah pelanggan belum diimplementasikan",
    });
    
    // Reset form
    setNewCustomer({
      nama: '',
      telepon: '',
      alamat: '',
    });
    setCreateCustomer(false);
  };
  
  // Select customer with pre-fill
  const handleSelectCustomer = (customerId: string) => {
    form.setValue('pengirimId', customerId);
    
    // Pre-fill address if needed
    const selectedCustomer = customers.find(c => c._id === customerId);
    if (selectedCustomer && !form.getValues('alamatPengambilan')) {
      form.setValue('alamatPengambilan', selectedCustomer.alamat || '');
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Formulir Request Pengambilan Barang</CardTitle>
            <CardDescription>
              Isi data untuk request pengambilan barang dari pelanggan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Informasi Dasar</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Date Picker */}
                <Controller
                  control={form.control}
                  name="tanggal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        Tanggal
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Branch Selection */}
                <Controller
                  control={form.control}
                  name="cabangId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        Cabang
                      </FormLabel>
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
                        <SelectContent>
                          {branchesLoading ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Memuat cabang...</span>
                            </div>
                          ) : branches.length === 0 ? (
                            <div className="p-2 text-center text-muted-foreground">
                              Tidak ada data cabang
                            </div>
                          ) : (
                            branches.map((branch) => (
                              <SelectItem key={branch._id} value={branch._id}>
                                {branch.namaCabang}
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
            
            <Separator />
            
            {/* Customer/Sender Selection Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Informasi Pengirim</h3>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => setCreateCustomer(!createCustomer)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {createCustomer ? 'Batalkan' : 'Pengirim Baru'}
                </Button>
              </div>
              
              {!createCustomer ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari pengirim berdasarkan nama atau telepon"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-8"
                      disabled={loading} name={''}                    />
                  </div>
                  
                  <Controller
                    control={form.control}
                    name="pengirimId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pengirim</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={(value) => handleSelectCustomer(value)}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih pengirim" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px]">
                            {customersLoading ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Memuat pelanggan...</span>
                              </div>
                            ) : filteredCustomers.length === 0 ? (
                              <div className="p-2 text-center text-muted-foreground">
                                {customerSearch 
                                  ? `Tidak ada hasil untuk "${customerSearch}"` 
                                  : "Tidak ada data pelanggan"}
                              </div>
                            ) : (
                              filteredCustomers.map((customer) => (
                                <SelectItem key={customer._id} value={customer._id}>
                                  {customer.nama} {customer.telepon ? `- ${customer.telepon}` : ''}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.getValues('pengirimId') && (
                    <div className="rounded-md bg-muted p-3">
                      <h4 className="text-sm font-medium mb-1">Detail Pengirim</h4>
                      {(() => {
                        const selectedCustomer = customers.find(c => c._id === form.getValues('pengirimId'));
                        if (!selectedCustomer) return <p className="text-sm text-muted-foreground">Detail tidak tersedia</p>;
                        
                        return (
                          <div className="space-y-1">
                            <p className="text-sm"><span className="font-medium">Nama:</span> {selectedCustomer.nama}</p>
                            <p className="text-sm"><span className="font-medium">Telepon:</span> {selectedCustomer.telepon || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Alamat:</span> {selectedCustomer.alamat || '-'}</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                  <div className="text-sm font-medium">Tambah Pengirim Baru</div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <FormLabel>Nama</FormLabel>
                      <Input
                          value={newCustomer.nama}
                          onChange={(e) => setNewCustomer({ ...newCustomer, nama: e.target.value })}
                          placeholder="Nama Pengirim"
                          disabled={loading} name={''}                      />
                    </div>
                    <div className="space-y-2">
                      <FormLabel>Telepon</FormLabel>
                      <Input
                          value={newCustomer.telepon}
                          onChange={(e) => setNewCustomer({ ...newCustomer, telepon: e.target.value })}
                          placeholder="Nomor Telepon"
                          disabled={loading} name={''}                      />
                    </div>
                    <div className="space-y-2">
                      <FormLabel>Alamat</FormLabel>
                      <Textarea
                        value={newCustomer.alamat}
                        onChange={(e) => setNewCustomer({...newCustomer, alamat: e.target.value})}
                        placeholder="Alamat Lengkap"
                        rows={3}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      type="button" 
                      variant="outlined" 
                      size="small" 
                      onClick={() => setCreateCustomer(false)}
                      disabled={loading}
                    >
                      Batal
                    </Button>
                    <Button 
                      type="button" 
                      size="small" 
                      onClick={handleCreateCustomer}
                      disabled={loading}
                    >
                      Simpan Pengirim
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Pickup Details Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Detail Pengambilan</h3>
              <div className="grid grid-cols-1 gap-6">
                {/* Pickup Address */}
                <Controller
                  control={form.control}
                  name="alamatPengambilan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
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
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Number of Packages (Colly) */}
                  <Controller
                    control={form.control}
                    name="jumlahColly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                          Jumlah Colly (Paket)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field} 
                            disabled={loading}
                            inputProps={{ min: 1 }}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                        <FormLabel>Estimasi Waktu Pengambilan (Opsional)</FormLabel>
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
              </div>
            </div>
            
            {/* Notes about next steps */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Setelah permintaan pengambilan dibuat, tim operasional akan memproses dan
                menugaskan kendaraan untuk proses pengambilan.
              </AlertDescription>
            </Alert>
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
            <Button
              type="submit"
              disabled={loading || form.formState.isSubmitting}
            >
              {loading || form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : initialData ? 'Perbarui Request' : 'Buat Request'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
};

export default PickupRequestForm;