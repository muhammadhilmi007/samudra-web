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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { STT } from '../../types/stt';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getCustomers, createCustomer } from '../../store/slices/customerSlice';
import { createSTT, updateSTT } from '../../store/slices/sttSlice';
import { getPenerusList } from '../../store/slices/penerusSlice';
import { Plus, Printer, QrCode, Download } from 'lucide-react';

// Customer form schema
const customerFormSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  telepon: z.string().min(8, 'Nomor telepon minimal 8 karakter'),
  alamat: z.string().min(5, 'Alamat minimal 5 karakter'),
  kelurahan: z.string().min(3, 'Kelurahan minimal 3 karakter'),
  kecamatan: z.string().min(3, 'Kecamatan minimal 3 karakter'),
  kota: z.string().min(3, 'Kota minimal 3 karakter'),
  provinsi: z.string().min(3, 'Provinsi minimal 3 karakter'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  perusahaan: z.string().optional().or(z.literal('')),
  tipe: z.enum(['pengirim', 'penerima', 'keduanya']),
});

// STT form schema
const sttFormSchema = z.object({
  cabangAsalId: z.string().min(1, 'Cabang asal harus dipilih'),
  cabangTujuanId: z.string().min(1, 'Cabang tujuan harus dipilih'),
  pengirimId: z.string().min(1, 'Pengirim harus dipilih'),
  penerimaId: z.string().min(1, 'Penerima harus dipilih'),
  namaBarang: z.string().min(1, 'Nama barang harus diisi'),
  komoditi: z.string().min(1, 'Komoditi harus diisi'),
  packing: z.string().min(1, 'Packing harus diisi'),
  jumlahColly: z.number().min(1, 'Jumlah colly minimal 1'),
  berat: z.number().min(0.1, 'Berat minimal 0.1 kg'),
  hargaPerKilo: z.number().min(1000, 'Harga per kilo minimal Rp 1.000'),
  keterangan: z.string().optional().or(z.literal('')),
  kodePenerus: z.string().min(1, 'Kode penerus harus dipilih'),
  penerusId: z.string().optional(),
  paymentType: z.enum(['CASH', 'COD', 'CAD']),
});

type SttFormInputs = z.infer<typeof sttFormSchema>;
type CustomerFormInputs = z.infer<typeof customerFormSchema>;

interface SttFormProps {
  initialData?: STT;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const SttForm: React.FC<SttFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const { branches } = useSelector((state: RootState) => state.branch);
  const { customers } = useSelector((state: RootState) => state.customer);
  const { penerusList } = useSelector((state: RootState) => state.penerus);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [customerType, setCustomerType] = useState<'pengirim' | 'penerima'>('pengirim');
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Initialize form
  const form = useForm<SttFormInputs>({
    resolver: zodResolver(sttFormSchema),
    defaultValues: {
      cabangAsalId: initialData?.cabangAsalId || (user?.cabangId || ''),
      cabangTujuanId: initialData?.cabangTujuanId || '',
      pengirimId: initialData?.pengirimId || '',
      penerimaId: initialData?.penerimaId || '',
      namaBarang: initialData?.namaBarang || '',
      komoditi: initialData?.komoditi || '',
      packing: initialData?.packing || 'KARDUS',
      jumlahColly: initialData?.jumlahColly || 1,
      berat: initialData?.berat || 1,
      hargaPerKilo: initialData?.hargaPerKilo || 10000,
      keterangan: initialData?.keterangan || '',
      kodePenerus: initialData?.kodePenerus || '70',
      penerusId: initialData?.penerusId || '',
      paymentType: initialData?.paymentType || 'CASH',
    },
  });
  
