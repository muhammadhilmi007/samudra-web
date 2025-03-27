import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeFormSchema, Employee, EmployeeFormInputs, fileValidationSchema } from '@/types/employee';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Upload, X, Camera, Eye, EyeOff } from 'lucide-react';

interface EmployeeFormProps {
  initialData?: Employee;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

const EmployeeForm = ({
  initialData,
  onSubmit,
  loading = false,
}: EmployeeFormProps) => {
  const { branches } = useSelector((state: RootState) => state.branch);
  const { roles } = useSelector((state: RootState) => state.employee);
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();

  // File upload states
  const [profileImage, setProfileImage] = React.useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = React.useState<string | null>(initialData?.fotoProfil || null);
  const [ktpImage, setKtpImage] = React.useState<File | null>(null);
  const [ktpImagePreview, setKtpImagePreview] = React.useState<string | null>(initialData?.dokumen?.ktp || null);
  const [npwpImage, setNpwpImage] = React.useState<File | null>(null);
  const [npwpImagePreview, setNpwpImagePreview] = React.useState<string | null>(initialData?.dokumen?.npwp || null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('personal');
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);

  // Cleanup function for file URLs
  React.useEffect(() => {
    return () => {
      if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
      if (ktpImagePreview) URL.revokeObjectURL(ktpImagePreview);
      if (npwpImagePreview) URL.revokeObjectURL(npwpImagePreview);
    };
  }, [profileImagePreview, ktpImagePreview, npwpImagePreview]);

  // Form validation
  type FormValues = EmployeeFormInputs & {
    aktif: boolean;
    roleId: string;
    cabangId: string;
  };

  const form = useForm<FormValues>({
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

  // Generic file upload handler
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void,
    fileType: 'profile' | 'ktp' | 'npwp'
  ) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Validate file
        const validation = fileValidationSchema.safeParse({
          size: file.size,
          type: file.type
        });

        if (!validation.success) {
          toast({
            message: validation.error.errors[0].message,
            type: 'error',
          });
          return;
        }

        setFile(file);
        setPreview(URL.createObjectURL(file));
      }
    } catch (error) {
      console.error(`Error handling ${fileType} upload:`, error);
      toast({
        message: `Gagal mengunggah file ${fileType}. Silakan coba lagi.`,
        type: 'error',
      });
    }
  };

  // Specific file handlers
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    handleFileChange(e, setProfileImage, setProfileImagePreview, 'profile');

  const handleKtpImageChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    handleFileChange(e, setKtpImage, setKtpImagePreview, 'ktp');

  const handleNpwpImageChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    handleFileChange(e, setNpwpImage, setNpwpImagePreview, 'npwp');

  // Remove file handlers
  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const removeKtpImage = () => {
    setKtpImage(null);
    setKtpImagePreview(null);
  };

  const removeNpwpImage = () => {
    setNpwpImage(null);
    setNpwpImagePreview(null);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission
  const handleFormSubmit = async (data: EmployeeFormInputs) => {
    try {
      setUploadProgress(0);
      const formData = new FormData();
      
      // Find the selected role to get its kodeRole
      const selectedRole = roles.find((role) => role._id === data.roleId);
      
      if (!selectedRole) {
        toast({
          message: 'Role yang dipilih tidak ditemukan',
          type: 'error',
        });
        return;
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
      
      // Validate and append file uploads if available
      try {
        if (profileImage) {
          await validateFile(profileImage, 'Foto Profil');
          formData.append('fotoProfil', profileImage);
        }
        
        if (ktpImage) {
          await validateFile(ktpImage, 'KTP');
          formData.append('ktp', ktpImage);
        }
        
        if (npwpImage) {
          await validateFile(npwpImage, 'NPWP');
          formData.append('npwp', npwpImage);
        }
      } catch (validationError: any) {
        toast({
          message: validationError.message,
          type: 'error',
        });
        return;
      }
      
      // Custom onSubmit handler with progress tracking
      const customSubmit = async (formData: FormData) => {
        try {
          await onSubmit(formData);
          toast({
            message: `Pegawai berhasil ${initialData ? 'diperbarui' : 'ditambahkan'}`,
            type: 'success',
          });
        } catch (error: any) {
          if (error.status === 409) {
            toast({
              message: 'Username sudah digunakan. Silakan gunakan username lain.',
              type: 'error',
            });
          } else if (error.status === 413) {
            toast({
              message: 'Ukuran file terlalu besar. Maksimal 5MB per file.',
              type: 'error',
            });
          } else {
            toast({
              message: error.message || 'Terjadi kesalahan saat menyimpan data',
              type: 'error',
            });
          }
          throw error;
        }
      };

      await customSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setUploadProgress(0);
    }
  };

  // File validation helper
  const validateFile = async (file: File, fieldName: string): Promise<void> => {
    const validation = fileValidationSchema.safeParse({
      size: file.size,
      type: file.type
    });

    if (!validation.success) {
      throw new Error(`${fieldName}: ${validation.error.errors[0].message}`);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'personal', name: 'Data Pribadi' },
              { id: 'job', name: 'Informasi Pekerjaan' },
              { id: 'documents', name: 'Dokumen' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
                `}
                type="button"
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImagePreview || undefined} alt="Profile" />
                  <AvatarFallback className="text-4xl bg-primary/10">
                    {form.watch('nama') ? form.watch('nama').charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="absolute -bottom-2 -right-2 flex space-x-1">
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    className="h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-100"
                    onClick={() => document.getElementById('profile-upload')?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  
                  {profileImagePreview && (
                    <Button
                      type="button"
                      variant="contained"
                      size="small"
                      color="error"
                      className="h-8 w-8 rounded-full"
                      onClick={removeProfileImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <FormField<FormValues>
                name="nama"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama pegawai" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField<FormValues>
                name="telepon"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nomor telepon" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField<EmployeeFormInputs>
                name="email"
                children={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Opsional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Masukkan email" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <FormField<EmployeeFormInputs>
                name="aktif"
                children={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(checked)}
                        disabled={loading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Status Aktif</FormLabel>
                      <p className="text-sm text-gray-500">
                        Pegawai dapat mengakses sistem jika aktif
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField<EmployeeFormInputs>
                name="alamat"
                children={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Masukkan alamat lengkap" 
                        value={String(field.value || '')}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={loading}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Job Information Tab */}
        {activeTab === 'job' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Position */}
            <FormField<EmployeeFormInputs>
              name="jabatan"
              children={({ field }) => (
                <FormItem>
                  <FormLabel>Jabatan</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan jabatan" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField<EmployeeFormInputs>
              name="roleId"
              children={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={String(field.value || '')}
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
            <FormField<EmployeeFormInputs>
              name="cabangId"
              children={({ field }) => (
                <FormItem>
                  <FormLabel>Cabang</FormLabel>
                  <Select
                    disabled={loading || !!user?.cabangId}
                    onValueChange={field.onChange}
                    value={String(field.value || '')}
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
            <FormField<EmployeeFormInputs>
              name="username"
              children={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan username" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField<EmployeeFormInputs>
              name="password"
              children={({ field }) => (
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
                        size="small"
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
            />

            {/* Confirm Password */}
            <FormField<EmployeeFormInputs>
              name="confirmPassword"
              children={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
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
                        size="small"
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
            />
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-8">
            {/* KTP Document */}
            <div>
              <FormLabel className="block text-sm font-medium mb-2">
                KTP
              </FormLabel>
              
              {ktpImagePreview ? (
                <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={ktpImagePreview} 
                    alt="KTP" 
                    className="w-full h-auto max-h-48 object-contain"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      className="h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white"
                      onClick={() => document.getElementById('ktp-upload')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="contained"
                      size="small"
                      color="error"
                      className="h-8 w-8 rounded-full"
                      onClick={removeKtpImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => document.getElementById('ktp-upload')?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
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
                <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={npwpImagePreview} 
                    alt="NPWP" 
                    className="w-full h-auto max-h-48 object-contain"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      className="h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white"
                      onClick={() => document.getElementById('npwp-upload')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="contained"
                      size="small"
                      color="error"
                      className="h-8 w-8 rounded-full"
                      onClick={removeNpwpImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => document.getElementById('npwp-upload')?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
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
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-primary h-2.5 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
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
            variant="contained"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Menyimpan...
              </>
            ) : initialData ? 'Perbarui Pegawai' : 'Tambah Pegawai'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default EmployeeForm;