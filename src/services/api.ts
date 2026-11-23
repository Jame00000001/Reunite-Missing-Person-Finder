import {
  Report,
  User,
  AuthResponse,
  DashboardStats,
  ReportStatus,
} from '../types/index.ts';

import { auth } from '../lib/firebase.ts';

const API_BASE = '/api';

const getHeaders = async (includeAuth = true): Promise<HeadersInit> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth && auth.currentUser) {
    const token = await auth.currentUser.getIdToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const api = {
  // Auth APIs
  auth: {
    login: async (credentials: {
      email: string;
      password: string;
    }): Promise<AuthResponse> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: await getHeaders(false),
        body: JSON.stringify(credentials),
      });

      return res.json();
    },

    register: async (userData: {
      name: string;
      email: string;
      phone: string;
      password: string;
      role?: string;
    }): Promise<AuthResponse> => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: await getHeaders(false),
        body: JSON.stringify(userData),
      });

      return res.json();
    },

    getMe: async (): Promise<{
      success: boolean;
      user?: User;
      message?: string;
    }> => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: await getHeaders(true),
      });

      return res.json();
    },
  },

  // Reports APIs
  reports: {
    getAll: async (params?: {
      search?: string;
      type?: string;
      gender?: string;
      status?: string;
      ageMin?: number;
      ageMax?: number;
      location?: string;
    }): Promise<{
      success: boolean;
      count: number;
      reports: Report[];
    }> => {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            queryParams.append(key, String(val));
          }
        });
      }

      const res = await fetch(
        `${API_BASE}/reports?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: await getHeaders(false),
        }
      );

      return res.json();
    },

    getById: async (
      id: number
    ): Promise<{
      success: boolean;
      report?: Report;
      message?: string;
    }> => {
      const res = await fetch(`${API_BASE}/reports/${id}`, {
        method: 'GET',
        headers: await getHeaders(true),
      });

      return res.json();
    },

    getMyReports: async (): Promise<{
      success: boolean;
      count: number;
      reports: Report[];
    }> => {
      const res = await fetch(`${API_BASE}/reports/user/my-reports`, {
        method: 'GET',
        headers: await getHeaders(true),
      });

      return res.json();
    },

    create: async (
      data: Partial<Report>
    ): Promise<{
      success: boolean;
      message: string;
      report?: Report;
    }> => {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: await getHeaders(true),
        body: JSON.stringify(data),
      });

      return res.json();
    },

    update: async (
      id: number,
      data: Partial<Report>
    ): Promise<{
      success: boolean;
      message: string;
      report?: Report;
    }> => {
      const res = await fetch(`${API_BASE}/reports/${id}`, {
        method: 'PUT',
        headers: await getHeaders(true),
        body: JSON.stringify(data),
      });

      return res.json();
    },

    delete: async (
      id: number
    ): Promise<{
      success: boolean;
      message: string;
    }> => {
      const res = await fetch(`${API_BASE}/reports/${id}`, {
        method: 'DELETE',
        headers: await getHeaders(true),
      });

      return res.json();
    },
  },

  // Admin APIs
  admin: {
    getAllReports: async (params?: {
      status?: string;
      type?: string;
      search?: string;
    }): Promise<{
      success: boolean;
      count: number;
      reports: Report[];
    }> => {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            queryParams.append(key, String(val));
          }
        });
      }

      const res = await fetch(
        `${API_BASE}/admin/reports?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: await getHeaders(true),
        }
      );

      return res.json();
    },

    updateStatus: async (
      id: number,
      status: ReportStatus,
      admin_notes?: string
    ): Promise<{
      success: boolean;
      message: string;
      report?: Report;
    }> => {
      const res = await fetch(
        `${API_BASE}/admin/reports/${id}/status`,
        {
          method: 'PATCH',
          headers: await getHeaders(true),
          body: JSON.stringify({ status, admin_notes }),
        }
      );

      return res.json();
    },

    getUsers: async (): Promise<{
      success: boolean;
      count: number;
      users: User[];
    }> => {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'GET',
        headers: await getHeaders(true),
      });

      return res.json();
    },

    getStats: async (): Promise<{
      success: boolean;
      stats: DashboardStats;
      isMySqlConnected: boolean;
    }> => {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        method: 'GET',
        headers: await getHeaders(true),
      });

      return res.json();
    },
  },

  // Notification APIs
  notifications: {
    syncLocationPreferences: async (data: {
      latitude?: number;
      longitude?: number;
      location_label?: string | null;
      notifications_enabled: boolean;
    }): Promise<any> => {
      const res = await fetch(
        `${API_BASE}/notifications/location-preferences`,
        {
          method: 'POST',
          headers: await getHeaders(true),
          body: JSON.stringify(data),
        }
      );

      return res.json();
    },
    getStatus: async () => (await fetch(`${API_BASE}/notifications/status`, { headers: await getHeaders(true) })).json(),
    getHistory: async () => (await fetch(`${API_BASE}/notifications/history`, { headers: await getHeaders(true) })).json(),
    getAlertReportPreview: async (id: string) => (await fetch(`${API_BASE}/notifications/reports/${encodeURIComponent(id)}`, { headers: await getHeaders(true) })).json(),
    getVapidPublicKey: async () => (await fetch(`${API_BASE}/notifications/vapid-public-key`)).json(),
    subscribe: async (subscription: unknown) => (await fetch(`${API_BASE}/notifications/subscribe`, { method: 'POST', headers: await getHeaders(true), body: JSON.stringify(subscription) })).json(),
    unsubscribe: async (endpoint?: string) => (await fetch(`${API_BASE}/notifications/subscribe`, { method: 'DELETE', headers: await getHeaders(true), body: JSON.stringify({ endpoint }) })).json(),
    markRead: async (id?: string) => (await fetch(id ? `${API_BASE}/notifications/${encodeURIComponent(id)}/read` : `${API_BASE}/notifications/read-all`, { method: 'PATCH', headers: await getHeaders(true) })).json(),
    dispatchNearby: async (data: unknown) => (await fetch(`${API_BASE}/notifications/dispatch-nearby`, { method: 'POST', headers: await getHeaders(true), body: JSON.stringify(data) })).json(),
  },

  maps: {
    search: async (query: string) => (await fetch(`${API_BASE}/maps/search?q=${encodeURIComponent(query)}`)).json(),
    searchAddress: async (query: string) => (await fetch(`${API_BASE}/maps/search?q=${encodeURIComponent(query)}`)).json(),
    reverseGeocode: async (latitude: number, longitude: number) => (await fetch(`${API_BASE}/maps/reverse?lat=${latitude}&lon=${longitude}`)).json(),
  },

  // System APIs
  system: {
    getHealth: async (): Promise<any> => {
      const res = await fetch(`${API_BASE}/health`);

      return res.json();
    },
  },
};
