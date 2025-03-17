import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppDispatch } from '../../store';
import { changePassword } from '../../store/slices/authSlice';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Skema validasi
const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, { message: "Kata sandi saat ini minimal 6 karakter" }),
  newPassword: z.string().min(6, { message: "Kata sandi baru minimal 6 karakter" }),
  confirmPassword: z.string().min(6, { message: "Konfirmasi kata sandi minimal 6 karakter" })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Kata sandi baru dan konfirmasi kata sandi tidak cocok",
  path: ["confirmPassword"]
});

const ChangePasswordForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await dispatch(changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      })).unwrap();

      toast({
        title: 'Berhasil',
        description: 'Kata sandi berhasil diperbarui',
      });

      // Reset form setelah berhasil
      reset();
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal mengubah kata sandi',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganti Kata Sandi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-2">Kata Sandi Saat Ini</label>
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="password" 
                  placeholder="Masukkan kata sandi saat ini" 
                  error={errors.currentPassword?.message}
                />
              )}
            />
            {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block mb-2">Kata Sandi Baru</label>
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="password" 
                  placeholder="Masukkan kata sandi baru" 
                  error={errors.newPassword?.message}
                />
              )}
            />
            {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block mb-2">Konfirmasi Kata Sandi Baru</label>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="password" 
                  placeholder="Konfirmasi kata sandi baru" 
                  error={errors.confirmPassword?.message}
                />
              )}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memperbarui...' : 'Ganti Kata Sandi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;