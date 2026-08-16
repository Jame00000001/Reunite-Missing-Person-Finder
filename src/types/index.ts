export type UserRole = 'user' | 'admin';
export type ReportType = 'missing' | 'found';
export type ReportStatus = 'Pending' | 'Missing' | 'Found' | 'Reunited' | 'Closed';
export type Gender = 'Male' | 'Female' | 'Other';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Report {
  id: number;
  user_id: number;
  report_type: ReportType;
  name: string | null;
  age: number;
  gender: Gender;
  photo_url: string;
  location: string;
  report_date: string;
  report_time: string | null;
  clothing_description: string | null;
  additional_info: string | null;
  contact_phone: string;
  status: ReportStatus;
  admin_notes: string | null;
  created_at?: string;
  updated_at?: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  missing: number;
  found: number;
  reunited: number;
  closed: number;
  usersCount: number;
}