  // Initialize customer form
  const customerForm = useForm<CustomerFormInputs>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      nama: '',
      telepon: '',
      alamat: '',
      kelurahan: '',
      kecamatan: '',
      kota: '',
      provinsi: '',
      email: '',
      perusahaan: '',
      tipe: 'keduanya',
    },
  });

  // Calculate total price when weight or per kilo price changes
  useEffect(() => {
    const weight = form.watch('berat');
    const pricePerKilo = form.watch('hargaPerKilo');
    const calculatedPrice = weight * pricePerKilo;
    setTotalPrice(calculatedPrice);
    
    // Update 'harga' field in the form
    form.setValue('harga', calculatedPrice);
  }, [form.watch('berat'), form.watch('hargaPerKilo')]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getCustomers());
    dispatch(getPenerusList());
  }, [dispatch]);

  // Filter customers by type
  const senders = customers.filter(
    c => c.tipe === 'pengirim' || c.tipe === 'keduanya'
  );
  
  const recipients = customers.filter(
    c => c.tipe === 'penerima' || c.tipe === 'keduanya'
  );

  // Handle opening customer dialog
  const handleAddCustomer = (type: 'pengirim' | 'penerima') => {
    setCustomerType(type);
    setOpenCustomerDialog(true);
    
    // Reset form
    customerForm.reset({
      nama: '',
      telepon: '',
      alamat: '',
      kelurahan: '',
      kecamatan: '',
      kota: '',
      provinsi: '',
      email: '',
      perusahaan: '',
      tipe: type === 'pengirim' ? 'pengirim' : 'penerima',
    });
  };

  // Handle customer form submission
  const handleCustomerSubmit = (data: CustomerFormInputs) => {
    // Add cabang ID from the user context
    const customerData = {
      ...data,
      cabangId: user?.cabangId || '',
    };
    
    dispatch(createCustomer(customerData))
      .unwrap()
      .then((result) => {
        toast({
          title: 'Berhasil menambahkan pelanggan',
          description: `${result.nama} telah ditambahkan sebagai ${data.tipe}`,
        });
        
        // Update the appropriate form field with the new customer ID
        if (customerType === 'pengirim') {
          form.setValue('pengirimId', result._id);
        } else {
          form.setValue('penerimaId', result._id);
        }
        
        setOpenCustomerDialog(false);
        
        // Refresh customer list
        dispatch(getCustomers());
      })
      .catch((error) => {
        toast({
          title: 'Gagal menambahkan pelanggan',
          description: error.message,
          variant: 'destructive',
        });
      });
  };
  
  // Handle form submit
  const handleFormSubmit = (data: SttFormInputs) => {
    // Prepare data for API
    const sttData = {
      ...data,
      harga: totalPrice, // Add calculated total price
      status: 'PENDING', // Default status for new STT
      cabangId: user?.cabangId || '', // Current user's branch ID
    };
    
    onSubmit(sttData);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <div className="space-y-8">
            {/* Cabang Section */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Cabang</CardTitle>
                <CardDescription>
                  Pilih cabang asal dan tujuan pengiriman
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Origin Branch */}
                  <FormField
                    control={form.control}
                    name="cabangAsalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cabang Asal</FormLabel>
                        <Select
                          disabled={loading || (user?.cabangId ? true : false)}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih cabang asal" />
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
                  
                  {/* Destination Branch */}
                  <FormField
                    control={form.control}
                    name="cabangTujuanId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cabang Tujuan</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih cabang tujuan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {branches
                              .filter(b => b._id !== form.watch('cabangAsalId'))
                              .map((branch) => (
                                <SelectItem key={branch._id} value={branch._id}>
                                  {branch.namaCabang}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Customer Section */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pelanggan</CardTitle>
                <CardDescription>
                  Pilih pengirim dan penerima barang
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sender Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Pengirim</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCustomer('pengirim')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Pengirim
                      </Button>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="pengirimId"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih pengirim" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {senders.map((sender) => (
                                <SelectItem key={sender._id} value={sender._id}>
                                  {sender.nama} {sender.perusahaan ? `(${sender.perusahaan})` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('pengirimId') && (
                      <div className="border rounded-md p-3 bg-muted/40">
                        {(() => {
                          const sender = customers.find(c => c._id === form.watch('pengirimId'));
                          return sender ? (
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Nama:</span> {sender.nama}</p>
                              <p><span className="font-medium">Telepon:</span> {sender.telepon}</p>
                              <p>
                                <span className="font-medium">Alamat:</span> {sender.alamat}, 
                                {sender.kelurahan}, {sender.kecamatan}, {sender.kota}, {sender.provinsi}
                              </p>
                            </div>
                          ) : <p className="text-sm text-muted-foreground">Pengirim tidak ditemukan</p>;
                        })()}
                      </div>
                    )}
                  </div>
                  
                  {/* Recipient Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Penerima</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCustomer('penerima')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Penerima
                      </Button>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="penerimaId"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih penerima" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {recipients.map((recipient) => (
                                <SelectItem key={recipient._id} value={recipient._id}>
                                  {recipient.nama} {recipient.perusahaan ? `(${recipient.perusahaan})` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('penerimaId') && (
                      <div className="border rounded-md p-3 bg-muted/40">
                        {(() => {
                          const recipient = customers.find(c => c._id === form.watch('penerimaId'));
                          return recipient ? (
                            <div className="text-sm space-y-1">
                              <p><span className="font-medium">Nama:</span> {recipient.nama}</p>
                              <p><span className="font-medium">Telepon:</span> {recipient.telepon}</p>
                              <p>
                                <span className="font-medium">Alamat:</span> {recipient.alamat}, 
                                {recipient.kelurahan}, {recipient.kecamatan}, {recipient.kota}, {recipient.provinsi}
                              </p>
                            </div>
                          ) : <p className="text-sm text-muted-foreground">Penerima tidak ditemukan</p>;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Package Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Barang</CardTitle>
                <CardDescription>
                  Masukkan detail barang yang akan dikirim
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Package Name */}
                  <FormField
                    control={form.control}
                    name="namaBarang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Barang</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Masukkan nama barang" 
                            {...field} 
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Commodity */}
                  <FormField
                    control={form.control}
                    name="komoditi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Komoditi</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih komoditi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GENERAL">Umum (General)</SelectItem>
                            <SelectItem value="ELEKTRONIK">Elektronik</SelectItem>
                            <SelectItem value="FASHION">Fashion</SelectItem>
                            <SelectItem value="PECAH_BELAH">Pecah Belah</SelectItem>
                            <SelectItem value="MAKANAN">Makanan</SelectItem>
                            <SelectItem value="DOKUMEN">Dokumen</SelectItem>
                            <SelectItem value="LAINNYA">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Packaging */}
                  <FormField
                    control={form.control}
                    name="packing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Packing</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih packing" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="KARDUS">Kardus</SelectItem>
                            <SelectItem value="KAYU">Kayu</SelectItem>
                            <SelectItem value="PLASTIK">Plastik</SelectItem>
                            <SelectItem value="AMPLOP">Amplop</SelectItem>
                            <SelectItem value="BUBBLE_WRAP">Bubble Wrap</SelectItem>
                            <SelectItem value="TANPA_PACKING">Tanpa Packing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Colly Count */}
                  <FormField
                    control={form.control}
                    name="jumlahColly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Colly</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Jumlah colly" 
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(isNaN(value) ? 1 : value);
                            }}
                            min={1}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Weight */}
                  <FormField
                    control={form.control}
                    name="berat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Berat (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Berat dalam kilogram" 
                            {...field}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              field.onChange(isNaN(value) ? 0.1 : value);
                            }}
                            step="0.1"
                            min="0.1"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Price Per Kilo */}
                  <FormField
                    control={form.control}
                    name="hargaPerKilo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Per Kilo (Rp)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Harga per kilogram" 
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(isNaN(value) ? 10000 : value);
                            }}
                            step="500"
                            min="1000"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Total Price (Calculated) */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-sm font-medium">Total Harga</label>
                    <div className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(totalPrice)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Dihitung berdasarkan berat x harga per kilo
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="keterangan"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Keterangan (Opsional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tambahkan keterangan jika diperlukan" 
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
              </CardContent>
            </Card>
            
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pengiriman</CardTitle>
                <CardDescription>
                  Pilih metode pengiriman dan pembayaran
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Forwarding Code */}
                  <FormField
                    control={form.control}
                    name="kodePenerus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Penerus</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kode penerus" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="70">70 - TANPA PENERUS</SelectItem>
                            <SelectItem value="71">71 - PENERUS DIBAYAR PENGIRIM</SelectItem>
                            <SelectItem value="72">72 - PENERUS DIBAYAR PENERIMA</SelectItem>
                            <SelectItem value="73">73 - PENERUS DIBAYAR DIMUKA CABANG PENERIMA</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Forwarding Agent */}
                  {form.watch('kodePenerus') !== '70' && (
                    <FormField
                      control={form.control}
                      name="penerusId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agen Penerus</FormLabel>
                          <Select
                            disabled={loading}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih agen penerus" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {penerusList.map((penerus) => (
                                <SelectItem key={penerus._id} value={penerus._id}>
                                  {penerus.namaPenerus}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {/* Payment Type */}
                  <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                      <FormItem className={form.watch('kodePenerus') === '70' ? 'col-span-1 md:col-span-2' : ''}>
                        <FormLabel>Metode Pembayaran</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih metode pembayaran" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASH">CASH (Bayar di Muka)</SelectItem>
                            <SelectItem value="COD">COD (Cash On Delivery)</SelectItem>
                            <SelectItem value="CAD">CAD (Cash After Delivery)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Payment Type Explanation */}
                  <div className="col-span-1 md:col-span-2 border p-4 rounded-md bg-muted/40">
                    {(() => {
                      const paymentType = form.watch('paymentType');
                      
                      switch (paymentType) {
                        case 'CASH':
                          return (
                            <div className="flex items-center space-x-2">
                              <Badge>CASH</Badge>
                              <p className="text-sm text-muted-foreground">
                                Pembayaran dilakukan oleh pengirim saat pengiriman barang
                              </p>
                            </div>
                          );
                        case 'COD':
                          return (
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">COD</Badge>
                              <p className="text-sm text-muted-foreground">
                                Pembayaran dilakukan oleh penerima saat barang diterima
                              </p>
                            </div>
                          );
                        case 'CAD':
                          return (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">CAD</Badge>
                              <p className="text-sm text-muted-foreground">
                                Pembayaran dilakukan setelah barang diterima (tagihan)
                              </p>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Submit Button */}
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
                disabled={loading || !form.formState.isValid}
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Menyimpan...
                  </>
                ) : initialData ? 'Perbarui STT' : 'Buat STT'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
      
      {/* Customer Dialog */}
      <Dialog open={openCustomerDialog} onOpenChange={setOpenCustomerDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah {customerType === 'pengirim' ? 'Pengirim' : 'Penerima'} Baru</DialogTitle>
            <DialogDescription>
              Isi formulir berikut untuk menambahkan {customerType === 'pengirim' ? 'pengirim' : 'penerima'} baru ke database.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...customerForm}>
            <form onSubmit={customerForm.handleSubmit(handleCustomerSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Name */}
                <FormField
                  control={customerForm.control}
                  name="nama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan nama" 
                          {...field} 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Customer Phone */}
                <FormField
                  control={customerForm.control}
                  name="telepon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telepon</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan nomor telepon" 
                          {...field} 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Customer Email */}
                <FormField
                  control={customerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Opsional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Masukkan email" 
                          {...field} 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Customer Company */}
                <FormField
                  control={customerForm.control}
                  name="perusahaan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perusahaan (Opsional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan nama perusahaan" 
                          {...field} 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Customer Type */}
                <FormField
                  control={customerForm.control}
                  name="tipe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe</FormLabel>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pengirim">Pengirim</SelectItem>
                          <SelectItem value="penerima">Penerima</SelectItem>
                          <SelectItem value="keduanya">Keduanya</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Customer Address */}
                <FormField
                  control={customerForm.control}
                  name="alamat"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Alamat</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Masukkan alamat lengkap"
                          {...field}
                          disabled={loading}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Customer Kelurahan */}
                <FormField
                  control={customerForm.control}
                  name="kelurahan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kelurahan</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan kelurahan" 
                          {...field} 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Customer Kecamatan */}
                <FormField
                  control={customerForm.control}
                  name="kecamatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kecamatan</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan kecamatan" 
                          {...field} 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Customer Kota */}
                <FormField
                  control={customerForm.control}
                  name="kota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kota</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan kota" 
                          {...field} 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Customer Provinsi */}
                <FormField
                  control={customerForm.control}
                  name="provinsi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provinsi</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Masukkan provinsi" 
                          {...field} 
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenCustomerDialog(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !customerForm.formState.isValid}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Menyimpan...
                    </>
                  ) : 'Tambah Pelanggan'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SttForm;