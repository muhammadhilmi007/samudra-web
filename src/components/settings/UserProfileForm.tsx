import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RootState, AppDispatch } from '../../store';
import { updateEmployee } from '../../store/slices/employeeSlice';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Skema validasi
const profileSchema = z.object({
  nama: z.string().min(2, { message: "Nama minimal 2 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }),
  telepon: z.string().min(10, { message: "Nomor telepon minimal 10 digit" }),
  alamat: z.string().optional(),
});

const UserProfileForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nama: user?.nama || '',
      email: user?.email || '',
      telepon: user?.telepon || '',
      alamat: user?.alamat || '',
    }
  });

  // Reset form saat user berubah
  useEffect(() => {
    if (user) {
      reset({
        nama: user.nama,
        email: user.email,
        telepon: user.telepon,
        alamat: user.alamat || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: any) => {
    try {
      // Persiapkan FormData untuk mengunggah file
      const formData = new FormData();
      formData.append('nama', data.nama);
      formData.append('email', data.email);
      formData.append('telepon', data.telepon);
      formData.append('alamat', data.alamat || '');

      await dispatch(updateEmployee({ 
        id: user?._id || '', 
        employeeData: formData 
      })).unwrap();

      toast({
        title: 'Berhasil',
        description: 'Profil berhasil diperbarui',
      });
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal memperbarui profil',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil Pengguna</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-2">Nama</label>
            <Controller
              name="nama"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  placeholder="Nama lengkap" 
                  error={errors.nama?.message}
                />
              )}
            />
            {errors.nama && <p className="text-red-500 text-sm">{errors.nama.message}</p>}
          </div>

          <div>
            <label className="block mb-2">Email</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="email" 
                  placeholder="Email" 
                  error={errors.email?.message}
                />
              )}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block mb-2">Nomor Telepon</label>
            <Controller
              name="telepon"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="tel" 
                  placeholder="Nomor telepon" 
                  error={errors.telepon?.message}
                />
              )}
            />
            {errors.telepon && <p className="text-red-500 text-sm">{errors.telepon.message}</p>}
          </div>

          <div>
            <label className="block mb-2">Alamat</label>
            <Controller
              name="alamat"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  placeholder="Alamat lengkap" 
                  error={errors.alamat?.message}
                />
              )}
            />
            {errors.alamat && <p className="text-red-500 text-sm">{errors.alamat.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memperbarui...' : 'Perbarui Profil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;