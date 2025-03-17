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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Employee } from '../../types/employee';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Upload, X, Camera } from 'lucide-react';

// Schema validation for employee form
const employeeFormSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  jabatan: z.string().min(1, 'Jabatan harus diisi'),
  roleId: z.string().min(1, 'Role harus dipilih'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  telepon: z.string().min(9, 'Nomor telepon minimal 9 karakter'),
  alamat: z.string().min(1, 'Alamat harus diisi'),
  username: z.string().min(5, 'Username minimal 5 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter')
    .optional()
    .or(z.literal('')),
  cabangId: z.string().min(1, 'Cabang harus dipilih'),
  aktif: z.boolean().default(true),
});

type EmployeeFormInputs = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  initialData?: Employee;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const { branches } = useSelector((state: RootState) => state.branch);
  const { roles } = useSelector((state: RootState) => state.employee);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    initialData?.fotoProfil || null
  );
  const [ktpImage, setKtpImage] = useState<File | null>(null);
  const [ktpImagePreview, setKtpImagePreview] = useState<string | null>(
    initialData?.dokumen?.ktp || null
  );
  const [npwpImage, setNpwpImage] = useState<File | null>(null);
  const [npwpImagePreview, setNpwpImagePreview] = useState<string | null>(
    initialData?.dokumen?.npwp || null
  );

  const form = useForm<EmployeeFormInputs>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      nama: initialData?.nama || '',
      jabatan: initialData?.jabatan || '',
      roleId: initialData?.roleId || '',
      email: initialData?.email || '',
      telepon: initialData?.telepon || '',
      alamat: initialData?.alamat || '',
      username: initialData?.username || '',
      password: '', // Never prefill password
      cabangId: initialData?.cabangId || '',
      aktif: initialData?.aktif !== undefined ? initialData.aktif : true,
    },
  });

  // Handle file upload for profile image
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle file upload for KTP image
  const handleKtpImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setKtpImage(file);
      setKtpImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle file upload for NPWP image
  const handleNpwpImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNpwpImage(file);
      setNpwpImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove profile image
  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  // Remove KTP image
  const removeKtpImage = () => {
    setKtpImage(null);
    setKtpImagePreview(null);
  };

  // Remove NPWP image
  const removeNpwpImage = () => {
    setNpwpImage(null);
    setNpwpImagePreview(null);
  };

  // Handle form submission
  const handleFormSubmit = (data: EmployeeFormInputs) => {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Append all form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Append file uploads if available
    if (profileImage) {
      formData.append('fotoProfil', profileImage);
    }
    
    if (ktpImage) {
      formData.append('dokumen.ktp', ktpImage);
    }
    
    if (npwpImage) {
      formData.append('dokumen.npwp', npwpImage);
    }
    
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Data Pribadi</TabsTrigger>
            <TabsTrigger value="job">Informasi Pekerjaan</TabsTrigger>
            <TabsTrigger value="documents">Dokumen</TabsTrigger>
          </TabsList>
          
          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Data Pribadi</CardTitle>
                <CardDescription>
                  Masukkan informasi pribadi pegawai
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Image */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={profileImagePreview || undefined} 
                        alt="Profile" 
                      />
                      <AvatarFallback className="text-4xl">
                        {form.watch('nama') ? form.watch('nama').charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="absolute -bottom-2 -right-2 flex space-x-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full"
                        onClick={() => document.getElementById('profile-upload')?.click()}
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageChange}
                          disabled={loading}
                        />
                      </Button>
                      
                      {profileImagePreview && (
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8 rounded-full"
                          onClick={removeProfileImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Masukkan nama pegawai" 
                            {...field} 
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="telepon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
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
                  
                  {/* Email */}
                  <FormField
                    control={form.control}
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
                  
                  {/* Active Status */}
                  <FormField
                    control={form.control}
                    name="aktif"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Status Aktif</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Pegawai dapat mengakses sistem jika aktif
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="alamat"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Alamat</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Masukkan alamat lengkap" 
                            {...field} 
                            disabled={loading}
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
          </TabsContent>
          
          {/* Job Information Tab */}
          <TabsContent value="job">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pekerjaan</CardTitle>
                <CardDescription>
                  Masukkan informasi pekerjaan dan akses sistem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Job Position */}
                  <FormField
                    control={form.control}
                    name="jabatan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jabatan</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Masukkan jabatan" 
                            {...field} 
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Role */}
                  <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role._id} value={role._id}>
                                {role.namaRole}
                              </SelectItem>
                            ))}
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
                          disabled={loading}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                  
                  {/* Username */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Masukkan username" 
                            {...field} 
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {initialData ? 'Password (Kosongkan jika tidak diubah)' : 'Password'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder={initialData ? "••••••••" : "Masukkan password"} 
                            {...field} 
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Dokumen</CardTitle>
                <CardDescription>
                  Unggah dokumen pendukung pegawai
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* KTP Document */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      KTP
                    </label>
                    
                    {ktpImagePreview ? (
                      <div className="relative border rounded-md overflow-hidden">
                        <img 
                          src={ktpImagePreview} 
                          alt="KTP" 
                          className="w-full h-auto max-h-48 object-contain"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-white/80"
                            onClick={() => document.getElementById('ktp-upload')?.click()}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 rounded-full bg-white/80"
                            onClick={removeKtpImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => document.getElementById('ktp-upload')?.click()}
                      >
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Klik untuk mengunggah gambar KTP
                        </p>
                      </div>
                    )}
                    <input
                      id="ktp-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleKtpImageChange}
                      disabled={loading}
                    />
                  </div>
                  
                  {/* NPWP Document */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      NPWP (Opsional)
                    </label>
                    
                    {npwpImagePreview ? (
                      <div className="relative border rounded-md overflow-hidden">
                        <img 
                          src={npwpImagePreview} 
                          alt="NPWP" 
                          className="w-full h-auto max-h-48 object-contain"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-white/80"
                            onClick={() => document.getElementById('npwp-upload')?.click()}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 rounded-full bg-white/80"
                            onClick={removeNpwpImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => document.getElementById('npwp-upload')?.click()}
                      >
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Klik untuk mengunggah gambar NPWP
                        </p>
                      </div>
                    )}
                    <input
                      id="npwp-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleNpwpImageChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end space-x-4">
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
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Menyimpan...
              </>
            ) : initialData ? 'Perbarui Pegawai' : 'Tambah Pegawai'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmployeeForm;