// src/components/employee/EmployeeForm.tsx
import React, { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Employee } from '../../types/employee';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Upload, X, Camera, Eye, EyeOff } from 'lucide-react';

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
  confirmPassword: z.string().optional().or(z.literal('')),
  cabangId: z.string().min(1, 'Cabang harus dipilih'),
  aktif: z.boolean().default(true),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["confirmPassword"],
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
  const { user } = useSelector((state: RootState) => state.auth);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(initialData?.fotoProfil || null);
  const [ktpImage, setKtpImage] = useState<File | null>(null);
  const [ktpImagePreview, setKtpImagePreview] = useState<string | null>(initialData?.dokumen?.ktp || null);
  const [npwpImage, setNpwpImage] = useState<File | null>(null);
  const [npwpImagePreview, setNpwpImagePreview] = useState<string | null>(initialData?.dokumen?.npwp || null);
  const [showPassword, setShowPassword] = useState(false);

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
      password: '',
      confirmPassword: '',
      cabangId: initialData?.cabangId || user?.cabangId || '',
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission
  const handleFormSubmit = (data: EmployeeFormInputs) => {
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Find the selected role to get its kodeRole
    const selectedRole = roles.find(role => role._id === data.roleId);
    
    if (!selectedRole) {
      throw new Error('Selected role not found');
    }

    // Append all form fields except confirmPassword and roleId
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'confirmPassword' && key !== 'roleId') {
        formData.append(key, value.toString());
      }
    });

    // Append both roleId and role (kodeRole)
    formData.append('roleId', selectedRole._id);
    formData.append('role', selectedRole.kodeRole);
    
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
    <Form>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div>
          <Tabs value="personal" onValueChange={() => {}} className="w-full">
            <TabsList>
              <TabsTrigger value="personal">Data Pribadi</TabsTrigger>
              <TabsTrigger value="job">Informasi Pekerjaan</TabsTrigger>
              <TabsTrigger value="documents">Dokumen</TabsTrigger>
            </TabsList>
            
            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <div className="space-y-4 py-4">
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
                        size="medium"
                        variant="outlined"
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
                          size="medium"
                          variant="outlined"
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
                  <FormField name="nama">
                    {({ field }: { field: any }) => (
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
                  </FormField>
                  
                  {/* Phone */}
                  <FormField name="telepon">
                    {({ field }: { field: any }) => (
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
                  </FormField>
                  
                  {/* Email */}
                  <FormField name="email">
                    {({ field }: { field: any }) => (
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
                  </FormField>
                  
                  {/* Active Status */}
                  <FormField name="aktif">
                    {({ field }: { field: any }) => (
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
                  </FormField>
                  
                  {/* Address */}
                  <FormField name="alamat">
                    {({ field }: { field: any }) => (
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
                  </FormField>
                </div>
              </div>
            </TabsContent>
            
            {/* Job Information Tab */}
            <TabsContent value="job">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Job Position */}
                  <FormField name="jabatan">
                    {({ field }: { field: any }) => (
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
                  </FormField>
                  
                  {/* Role */}
                  <FormField name="roleId">
                    {({ field }: { field: any }) => (
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
                  </FormField>
                  
                  {/* Branch */}
                  <FormField name="cabangId">
                    {({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Cabang</FormLabel>
                        <Select
                          disabled={loading || !!user?.cabangId}
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
                  </FormField>
                  
                  {/* Username */}
                  <FormField name="username">
                    {({ field }: { field: any }) => (
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
                  </FormField>
                  
                  {/* Password */}
                  <FormField name="password">
                    {({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>
                          {initialData ? 'Password (Kosongkan jika tidak diubah)' : 'Password'}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder={initialData ? "••••••••" : "Masukkan password"} 
                              {...field} 
                              disabled={loading}
                            />
                            <Button 
                              type="button"
                              variant="outlined" 
                              size="medium"
                              className="absolute right-1 top-1"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  </FormField>
                  
                  {/* Confirm Password */}
                  <FormField name="confirmPassword">
                    {({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>
                          Konfirmasi Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="Konfirmasi password" 
                              {...field} 
                              disabled={loading}
                            />
                            <Button 
                              type="button"
                              variant="outlined" 
                              size="medium"
                              className="absolute right-1 top-1"
                              onClick={togglePasswordVisibility}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  </FormField>
                </div>
              </div>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents">
              <div className="space-y-6 py-4">
                {/* KTP Document */}
                <div>
                  <FormLabel className="block text-sm font-medium mb-2">
                    KTP
                  </FormLabel>
                  
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
                          size="medium"
                          variant="outlined"
                          className="h-8 w-8 rounded-full bg-white/80"
                          onClick={() => document.getElementById('ktp-upload')?.click()}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="medium"
                          variant="outlined"
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
                  <FormLabel className="block text-sm font-medium mb-2">
                    NPWP (Opsional)
                  </FormLabel>
                  
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
                          size="medium"
                          variant="outlined"
                          className="h-8 w-8 rounded-full bg-white/80"
                          onClick={() => document.getElementById('npwp-upload')?.click()}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="medium"
                          variant="outlined"
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
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end space-x-4">
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Menyimpan...
                </>
              ) : initialData ? 'Perbarui Pegawai' : 'Tambah Pegawai'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default EmployeeForm;