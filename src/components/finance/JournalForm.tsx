import React, { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getBranches } from '../../store/slices/branchSlice';
import { getAccounts } from '../../store/slices/financeSlice';
import { createJournalEntry, updateJournalEntry } from '../../store/slices/financeSlice';
import { JournalEntry } from '../../types/finance';
import { Combobox } from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import { InputAdornment } from '@mui/material';
import { ArrowRight } from 'lucide-react';

// Schema validation for journal form
const journalFormSchema = z.object({
  tanggal: z.string().min(1, 'Tanggal harus diisi'),
  accountId: z.string().min(1, 'Akun harus dipilih'),
  cabangId: z.string().optional(),
  keterangan: z.string().min(1, 'Keterangan harus diisi'),
  debet: z.number().min(0, 'Debet tidak boleh negatif'),
  kredit: z.number().min(0, 'Kredit tidak boleh negatif'),
  tipe: z.string().min(1, 'Tipe jurnal harus dipilih'),
  status: z.string().default('DRAFT'),
  sttIds: z.array(z.string()).optional(),
});

type JournalFormInputs = z.infer<typeof journalFormSchema>;

interface JournalFormProps {
  initialData?: JournalEntry;
  onSubmit: (data: JournalFormInputs) => void;
  loading?: boolean;
}

const JournalForm: React.FC<JournalFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { branches } = useSelector((state: RootState) => state.branch);
  const { accounts } = useSelector((state: RootState) => state.finance);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const form = useForm<JournalFormInputs>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: {
      tanggal: initialData ? new Date(initialData.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      accountId: initialData?.accountId || '',
      cabangId: initialData?.cabangId || user?.cabangId || '',
      keterangan: initialData?.keterangan || '',
      debet: initialData?.debet || 0,
      kredit: initialData?.kredit || 0,
      tipe: initialData?.tipe || 'Lokal',
      status: initialData?.status || 'DRAFT',
      sttIds: initialData?.sttIds || [],
    },
  });
  
  // Fetch branches and accounts on component mount
  useEffect(() => {
    dispatch(getBranches());
    dispatch(getAccounts());
  }, [dispatch]);
  
  // Filter accounts for combobox
  const accountOptions = accounts.map(account => ({
    value: account._id,
    label: `${account.kodeAccount} - ${account.namaAccount}`
  }));
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Jurnal</CardTitle>
              <CardDescription>
                Masukkan informasi dasar jurnal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date */}
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
                
                {/* Journal Type */}
                <FormField
                  control={form.control}
                  name="tipe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Jurnal</FormLabel>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe jurnal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Lokal">Jurnal Lokal</SelectItem>
                          <SelectItem value="Pusat">Jurnal Pusat</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Branch */}
                <FormField
                  control={form.control}
                  name="cabangId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cabang</FormLabel>
                      <Select
                        disabled={loading || (user?.cabangId ? true : false)}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih cabang" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Tanpa Cabang</SelectItem>
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
                
                {/* Account */}
                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Akun</FormLabel>
                      <Combobox
                        options={accountOptions}
                        {...field}
                        onChange={field.onChange}
                        disabled={loading}
                        placeholder="Pilih akun..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="keterangan"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Keterangan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Masukkan keterangan jurnal" 
                          {...field} 
                          disabled={loading}
                          className="resize-none"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Detail Transaksi</CardTitle>
              <CardDescription>
                Masukkan nilai debet dan kredit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Debit */}
                <FormField
                  control={form.control}
                  name="debet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debet</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">Rp</span>
                          <Input 
                            type="number"
                            placeholder="0" 
                            {...field}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              field.onChange(isNaN(value) ? 0 : value);
                            }}
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Credit */}
                <FormField
                  control={form.control}
                  name="kredit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kredit</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">Rp</span>
                          <Input 
                            type="number"
                            placeholder="0" 
                            {...field}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              field.onChange(isNaN(value) ? 0 : value);
                            }}
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-between items-center mt-6 p-4 bg-muted/40 rounded-md">
                <div className="text-sm font-medium">Total Debet</div>
                <div className="text-lg font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(form.watch('debet') || 0)}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2 p-4 bg-muted/40 rounded-md">
                <div className="text-sm font-medium">Total Kredit</div>
                <div className="text-lg font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(form.watch('kredit') || 0)}
                </div>
              </div>
              
              {form.watch('debet') !== form.watch('kredit') && (
                <div className="mt-2 p-4 bg-red-50 text-red-800 rounded-md text-sm">
                  Peringatan: Total debet dan kredit harus sama.
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status Jurnal</CardTitle>
              <CardDescription>
                Pilih status jurnal untuk menentukan apakah jurnal sudah final
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
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
                          <SelectValue placeholder="Pilih status jurnal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="FINAL">Final</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mt-4 p-4 bg-muted/40 rounded-md">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Catatan:</span> Jurnal dengan status "Final" tidak dapat diubah lagi.
                </div>
              </div>
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
              disabled={loading || (form.watch('debet') !== form.watch('kredit'))}
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Menyimpan...
                </>
              ) : initialData ? 'Perbarui Jurnal' : 'Tambah Jurnal'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default JournalForm;