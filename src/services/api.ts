import { Report, User, AuthResponse, DashboardStats, ReportStatus } from '../types/index.ts';

const API_BASE = '/api';

const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = localStorage.getItem('reunite_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // --- Auth APIs ---
  auth: {
    login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(false),
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
        headers: getHeaders(false),
        body: JSON.stringify(userData),
      });
      return res.json();
    },

    getMe: async (): Promise<{ success: boolean; user?: User; message?: string }> => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: getHeaders(true),
      });
      return res.json();
    },
  },

  // --- Reports APIs ---
  reports: {
    getAll: async (params?: {
      search?: string;
      type?: string;
      gender?: string;
      status?: string;
      ageMin?: number;
      ageMax?: number;
      location?: string;
    }): Promise<{ success: boolean; count: number; reports: Report[] }> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            queryParams.append(key, String(val));
          }
        });
      }
      const res = await fetch(`${API_BASE}/reports?${queryParams.toString()}`, {
        method: 'GET',
        headers: getHeaders(false),
      });
      return res.json();
    },

    getById: async (id: number): Promise<{ success: boolean; report?: Report; message?: string }> => {
      const res = await fetch(`${API_BASE}/reports/${id}`, {
        method: 'GET',
        headers: getHeaders(true),
      });
      return res.json();
    },

    getMyReports: async (): Promise<{ success: boolean; count: number; reports: Report[] }> => {
      const res = await fetch(`${API_BASE}/reports/user/my-reports`, {
        method: 'GET',
        headers: getHeaders(true),
      });
      return res.json();
    },

    create: async (data: Partial<Report>): Promise<{ success: boolean; message: string; report?: Report }> => {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data),
      });
      return res.json();
    },

    update: async (
      id: number,
      data: Partial<Report>
    ): Promise<{ success: boolean; message: string; report?: Report }> => {
      const res = await fetch(`${API_BASE}/reports/${id}`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(data),
      });
      return res.json();
    },

    delete: async (id: number): Promise<{ success: boolean; message: string }> => {
      const res = await fetch(`${API_BASE}/reports/${id}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      return res.json();
    },
  },

  // --- Admin APIs ---
  admin: {
    getAllReports: async (params?: {
      status?: string;
      type?: string;
      search?: string;
    }): Promise<{ success: boolean; count: number; reports: Report[] }> => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            queryParams.append(key, String(val));
          }
        });
      }
      const res = await fetch(`${API_BASE}/admin/reports?${queryParams.toString()}`, {
        method: 'GET',
        headers: getHeaders(true),
      });
      return res.json();
    },

    updateStatus: async (
      id: number,
      status: ReportStatus,
      admin_notes?: string
    ): Promise<{ success: boolean; message: string; report?: Report }> => {
      const res = await fetch(`${API_BASE}/admin/reports/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(true),
        body: JSON.stringify({ status, admin_notes }),
      });
      return res.json();
    },

    getUsers: async (): Promise<{ success: boolean; count: number; users: User[] }> => {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'GET',
        headers: getHeaders(true),
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
        headers: getHeaders(true),
      });
      return res.json();
    },
  },

  system: {
    getHealth: async (): Promise<any> => {
      const res = await fetch(`${API_BASE}/health`);
      return res.json();
    },
  },
};
