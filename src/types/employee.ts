// src/types/employee.ts
import { z } from 'zod';

// Base schema for validation
// Constants for validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;

export const employeeFormSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .regex(/^[a-zA-Z\s.]+$/, 'Nama hanya boleh berisi huruf, spasi, dan titik'),
  
  jabatan: z.string().min(1, 'Jabatan harus diisi')
    .max(50, 'Jabatan maksimal 50 karakter'),
  
  roleId: z.string().min(1, 'Role harus dipilih'),
  
  email: z.string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal('')),
  
  telepon: z.string()
    .regex(PHONE_REGEX, 'Format nomor telepon tidak valid (contoh: 081234567890)'),
  
  alamat: z.string()
    .min(1, 'Alamat harus diisi')
    .max(255, 'Alamat maksimal 255 karakter'),
  
  username: z.string()
    .min(5, 'Username minimal 5 karakter')
    .max(20, 'Username maksimal 20 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh berisi huruf, angka, dan underscore'),
  
  password: z.string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password harus mengandung minimal 8 karakter, huruf besar, huruf kecil, angka, dan karakter spesial')
    .optional()
    .or(z.literal('')),
  
  confirmPassword: z.string()
    .optional()
    .or(z.literal('')),
  
  cabangId: z.string().min(1, 'Cabang harus dipilih'),
  
  aktif: z.boolean().default(true),
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

// File validation schema
export const fileValidationSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, 'Ukuran file maksimal 5MB'),
  type: z.string().refine(type => ALLOWED_FILE_TYPES.includes(type), {
    message: 'Format file harus berupa JPG, JPEG, atau PNG'
  })
});

// Derived type from schema
export type EmployeeFormInputs = z.infer<typeof employeeFormSchema>;

// API response interfaces
export interface Employee {
  _id: string;
  nama: string;
  jabatan: string;
  roleId: string;
  email?: string;
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
  
  // Relations that might be populated
  cabang?: {
    _id: string;
    namaCabang: string;
  };
  role?: {
    _id: string;
    namaRole: string;
    kodeRole: string;
    permissions: string[];
  };
}

export interface Role {
  _id: string;
  kodeRole: string;
  namaRole: string;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleFormInputs {
  namaRole: string;
  kodeRole: string;
  permissions: string[];
}

// API response types
export interface EmployeeResponse {
  success: boolean;
  data: Employee;
  message: string;
}

export interface EmployeeListResponse {
  success: boolean;
  data: {
    employees: Employee[];
    total: number;
    page: number;
    limit: number;
  };
  message: string;
}

export interface RoleResponse {
  success: boolean;
  data: Role;
  message: string;
}

export interface RoleListResponse {
  success: boolean;
  data: {
    roles: Role[];
    total: number;
  };
  message: string;
}