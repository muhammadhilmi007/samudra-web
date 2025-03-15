// src/types/employee.ts
export interface Employee {
    _id: string;
    nama: string;
    jabatan: string;
    roleId: string;
    email: string;
    telepon: string;
    alamat: string;
    fotoProfil?: string;
    dokumen?: {
      ktp?: string;
      npwp?: string;
      lainnya?: string[];
    };
    username: string;
    cabangId: string;
    aktif: boolean;
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
    cabang?: {
      _id: string;
      namaCabang: string;
    };
    role?: {
      _id: string;
      namaRole: string;
      permissions: string[];
    };
  }
  
  export interface EmployeeFormInputs {
    nama: string;
    jabatan: string;
    roleId: string;
    email: string;
    telepon: string;
    alamat: string;
    fotoProfil?: File;
    dokumen?: {
      ktp?: File;
      npwp?: File;
      lainnya?: File[];
    };
    username: string;
    password?: string;
    confirmPassword?: string;
    cabangId: string;
    aktif: boolean;
  }
  
  export interface Role {
    _id: string;
    namaRole: string;
    permissions: string[];
  }
  
  export interface RoleFormInputs {
    namaRole: string;
    permissions: string[];
  }