import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { User, Report } from '../types.ts';

// Pre-seeded initial data matching database/schema.sql
const SEED_USERS: User[] = [
  {
    id: 1,
    name: 'System Administrator',
    email: 'admin@reunite.org',
    phone: '+1 (800) 555-0199',
    // Hash for 'admin123'
    password: '$2a$10$w8T06v1BwF0y85vDkRz6Aeu5y.rDmsU7j3rG1h3rXy6sM2I2bIu8a',
    role: 'admin',
    created_at: new Date('2026-08-01T10:00:00Z').toISOString(),
    updated_at: new Date('2026-08-01T10:00:00Z').toISOString(),
  },
  {
    id: 2,
    name: 'Michael Davis',
    email: 'user@example.com',
    phone: '+1 (555) 234-5678',
    // Hash for 'user123'
    password: '$2a$10$w8T06v1BwF0y85vDkRz6Aeu5y.rDmsU7j3rG1h3rXy6sM2I2bIu8a',
    role: 'user',
    created_at: new Date('2026-08-05T12:30:00Z').toISOString(),
    updated_at: new Date('2026-08-05T12:30:00Z').toISOString(),
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phone: '+1 (555) 876-5432',
    // Hash for 'user123'
    password: '$2a$10$w8T06v1BwF0y85vDkRz6Aeu5y.rDmsU7j3rG1h3rXy6sM2I2bIu8a',
    role: 'user',
    created_at: new Date('2026-08-07T09:15:00Z').toISOString(),
    updated_at: new Date('2026-08-07T09:15:00Z').toISOString(),
  },
];

const SEED_REPORTS: Report[] = [
  {
    id: 1,
    user_id: 2,
    report_type: 'missing',
    name: 'Lucas Davis',
    age: 7,
    gender: 'Male',
    photo_url: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=600&auto=format&fit=crop&q=80',
    location: 'Greenwood Central Park Playground, Springfield',
    report_date: '2026-08-14',
    report_time: '04:30 PM',
    clothing_description: 'Blue dinosaur t-shirt, beige cargo shorts, red light-up sneakers',
    additional_info: 'Speaks English and basic Spanish. Friendly, has a small birthmark on his left forearm. Might respond to the nickname Luke.',
    contact_phone: '+1 (555) 234-5678',
    status: 'Missing',
    admin_notes: 'Verified with local police station incident report #2026-SP-882.',
    created_at: new Date('2026-08-14T17:00:00Z').toISOString(),
    updated_at: new Date('2026-08-14T17:30:00Z').toISOString(),
  },
  {
    id: 2,
    user_id: 3,
    report_type: 'missing',
    name: 'Eleanor Vance',
    age: 78,
    gender: 'Female',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    location: 'Oakridge Senior Living & Market Square, Downtown',
    report_date: '2026-08-15',
    report_time: '11:15 AM',
    clothing_description: 'Floral lilac cardigan, dark grey trousers, brown orthopedic shoes, wearing gold-rimmed reading glasses',
    additional_info: 'Diagnosed with mild Alzheimer’s and short-term memory disorientation. Wanders when seeking her garden. Very gentle.',
    contact_phone: '+1 (555) 876-5432',
    status: 'Missing',
    admin_notes: 'Urgent medical care needed. Broadcast sent to city transit operators.',
    created_at: new Date('2026-08-15T11:45:00Z').toISOString(),
    updated_at: new Date('2026-08-15T12:10:00Z').toISOString(),
  },
  {
    id: 3,
    user_id: 2,
    report_type: 'found',
    name: 'Unknown Toddler (Responds to Emma)',
    age: 4,
    gender: 'Female',
    photo_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80',
    location: 'Metro Subway Station Entrance - North Line',
    report_date: '2026-08-16',
    report_time: '08:00 AM',
    clothing_description: 'Yellow hooded jacket with duck cartoon, polka dot leggings, pink boots',
    additional_info: 'Currently in safe care at Metro Transit Police Station Booth 4. Safe and in good health, carrying a small teddy bear.',
    contact_phone: '+1 (555) 999-1122',
    status: 'Found',
    admin_notes: 'Report verified by Metro Transit safety officer on duty.',
    created_at: new Date('2026-08-16T08:30:00Z').toISOString(),
    updated_at: new Date('2026-08-16T08:45:00Z').toISOString(),
  },
  {
    id: 4,
    user_id: 3,
    report_type: 'missing',
    name: 'David Miller',
    age: 12,
    gender: 'Male',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    location: 'Lincoln Middle School Sports Ground',
    report_date: '2026-08-12',
    report_time: '03:45 PM',
    clothing_description: 'School navy hoodie, black jeans, white Nike backpack',
    additional_info: 'Was seen heading towards Riverview bicycle trail with a black mountain bike.',
    contact_phone: '+1 (555) 345-9876',
    status: 'Reunited',
    admin_notes: 'Family confirmed David was safely located at his friend residence and returned home.',
    created_at: new Date('2026-08-12T16:00:00Z').toISOString(),
    updated_at: new Date('2026-08-13T10:00:00Z').toISOString(),
  },
  {
    id: 5,
    user_id: 2,
    report_type: 'missing',
    name: 'Robert Chen',
    age: 82,
    gender: 'Male',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    location: 'Sunnydale Community Pharmacy, East Wing',
    report_date: '2026-08-15',
    report_time: '02:00 PM',
    clothing_description: 'Navy blue windbreaker, khaki slacks, grey walking cap',
    additional_info: 'Speaks Cantonese and English. Walks with a slight limp using a dark wooden cane.',
    contact_phone: '+1 (555) 456-1122',
    status: 'Pending',
    admin_notes: 'Pending administrator verification of guardian ID.',
    created_at: new Date('2026-08-15T14:30:00Z').toISOString(),
    updated_at: new Date('2026-08-15T14:30:00Z').toISOString(),
  }
];

