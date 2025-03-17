import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';

// Import komponen-komponen settings
import UserProfileForm from '../../components/settings/UserProfileForm';
import ChangePasswordForm from '../../components/settings/ChangePasswordForm';
import CompanySettings from '../../components/settings/CompanySettings';
import SecuritySettings from '../../components/settings/SecuritySettings';

const SettingsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');

  // Cek izin akses ke pengaturan
  const canAccessSettings = user?.role && [
    'admin', 
    'direktur', 
    'manajerAdministrasi', 
    'manajerSDM'
  ].includes(user.role);

  if (!canAccessSettings) {
    return (
      <div className="container mx-auto py-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Akses Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Anda tidak memiliki izin untuk mengakses halaman pengaturan.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
          <p className="text-muted-foreground">
            Kelola profil, keamanan, dan pengaturan akun Anda
          </p>
        </div>
        <SettingsIcon className="w-8 h-8 text-muted-foreground" />
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="profile">Profil Pengguna</TabsTrigger>
          <TabsTrigger value="password">Ganti Password</TabsTrigger>
          <TabsTrigger value="company">Pengaturan Perusahaan</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <UserProfileForm />
        </TabsContent>

        <TabsContent value="password">
          <ChangePasswordForm />
        </TabsContent>

        <TabsContent value="company">
          <CompanySettings />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;