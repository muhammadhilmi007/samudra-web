// src/types/employee.ts
import { z } from 'zod';
import { Branch } from './branch';

// Constants for validation
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_DOCUMENT_TYPES = [...ALLOWED_FILE_TYPES, 'application/pdf'];
export const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;

// Base permission types
export type Permission = 
  // Dashboard
  | 'view_dashboard'
  
  // User management
  | 'manage_employees' | 'manage_branch_employees' | 'view_employees'
  | 'create_employee' | 'edit_employee' | 'delete_employee'
  
  // Branch & Division management
  | 'manage_branches' | 'manage_divisions' | 'view_branches' | 'view_divisions'
  | 'create_branch' | 'edit_branch' | 'delete_branch'
  
  // Role management
  | 'manage_roles' | 'view_roles' | 'create_role' | 'edit_role' | 'delete_role'
  
  // Customer management
  | 'manage_customers' | 'view_customers' | 'view_branch_customers'
  | 'create_customers' | 'create_branch_customers' | 'edit_customers' | 'delete_customers'
  
  // Reports
  | 'view_reports' | 'view_branch_reports' | 'export_reports'
  
  // Finances
  | 'manage_finances' | 'view_finances' | 'view_branch_finances' | 'manage_branch_transactions'
  
  // Vehicles
  | 'manage_vehicles' | 'view_vehicles' | 'view_branch_vehicles'
  | 'create_vehicle' | 'edit_vehicle' | 'delete_vehicle'
  
  // STT management
  | 'view_stt' | 'view_branch_stt' | 'create_stt' | 'create_branch_stt'
  | 'edit_stt' | 'edit_branch_stt' | 'delete_stt' | 'update_branch_stt_status'
  
  // Loadings
  | 'manage_loadings' | 'manage_branch_loadings' | 'view_branch_loadings'
  
  // Deliveries
  | 'manage_deliveries' | 'manage_branch_deliveries' | 'view_branch_deliveries'
  | 'view_assigned_deliveries' | 'update_delivery_status'
  
  // Returns
  | 'manage_returns' | 'manage_branch_returns'
  
  // Pickups
  | 'manage_pickups' | 'manage_branch_pickups'
  
  // Collections
  | 'manage_collections' | 'manage_branch_collections' | 'view_collections'
  
  // Truck Queues
  | 'manage_truck_queues' | 'manage_branch_truck_queues' | 'view_truck_queues';

// File validation schema
export const fileValidationSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, 'Ukuran file maksimal 5MB'),
  type: z.string().refine(type => ALLOWED_FILE_TYPES.includes(type), {
    message: 'Format file harus berupa JPG, JPEG, atau PNG'
  })
});

// Document validation schema
export const documentValidationSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, 'Ukuran file maksimal 5MB'),
  type: z.string().refine(type => ALLOWED_DOCUMENT_TYPES.includes(type), {
    message: 'Format file harus berupa JPG, JPEG, PNG, atau PDF'
  })
});

// Employee form schema for create/update
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
  
  // File fields are handled separately in the UI logic
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

// Role form schema for create/update
export const roleFormSchema = z.object({
  namaRole: z.string().min(3, 'Nama role minimal 3 karakter')
    .max(50, 'Nama role maksimal 50 karakter'),
  
  kodeRole: z.string().min(3, 'Kode role minimal 3 karakter')
    .max(20, 'Kode role maksimal 20 karakter')
    .regex(/^[a-z0-9_]+$/, 'Kode role hanya boleh berisi huruf kecil, angka, dan underscore'),
  
  deskripsi: z.string().max(255, 'Deskripsi maksimal 255 karakter').optional(),
  
  permissions: z.array(z.string())
    .min(1, 'Role harus memiliki minimal 1 permission')
});

// Derived types from schemas
export type EmployeeFormInputs = z.infer<typeof employeeFormSchema>;
export type RoleFormInputs = z.infer<typeof roleFormSchema>;

// Interface for the Employee model
export interface Employee {
  lastLogin: any;
  _id: string;
  nama: string;
  jabatan: string;
  roleId: string | Role;
  role?: {
    kodeRole: string;
  };
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
  cabangId: string | Branch;
  aktif: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface for the Role model
export interface Role {
  _id: string;
  namaRole: string;
  kodeRole: string;
  deskripsi?: string;
  permissions: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

// API response types
export interface EmployeeResponse {
  success: boolean;
  data: Employee;
  message?: string;
}

export interface EmployeeListResponse {
  success: boolean;
  count: number;
  pagination?: {
    prev?: { page: number; limit: number };
    next?: { page: number; limit: number };
  };
  total: number;
  data: Employee[];
  message?: string;
}

export interface RoleResponse {
  success: boolean;
  data: Role;
  message?: string;
}

export interface RoleListResponse {
  success: boolean;
  count: number;
  data: Role[];
  message?: string;
}

// Query params for filtering employees
export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  cabangId?: string;
  roleId?: string;
  aktif?: boolean;
}

// Form data for creating/updating employees with files
export interface EmployeeFormData extends FormData {
  append(name: keyof EmployeeFormInputs | 'fotoProfil' | 'dokumen.ktp' | 'dokumen.npwp', value: string | Blob, fileName?: string): void;
}