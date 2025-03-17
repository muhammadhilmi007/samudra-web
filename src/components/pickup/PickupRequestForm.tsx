import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getCustomers } from '../../store/slices/customerSlice';
import { format } from 'date-fns';
import { Search, PlusCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Schema validation for pickup request form
const pickupRequestFormSchema = z.object({
  pengirimId: z.string().min(1, 'Harap pilih pengirim'),
  alamatPengambilan: z.string().min(1, 'Alamat pengambilan harus diisi'),
  tujuan: z.string().min(1, 'Tujuan harus diisi'),
  jumlahColly: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val) && val > 0, {
    message: 'Jumlah colly harus berupa angka lebih dari 0',
  }),
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
  const { branches } = useSelector((state: RootState) => state.branch);
  const { customers } = useSelector((state: RootState) => state.customer);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [createCustomer, setCreateCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    nama: '',
    telepon: '',
    alamat: '',
  });
  
  // Initialize form
  const form = useForm<PickupRequestFormInputs>({
    resolver: zodResolver(pickupRequestFormSchema),
    defaultValues: {
      pengirimId: initialData?.pengirimId || '',
      alamatPengambilan: initialData?.alamatPengambilan || '',
      tujuan: initialData?.tujuan || '',
      jumlahColly: initialData?.jumlahColly ? initialData.jumlahColly.toString() : '1',
      cabangId: initialData?.cabangId || user?.cabangId || '',
      tanggal: initialData?.tanggal ? 
        new Date(initialData.tanggal).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0],
      estimasiPengambilan: initialData?.estimasiPengambilan || '',
    },
  });
  
  // Fetch initial data
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getCustomers());
  }, [dispatch]);
  
  // Filter customers by search term
  const filteredCustomers = customers.filter(customer => 
    customer.nama.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.telepon && customer.telepon.includes(customerSearch))
  );
  
  // Handle form submission
  const handleFormSubmit = (data: PickupRequestFormInputs) => {
    // Format request data
    const requestData = {
      ...data,
      jumlahColly: Number(data.jumlahColly),
      userId: user?._id,
      status: 'PENDING',
    };
    
    onSubmit(requestData);
  };
  
  // Handle create new customer
  const handleCreateCustomer = () => {
    if (!newCustomer.nama || !newCustomer.telepon || !newCustomer.alamat) {
      toast({
        title: "Info Diperlukan",
        description: "Nama, telepon, dan alamat pelanggan baru wajib diisi",
        variant: "destructive",
      });
      return;
    }
    
    // Create customer data
    const customerData = {
      ...newCustomer,
      tipe: 'Pengirim',
      cabangId: user?.cabangId,
      createdBy: user?._id,
    };
    
    // You would dispatch action to create customer here
    // dispatch(createCustomer(customerData))
    
    // For demo purposes, we'll just show a toast
    toast({
      title: "Pelanggan Baru",
      description: `Pelanggan ${newCustomer.nama} telah ditambahkan`,
    });
    
    // Reset form
    setNewCustomer({
      nama: '',
      telepon: '',
      alamat: '',
    });
    setCreateCustomer(false);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formulir Request Pengambilan Barang</CardTitle>
              <CardDescription>
                Isi data untuk request pengambilan barang dari pelanggan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Picker */}
              <FormField
                control={form.control}
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
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
              
              {/* Customer/Sender Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Pengirim</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateCustomer(!createCustomer)}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Pengirim Baru
                  </Button>
                </div>
                
                {!createCustomer ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari pengirim berdasarkan nama atau telepon"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="pengirimId"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih pengirim" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredCustomers.map((customer) => (
                                <SelectItem key={customer._id} value={customer._id}>
                                  {customer.nama} - {customer.telepon}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="space-y-2 p-4 border rounded-md bg-muted/20">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Tambah Pengirim Baru</div>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="space-y-1">
                          <FormLabel className="text-xs">Nama</FormLabel>
                          <Input
                            value={newCustomer.nama}
                            onChange={(e) => setNewCustomer({...newCustomer, nama: e.target.value})}
                            placeholder="Nama Pengirim"
                          />
                        </div>
                        <div className="space-y-1">
                          <FormLabel className="text-xs">Telepon</FormLabel>
                          <Input
                            value={newCustomer.telepon}
                            onChange={(e) => setNewCustomer({...newCustomer, telepon: e.target.value})}
                            placeholder="Nomor Telepon"
                          />
                        </div>
                        <div className="space-y-1">
                          <FormLabel className="text-xs">Alamat</FormLabel>
                          <Textarea
                            value={newCustomer.alamat}
                            onChange={(e) => setNewCustomer({...newCustomer, alamat: e.target.value})}
                            placeholder="Alamat Lengkap"
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setCreateCustomer(false)}>
                          Batal
                        </Button>
                        <Button type="button" size="sm" onClick={handleCreateCustomer}>
                          Simpan Pengirim
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Branch Selection */}
              <FormField
                control={form.control}
                name="cabangId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cabang</FormLabel>
                    <Select
                      disabled={loading || (user?.cabangId ? true : false)}
                      onValueChange={field.onChange}
                      value={field.value}
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
              
              {/* Pickup Address */}
              <FormField
                control={form.control}
                name="alamatPengambilan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Pengambilan</FormLabel>
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
              <FormField
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
              
              {/* Number of Packages (Colly) */}
              <FormField
                control={form.control}
                name="jumlahColly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Colly (Paket)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Estimated Pickup Time */}
              <FormField
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
            </CardContent>
          </Card>
          
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : initialData ? 'Perbarui Request' : 'Buat Request'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default PickupRequestForm;