import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form,
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
import { Controller } from 'react-hook-form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getEmployees } from '../../store/slices/employeeSlice';
import { getTruckQueues } from '../../store/slices/truckQueueSlice';
import { getSTTsByStatus } from '../../store/slices/sttSlice';
import { Loading } from '../../types/loading';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Plus, Minus, Truck, RotateCw, Package } from 'lucide-react';
import { format } from 'date-fns';

// Schema validation for loading form
const loadingFormSchema = z.object({
  antrianTruckId: z.string().min(1, 'Antrian truck harus dipilih'),
  checkerId: z.string().min(1, 'Checker harus dipilih'),
  cabangMuatId: z.string().min(1, 'Cabang muat harus dipilih'),
  cabangBongkarId: z.string().min(1, 'Cabang bongkar harus dipilih'),
  waktuBerangkat: z.string().optional(),
  keterangan: z.string().optional(),
  sttIds: z.array(z.string()).min(1, 'Minimal harus ada 1 STT yang dipilih'),
  status: z.string().default('MUAT')
});

type LoadingFormInputs = z.infer<typeof loadingFormSchema>;

interface LoadingFormProps {
  initialData?: Loading;
  onSubmit: (data: unknown) => void;
  loading?: boolean;
}

const LoadingForm: React.FC<LoadingFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { employees } = useSelector((state: RootState) => state.employee);
  interface TruckQueue {
    _id: string;
    status: string;
    truckId?: string;
    supirId?: string;
  }
  
  const { truckQueues } = useSelector((state: RootState) => state.truckQueue);
  const trucks = truckQueues as TruckQueue[];
  const { sttList } = useSelector((state: RootState) => state.stt);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedSttIds, setSelectedSttIds] = useState<string[]>(initialData?.sttIds || []);
  const [originBranchId, setOriginBranchId] = useState<string>(
    initialData?.cabangMuatId || user?.cabangId || ''
  );
  
  // Generate a unique Loading ID if creating a new loading
  const [loadingId, setLoadingId] = useState<string>(
    initialData?.idMuat || 
    `LOAD-${format(new Date(), 'ddMMyy')}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  
  // Fetch initial data
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getEmployees());
    
    // Filter truck queues by branch and MENUNGGU status
    dispatch(getTruckQueues());
    
    // Filter STTs by branch and PENDING status
    dispatch(getSTTsByStatus('PENDING'));
  }, [dispatch, user]);
  
  // Initialize form
  const form = useForm<LoadingFormInputs>({
    resolver: zodResolver(loadingFormSchema),
    defaultValues: {
      antrianTruckId: initialData?.antrianTruckId || '',
      checkerId: initialData?.checkerId || '',
      cabangMuatId: initialData?.cabangMuatId || user?.cabangId || '',
      cabangBongkarId: initialData?.cabangBongkarId || '',
      waktuBerangkat: initialData?.waktuBerangkat ? 
        new Date(initialData.waktuBerangkat).toISOString().split('T')[0] + 'T' + 
        new Date(initialData.waktuBerangkat).toISOString().split('T')[1].substring(0, 5) : 
        '',
      keterangan: initialData?.keterangan || '',
      sttIds: initialData?.sttIds || [],
      status: initialData?.status || 'MUAT'
    },
  });
  
  // Watch form values
  const watchedOriginBranch = form.watch('cabangMuatId');
  const watchedDestBranch = form.watch('cabangBongkarId');
  
  // Update STT list when origin branch changes
  useEffect(() => {
    if (watchedOriginBranch && watchedOriginBranch !== originBranchId) {
      setOriginBranchId(watchedOriginBranch);
      // Reset selected STTs when branch changes
      setSelectedSttIds([]);
      form.setValue('sttIds', []);
      
      // Get new STTs for the selected branch
      dispatch(getSTTsByStatus('PENDING'));
    }
  }, [watchedOriginBranch, dispatch, form, originBranchId]);
  
  // Filter employees who are checkers
  const checkers = employees.filter(emp => 
    emp.jabatan === 'Checker' || emp.jabatan === 'CHECKER'
  );
  
  // Filter STTs for the destination branch
  const destinationStts = sttList.filter(stt => 
    stt.cabangTujuanId === watchedDestBranch && 
    stt.cabangAsalId === watchedOriginBranch && 
    stt.status === 'PENDING'
  );
  
  // Toggle selection of an STT
  const toggleSttSelection = (sttId: string) => {
    const newSelection = selectedSttIds.includes(sttId)
      ? selectedSttIds.filter(id => id !== sttId)
      : [...selectedSttIds, sttId];
    
    setSelectedSttIds(newSelection);
    form.setValue('sttIds', newSelection);
  };
  
  // Check if all destination STTs are selected
  const allDestinationSttsSelected = destinationStts.length > 0 && 
    destinationStts.every(stt => selectedSttIds.includes(stt._id));
  
  // Select or deselect all destination STTs
  const toggleAllDestinationStts = () => {
    if (allDestinationSttsSelected) {
      // Deselect all destination STTs
      const newSelection = selectedSttIds.filter(id => 
        !destinationStts.some(stt => stt._id === id)
      );
      setSelectedSttIds(newSelection);
      form.setValue('sttIds', newSelection);
    } else {
// Select all destination STTs
const destinationSttIds = destinationStts.map((stt: { _id: string }) => stt._id);
const newSelection = [
  ...selectedSttIds.filter(id => !destinationStts.some(stt => stt._id === id)),
        ...destinationSttIds
      ];
      setSelectedSttIds(newSelection);
      form.setValue('sttIds', newSelection);
    }
  };
  
  // Get branch name by ID
  const getBranchName = (branchId?: string) => {
    if (!branchId) return '-';
    const branch = branches.find(b => b._id === branchId);
    return branch ? branch.namaCabang : '-';
  };
  
  // Get truck information
  interface TruckInfo {
    noPolisi: string;
    supirName: string;
  }

  const getTruckInfo = (truckQueueId?: string): TruckInfo => {
    if (!truckQueueId) return { noPolisi: '-', supirName: '-' };
    
    const truckQueue = trucks.find((tq: TruckQueue) => tq._id === truckQueueId);
    if (!truckQueue) return { noPolisi: '-', supirName: '-' };
    
    // Find truck details
    const truck = truckQueue.truckId ? { noPolisi: truckQueue.truckId } : null;
    
    // Find driver details
    const driver = employees.find(emp => emp._id === truckQueue.supirId);
    
    return {
      noPolisi: truck?.noPolisi || '-',
      supirName: driver?.nama || '-'
    };
  };
  
  // Format price to Indonesian Rupiah
  const formatPrice = (price?: number) => {
    if (price === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  // Handle form submission
  const handleFormSubmit = (data: LoadingFormInputs) => {
    // Add loading ID to data
    const loadingData = {
      ...data,
      idMuat: loadingId
    };
    
    onSubmit(loadingData);
  };
  
  return (
    <Form {...form} onSubmit={() => {}}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Muat Barang</CardTitle>
              <CardDescription>
                Masukkan informasi dasar untuk muat barang
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Loading ID */}
              <div className="flex items-center justify-between border p-4 rounded-md bg-muted/30">
                <div>
                  <span className="text-sm font-medium">ID Muat:</span>
                  <span className="ml-2 font-bold">{loadingId}</span>
                </div>
                <Button
                  type="button"
                  variant="text"
                  size="small"
                  onClick={() => {
                    // Generate a new loading ID
                    const newId = `LOAD-${format(new Date(), 'ddMMyy')}-${Math.floor(1000 + Math.random() * 9000)}`;
                    setLoadingId(newId);
                  }}
                >
                  <RotateCw className="h-4 w-4 mr-1" />
                  Generate Baru
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Origin Branch */}
                <Controller
                  control={form.control}
                  name="cabangMuatId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cabang Muat</FormLabel>
                      <Select
                        disabled={loading || (user?.cabangId ? true : false) || !!initialData}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih cabang muat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches
                            .filter(branch => branch._id && branch._id.trim() !== '')
                            .map((branch) => (
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
                <Controller
                  control={form.control}
                  name="cabangBongkarId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cabang Bongkar</FormLabel>
                      <Select
                        disabled={loading || !!initialData}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih cabang bongkar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches
                            .filter(b => b._id && b._id.trim() !== '' && b._id !== form.watch('cabangMuatId'))
                            .map((branch) => (
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
                
                {/* Truck Queue */}
                <Controller
                  control={form.control}
                  name="antrianTruckId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Antrian Truck</FormLabel>
                      <Select
                        disabled={loading || !!initialData}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih truck dari antrian" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {trucks
                            .filter(tq => tq.status === 'waiting' && tq._id && tq._id.trim() !== '')
                            .map((truckQueue) => {
                              const truckInfo = getTruckInfo(truckQueue._id);
                              return (
                                <SelectItem key={truckQueue._id} value={truckQueue._id}>
                                  {truckInfo.noPolisi} - {truckInfo.supirName}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Checker */}
                <Controller
                  control={form.control}
                  name="checkerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Checker</FormLabel>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih checker" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {checkers
                            .filter(checker => checker._id && checker._id.trim() !== '')
                            .map((checker) => (
                              <SelectItem key={checker._id} value={checker._id}>
                                {checker.nama}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Departure Time */}
                <Controller
                  control={form.control}
                  name="waktuBerangkat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu Berangkat {initialData ? '(Opsional)' : ''}</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local"
                          {...field} 
                          disabled={loading}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            if (e.target.value) {
                              // If departure time is set, update status to BERANGKAT
                              form.setValue('status', 'BERANGKAT');
                            } else {
                              // If departure time is cleared, update status to MUAT
                              form.setValue('status', 'MUAT');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Status */}
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MUAT">Muat</SelectItem>
                          <SelectItem value="BERANGKAT">Berangkat</SelectItem>
                          {initialData && <SelectItem value="SAMPAI">Sampai</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Notes */}
                <Controller
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
          
          {/* STT Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pilih STT yang Akan Dimuat</CardTitle>
                  <CardDescription>
                    Pilih STT yang akan dimuat ke dalam truck
                  </CardDescription>
                </div>
                
                {watchedDestBranch && (
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outlined"  // Changed from "outline" to "outlined"
                      size="small"
                      onClick={toggleAllDestinationStts}
                      disabled={destinationStts.length === 0}
                    >
                      {allDestinationSttsSelected ? (
                        <>
                          <Minus className="h-4 w-4 mr-1" />
                          Hapus Semua
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Pilih Semua
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Selected STTs count */}
              <div className="mb-4 p-3 bg-muted/30 rounded-md flex justify-between items-center">
                <div>
                  <span className="font-medium">
                    STT yang dipilih: {selectedSttIds.length || 0}
                  </span>
                  <Controller
                    control={form.control}
                    name="sttIds"
                    render={() => (
                      <FormMessage />
                    )}
                  />
                </div>
                
                {watchedDestBranch && (
                  <div className="text-sm text-muted-foreground">
                    Total STT untuk tujuan {getBranchName(watchedDestBranch)}: {destinationStts.length || 0}
                  </div>
                )}
              </div>
              
              {watchedDestBranch ? (
                destinationStts.length > 0 ? (
                  <div className="border rounded-md">
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>No. STT</TableHead>
                            <TableHead>Barang</TableHead>
                            <TableHead>Pengiriman</TableHead>
                            <TableHead>Berat</TableHead>
                            <TableHead>Harga</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {destinationStts.map((stt) => (
                            <TableRow 
                              key={stt._id}
                              className={selectedSttIds.includes(stt._id) ? 'bg-primary/10' : ''}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={selectedSttIds.includes(stt._id)}
                                  onCheckedChange={() => toggleSttSelection(stt._id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{stt.noSTT}</TableCell>
                              <TableCell>
                                <div>{stt.namaBarang}</div>
                                <div className="text-xs text-muted-foreground">{stt.komoditi}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {stt.paymentType}
                                </Badge>
                              </TableCell>
                              <TableCell>{stt.berat} kg</TableCell>
                              <TableCell>{formatPrice(stt.harga)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mb-4 text-muted-foreground/50" />
                    <p>Tidak ada STT yang tersedia untuk cabang tujuan ini</p>
                    <p className="text-sm mt-1">Silakan pilih cabang bongkar lain atau buat STT baru</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Truck className="h-12 w-12 mb-4 text-muted-foreground/50" />
                  <p>Silakan pilih cabang bongkar terlebih dahulu</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-4">
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
              disabled={loading || selectedSttIds.length === 0 || form.formState.isSubmitting}
            >
              {loading || form.formState.isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Menyimpan...
                </>
              ) : initialData ? 'Perbarui Muat' : 'Buat Muat'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default LoadingForm;