class DatabaseManager {
  private pool: mysql.Pool | null = null;
  private isMySqlConnected = false;
  private storageFile = path.resolve(process.cwd(), '.data_store.json');
  private users: User[] = [];
  private reports: Report[] = [];
  private nextUserId = 4;
  private nextReportId = 6;

  constructor() {
    this.loadFromStorage();
    this.initMySql();
  }

  private loadFromStorage() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const data = JSON.parse(raw);
        this.users = data.users || SEED_USERS;
        this.reports = data.reports || SEED_REPORTS;
        this.nextUserId = Math.max(...this.users.map((u: User) => u.id), 0) + 1;
        this.nextReportId = Math.max(...this.reports.map((r: Report) => r.id), 0) + 1;
        return;
      }
    } catch {
      // ignore
    }
    this.users = [...SEED_USERS];
    this.reports = [...SEED_REPORTS];
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      fs.writeFileSync(
        this.storageFile,
        JSON.stringify(
          {
            users: this.users,
            reports: this.reports,
          },
          null,
          2
        ),
        'utf-8'
      );
    } catch {
      // storage write fail silent
    }
  }

  private async initMySql() {
    const host = process.env.DB_HOST || '127.0.0.1';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'reunite_db';
    const port = Number(process.env.DB_PORT) || 3306;

    try {
      this.pool = mysql.createPool({
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 2000,
      });

      // Test connection
      const connection = await this.pool.getConnection();
      this.isMySqlConnected = true;
      connection.release();
      console.log(`[Database] Successfully connected to MySQL database: ${database} at ${host}:${port}`);
    } catch (err: any) {
      this.isMySqlConnected = false;
      console.log(`[Database] MySQL not reachable (${err?.message || 'Connection failed'}). Using persistent local database engine.`);
    }
  }

  public isUsingMySql(): boolean {
    return this.isMySqlConnected;
  }

  // --- Users Operations ---
  public async findUserByEmail(email: string): Promise<User | null> {
    if (this.isMySqlConnected && this.pool) {
      try {
        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(
          'SELECT * FROM users WHERE email = ? LIMIT 1',
          [email]
        );
        if (rows.length > 0) return rows[0] as User;
        return null;
      } catch (err) {
        console.error('[Database MySQL error, fallback]:', err);
      }
    }
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  public async findUserById(id: number): Promise<User | null> {
    if (this.isMySqlConnected && this.pool) {
      try {
        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(
          'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
          [id]
        );
        if (rows.length > 0) return rows[0] as User;
        return null;
      } catch (err) {
        console.error('[Database MySQL error, fallback]:', err);
      }
    }
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser as User;
  }

  public async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    if (this.isMySqlConnected && this.pool) {
      try {
        const [result] = await this.pool.execute<mysql.ResultSetHeader>(
          'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
          [userData.name, userData.email, userData.phone, userData.password, userData.role || 'user']
        );
        const newId = result.insertId;
        const created = await this.findUserById(newId);
        if (created) return created;
      } catch (err) {
        console.error('[Database MySQL error, fallback]:', err);
      }
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: this.nextUserId++,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role || 'user',
      created_at: now,
      updated_at: now,
    };
    this.users.push(newUser);
    this.saveToStorage();
    const { password, ...safeUser } = newUser;
    return safeUser as User;
  }

  public async getAllUsers(): Promise<User[]> {
    if (this.isMySqlConnected && this.pool) {
      try {
        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(
          'SELECT id, name, email, phone, role, created_at, updated_at FROM users ORDER BY id DESC'
        );
        return rows as User[];
      } catch (err) {
        console.error('[Database MySQL error, fallback]:', err);
      }
    }
    return this.users.map(({ password, ...u }) => ({ ...u }));
  }

  // --- Reports Operations ---
  public async getReports(filters?: {
    search?: string;
    type?: string;
    gender?: string;
    status?: string;
    ageMin?: number;
    ageMax?: number;
    location?: string;
    includePending?: boolean;
    userId?: number;
  }): Promise<Report[]> {
    if (this.isMySqlConnected && this.pool) {
      try {
        let sql = `
          SELECT r.*, u.name AS reporter_name, u.email AS reporter_email, u.phone AS reporter_phone
          FROM reports r
          LEFT JOIN users u ON r.user_id = u.id
          WHERE 1=1
        `;
        const params: any[] = [];

        if (filters?.userId) {
          sql += ' AND r.user_id = ?';
          params.push(filters.userId);
        } else if (!filters?.includePending) {
          // Public view only shows non-pending (or Reunited/Closed depending on filter)
          sql += " AND r.status != 'Pending'";
        }

        if (filters?.type && filters.type !== 'all') {
          sql += ' AND r.report_type = ?';
          params.push(filters.type);
        }

        if (filters?.gender && filters.gender !== 'all') {
          sql += ' AND r.gender = ?';
          params.push(filters.gender);
        }

        if (filters?.status && filters.status !== 'all') {
          sql += ' AND r.status = ?';
          params.push(filters.status);
        }

        if (filters?.ageMin !== undefined && !isNaN(filters.ageMin)) {
          sql += ' AND r.age >= ?';
          params.push(filters.ageMin);
        }

        if (filters?.ageMax !== undefined && !isNaN(filters.ageMax)) {
          sql += ' AND r.age <= ?';
          params.push(filters.ageMax);
        }

        if (filters?.location) {
          sql += ' AND r.location LIKE ?';
          params.push(`%${filters.location}%`);
        }

        if (filters?.search) {
          sql += ' AND (r.name LIKE ? OR r.location LIKE ? OR r.clothing_description LIKE ? OR r.additional_info LIKE ?)';
          const searchPattern = `%${filters.search}%`;
          params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }

        sql += ' ORDER BY r.created_at DESC';

        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(sql, params);
        return rows as Report[];
      } catch (err) {
        console.error('[Database MySQL error, fallback]:', err);
      }
    }

    // Fallback store
    let results = this.reports.map((r) => {
      const user = this.users.find((u) => u.id === r.user_id);
      return {
        ...r,
        reporter_name: user?.name || 'Unknown Reporter',
        reporter_email: user?.email || '',
        reporter_phone: user?.phone || '',
      };
    });

    if (filters?.userId) {
      results = results.filter((r) => r.user_id === filters.userId);
    } else if (!filters?.includePending) {
      results = results.filter((r) => r.status !== 'Pending');
    }

    if (filters?.type && filters.type !== 'all') {
      results = results.filter((r) => r.report_type === filters.type);
    }

    if (filters?.gender && filters.gender !== 'all') {
      results = results.filter((r) => r.gender.toLowerCase() === filters.gender?.toLowerCase());
    }

    if (filters?.status && filters.status !== 'all') {
      results = results.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.ageMin !== undefined && !isNaN(filters.ageMin)) {
      results = results.filter((r) => r.age >= filters.ageMin!);
    }

    if (filters?.ageMax !== undefined && !isNaN(filters.ageMax)) {
      results = results.filter((r) => r.age <= filters.ageMax!);
    }

    if (filters?.location) {
      const loc = filters.location.toLowerCase();
      results = results.filter((r) => r.location.toLowerCase().includes(loc));
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(q)) ||
          r.location.toLowerCase().includes(q) ||
          (r.clothing_description && r.clothing_description.toLowerCase().includes(q)) ||
          (r.additional_info && r.additional_info.toLowerCase().includes(q))
      );
    }

    return results.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  }

  public async getReportById(id: number): Promise<Report | null> {
    if (this.isMySqlConnected && this.pool) {
      try {
        const [rows] = await this.pool.execute<mysql.RowDataPacket[]>(
          `SELECT r.*, u.name AS reporter_name, u.email AS reporter_email, u.phone AS reporter_phone
           FROM reports r
           LEFT JOIN users u ON r.user_id = u.id
           WHERE r.id = ? LIMIT 1`,
          [id]
        );
        if (rows.length > 0) return rows[0] as Report;
        return null;
      } catch (err) {
        console.error('[Database MySQL error, fallback]:', err);
      }
    }

    const report = this.reports.find((r) => r.id === id);
    if (!report) return null;
    const user = this.users.find((u) => u.id === report.user_id);
    return {
      ...report,
      reporter_name: user?.name || 'Unknown Reporter',
      reporter_email: user?.email || '',
      reporter_phone: user?.phone || '',
    };
  }

  public async createReport(reportData: Omit<Report, 'id' | 'created_at' | 'updated_at'>): Promise<Report> {
    if (this.isMySqlConnected && this.pool) {
      try {
        const [result] = await this.pool.execute<mysql.ResultSetHeader>(
          `INSERT INTO reports (
            user_id, report_type, name, age, gender, photo_url, location, 
            report_date, report_time, clothing_description, additional_info, 
            contact_phone, status, admin_notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            reportData.user_id,
            reportData.report_type,
            reportData.name || null,
            reportData.age,
            reportData.gender,
            reportData.photo_url,
            reportData.location,
            reportData.report_date,
            reportData.report_time || null,
            reportData.clothing_description || null,
            reportData.additional_info || null,
            reportData.contact_phone,
            reportData.status || 'Pending',
            reportData.admin_notes || null,
          ]
        );
        const newReport = await this.getReportById(result.insertId);
        if (newReport) return newReport;
      } catch (err) {
        console.error('[Database MySQL error, fallback]:', err);
      }
    }

    const now = new Date().toISOString();
    const newReport: Report = {
      id: this.nextReportId++,
      user_id: reportData.user_id,
      report_type: reportData.report_type,
      name: reportData.name || null,
      age: reportData.age,
      gender: reportData.gender,
      photo_url: reportData.photo_url,
      location: reportData.location,
      report_date: reportData.report_date,
      report_time: reportData.report_time || null,
      clothing_description: reportData.clothing_description || null,
      additional_info: reportData.additional_info || null,
      contact_phone: reportData.contact_phone,
      status: reportData.status || 'Pending',
      admin_notes: reportData.admin_notes || null,
      created_at: now,
      updated_at: now,
    };
    this.reports.unshift(newReport);
    this.saveToStorage();
    const user = this.users.find((u) => u.id === newReport.user_id);
    return {
      ...newReport,
      reporter_name: user?.name,
      reporter_email: user?.email,
      reporter_phone: user?.phone,
    };
  }

  public async updateReport(id: number, updates: Partial<Report>): Promise<Report | null> {
    if (this.isMySqlConnected && this.pool) {
      try {
        const fields: string[] = [];
        const values: any[] = [];

        for (const [key, value] of Object.entries(updates)) {
          if (['id', 'user_id', 'created_at', 'reporter_name', 'reporter_email', 'reporter_phone'].includes(key)) continue;
          fields.push(`\`${key}\` = ?`);
          values.push(value);
        }

        if (fields.length > 0) {
          values.push(id);
          await this.pool.execute(
            `UPDATE reports SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
          );
        }
        return await this.getReportById(id);
      } catch (err) {
        console.error('[Database MySQL error, fallback]:', err);
      }
    }

    const index = this.reports.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const existing = this.reports[index];
    const updated: Report = {
      ...existing,
      ...updates,
      id: existing.id,
      user_id: existing.user_id,
      updated_at: new Date().toISOString(),
    };
    this.reports[index] = updated;
    this.saveToStorage();
    return await this.getReportById(id);
  }

  public async deleteReport(id: number): Promise<boolean> {
    if (this.isMySqlConnected && this.pool) {
      try {
        const [result] = await this.pool.execute<mysql.ResultSetHeader>(
          'DELETE FROM reports WHERE id = ?',
          [id]
        );
        return result.affectedRows > 0;
      } catch (err) {
        console.error('[Database MySQL error, fallback]:', err);
      }
    }

    const initialLen = this.reports.length;
    this.reports = this.reports.filter((r) => r.id !== id);
    if (this.reports.length !== initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public async getStats(): Promise<{
    total: number;
    pending: number;
    missing: number;
    found: number;
    reunited: number;
    closed: number;
    usersCount: number;
  }> {
    const allReports = await this.getReports({ includePending: true });
    const allUsers = await this.getAllUsers();

    return {
      total: allReports.length,
      pending: allReports.filter((r) => r.status === 'Pending').length,
      missing: allReports.filter((r) => r.status === 'Missing').length,
      found: allReports.filter((r) => r.status === 'Found').length,
      reunited: allReports.filter((r) => r.status === 'Reunited').length,
      closed: allReports.filter((r) => r.status === 'Closed').length,
      usersCount: allUsers.length,
    };
  }
}

export const db = new DatabaseManager();
