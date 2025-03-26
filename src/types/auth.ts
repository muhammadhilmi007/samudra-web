// src/types/auth.ts
export interface User {
  _id: string;
  id?: string; // For compatibility with some components
  nama: string;
  jabatan: string;
  roleId: string;
  role: string;
  permissions?: string[]; // Permissions from the role
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
  cabang?: {
    id?: string;
    _id?: string;
    namaCabang: string;
    alamat?: string;
    kota?: string;
    provinsi?: string;
  };
  aktif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginParams {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RegisterParams {
  nama: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  jabatan: string;
  roleId: string;
  telepon: string;
  alamat: string;
  cabangId: string;
}