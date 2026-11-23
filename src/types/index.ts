export type UserRole = 'user' | 'admin';
export type ReportType = 'missing' | 'found';
export type ReportStatus = 'Pending' | 'Missing' | 'Found' | 'Reunited' | 'Closed';
export type Gender = 'Male' | 'Female' | 'Other';

export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  latitude?: number | null;
  longitude?: number | null;
  location_label?: string | null;
  notifications_enabled?: boolean;
  location_updated_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Report {
  id: string;
  user_id: string;
  report_type: ReportType;
  name: string | null;
  age: number;
  gender: Gender;
  photo_url: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  place_id?: string | null;
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

export interface NearbyAlertSummary {
  matchedUsers: number;
  notificationsSent?: number;
}

export type NotificationStatus = {
  notificationsEnabled: boolean;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  unreadCount: number;
  pushSupported?: boolean;
  pushSubscribed?: boolean;
};

export interface NotificationLogItem {
  id: string;
  report_id: string;
  reportName?: string;
  reportType?: ReportType;
  status?: string;
  message?: string;
  createdAt?: string;
  is_read?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  requiresEmailVerification?: boolean;
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
