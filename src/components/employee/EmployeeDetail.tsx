import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Employee } from '../../types/employee';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface EmployeeDetailProps {
  employeeId: string;
  onEdit?: () => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ 
  employeeId, 
  onEdit 
}) => {
  const { employees, roles } = useSelector((state: RootState) => state.employee);
  const { branches } = useSelector((state: RootState) => state.branch);

  // Find the specific employee
  const employee = employees.find(emp => emp._id === employeeId);

  // If no employee found, return null
  if (!employee) {
    return (
      <Card>
        <CardContent className="text-center py-4">
          Pegawai tidak ditemukan
        </CardContent>
      </Card>
    );
  }

  // Get role name
  const getRoleName = () => {
    const role = roles.find(r => r._id === employee.roleId);
    return role ? role.namaRole : '-';
  };

  // Get branch name
  const getBranchName = () => {
    const branch = branches.find(b => b._id === employee.cabangId);
    return branch ? branch.namaCabang : '-';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Detail Pegawai</CardTitle>
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Edit Profil
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage 
              src={employee.fotoProfil || undefined} 
              alt={employee.nama}
            />
            <AvatarFallback className="text-4xl">
              {employee.nama.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{employee.nama}</h2>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={employee.aktif ? 'default' : 'destructive'}>
                {employee.aktif ? 'Aktif' : 'Nonaktif'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {getRoleName()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Informasi Pribadi</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium mr-2">Jabatan:</span>
                <span>{employee.jabatan}</span>
              </div>
              <div>
                <span className="font-medium mr-2">Email:</span>
                <span>{employee.email || '-'}</span>
              </div>
              <div>
                <span className="font-medium mr-2">Telepon:</span>
                <span>{employee.telepon}</span>
              </div>
              <div>
                <span className="font-medium mr-2">Alamat:</span>
                <span>{employee.alamat}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Informasi Pekerjaan</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium mr-2">Username:</span>
                <span>{employee.username}</span>
              </div>
              <div>
                <span className="font-medium mr-2">Cabang:</span>
                <span>{getBranchName()}</span>
              </div>
              <div>
                <span className="font-medium mr-2">Dokumen:</span>
                <div className="inline-flex space-x-2">
                  {employee.dokumen?.ktp && (
                    <Badge variant="secondary">KTP</Badge>
                  )}
                  {employee.dokumen?.npwp && (
                    <Badge variant="secondary">NPWP</Badge>
                  )}
                  {!employee.dokumen?.ktp && !employee.dokumen?.npwp && (
                    <span className="text-muted-foreground">Tidak ada dokumen</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeDetail;