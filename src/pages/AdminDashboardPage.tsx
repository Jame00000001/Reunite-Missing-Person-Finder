import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  Users,
  Search,
  CheckCircle2,
  RefreshCw,
  Database,
  Printer,
  Phone,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Report, User, ReportStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface AdminDashboardPageProps {
  onEditReport: (report: Report) => void;
  onViewDetails: (report: Report) => void;
  onPrintPoster: (report: Report) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onEditReport,
  onViewDetails,
  onPrintPoster,
}) => {
  const { user, isAdmin, login, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'users' | 'system'>('pending');
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isMySql, setIsMySql] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusChangeFeedback, setStatusChangeFeedback] = useState<string | null>(null);

  // Quick admin login form state
  const [adminEmail, setAdminEmail] = useState('admin@reunite.org');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await login(adminEmail, adminPassword);
      if (!res.success) {
        setAuthError(res.message || 'Invalid admin credentials');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    setAdminEmail('admin@reunite.org');
    setAdminPassword('admin123');
    try {
      const res = await login('admin@reunite.org', 'admin123');
      if (!res.success) {
        setAuthError(res.message || 'Failed to login as admin');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Quick login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [reportsRes, usersRes, statsRes] = await Promise.all([
        api.admin.getAllReports(),
        api.admin.getUsers(),
        api.admin.getStats(),
      ]);

      if (reportsRes.success) setReports(reportsRes.reports);
      if (usersRes.success) setUsers(usersRes.users);
      if (statsRes.success) {
        setStats(statsRes.stats);
        setIsMySql(statsRes.isMySqlConnected);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleStatusChange = async (id: number, newStatus: ReportStatus, note?: string) => {
    try {
      const res = await api.admin.updateStatus(id, newStatus, note);
      if (res.success) {
        setStatusChangeFeedback(`Report #${id} status changed to "${newStatus}"!`);
        fetchAdminData();
        setTimeout(() => setStatusChangeFeedback(null), 4000);
      } else {
        alert(res.message || 'Failed to update status.');
      }
    } catch {
      alert('Error updating status.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to permanently delete report #${id}?`)) {
      return;
    }

    try {
      const res = await api.reports.delete(id);
      if (res.success) {
        setStatusChangeFeedback(`Report #${id} deleted successfully.`);
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(res.message || 'Failed to delete report.');
      }
    } catch {
      alert('Error deleting report.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Console Login</h2>
            <p className="text-xs text-slate-500 mt-1">
              Administrator credentials required to verify cases, approve pending reports, and manage database records.
            </p>
          </div>
        </div>

        {isAuthenticated && user && user.role !== 'admin' && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Currently Logged in as: {user.name}
            </p>
            <p className="text-amber-700 text-[11px]">
              This account has standard user privileges. Please switch to the administrator account below.
            </p>
          </div>
        )}

        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* 1-Click Quick Admin Login Button */}
        <button
          type="button"
          onClick={handleQuickAdminLogin}
          disabled={isLoggingIn}
          className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-sm shadow-md shadow-purple-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isLoggingIn ? 'Logging in...' : '⚡ Quick Log In as Admin (1-Click)'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
            Or Sign In Manually
          </span>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-purple-600"
              placeholder="admin@reunite.org"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Admin Password</label>
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:border-purple-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            {isLoggingIn ? 'Verifying...' : 'Sign In with Credentials'}
          </button>
        </form>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Demo Credentials: <span className="font-mono text-purple-700 font-bold">admin@reunite.org</span> / <span className="font-mono text-purple-700 font-bold">admin123</span>
          </p>
        </div>
      </div>
    );
  }

  // Filtered lists
  const pendingReports = reports.filter((r) => r.status === 'Pending');

  const filteredAllReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        (r.name && r.name.toLowerCase().includes(q)) ||
        r.location.toLowerCase().includes(q) ||
        r.contact_phone.includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Missing':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Found':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Reunited':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/30 text-purple-300 border border-purple-400/40">
              Administrator Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Reunite Management & Verification Console
          </h1>
          <p className="text-xs text-purple-200 mt-1">
            Logged in as <strong>{user?.name}</strong> ({user?.email}) • Administrator
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={isLoading}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Feedback message */}
      {statusChangeFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusChangeFeedback}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">Total Reports</span>
          <span className="text-2xl font-black text-slate-900">{reports.length}</span>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 text-center shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 block">Pending Review</span>
          <span className="text-2xl font-black text-amber-700">{pendingReports.length}</span>
        </div>

        <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 block">Active Missing</span>
          <span className="text-2xl font-black text-rose-600">
            {reports.filter((r) => r.status === 'Missing').length}
          </span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 block">Found</span>
          <span className="text-2xl font-black text-emerald-600">
            {reports.filter((r) => r.status === 'Found').length}
          </span>
        </div>

        <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 text-center shadow-xs">
          <span className="text-[11px] font-bold text-teal-700 block">Reunited</span>
          <span className="text-2xl font-black text-teal-600">
            {reports.filter((r) => r.status === 'Reunited').length}
          </span>
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 text-center shadow-xs">
          <span className="text-[11px] font-bold text-indigo-700 block">Registered Users</span>
          <span className="text-2xl font-black text-indigo-600">{users.length}</span>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Pending Verification ({pendingReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>All Case Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'users'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Registered Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'system'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database & System Status</span>
        </button>
      </div>

      {/* Tab 1: Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-amber-50/50">
            <h3 className="font-black text-lg text-amber-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Pending Case Approvals (Action Required)
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Review submitted missing and found cases before they are publicly broadcasted to prevent spam or false reports.
            </p>
          </div>

          {pendingReports.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800">No pending reports!</h4>
              <p className="text-xs text-slate-500 mt-1">
                All submitted reports have been verified and processed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingReports.map((report) => {
                const isMissing = report.report_type === 'missing';
                return (
                  <div
                    key={report.id}
                    className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={report.photo_url}
                          alt={report.name || 'Person'}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isMissing ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {isMissing ? 'Missing Report' : 'Found Report'}
                          </span>
                          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                            Pending Review
                          </span>
                          <span className="text-xs text-slate-400">ID: #{report.id}</span>
                        </div>

                        <h4 className="font-bold text-base text-slate-900">
                          {report.name || 'Unidentified Person'} ({report.gender}, {report.age} yrs)
                        </h4>

                        <div className="text-xs text-slate-600 space-y-0.5">
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <strong>Location:</strong> {report.location}
                          </p>
                          <p className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-blue-500" />
                            <strong>Contact:</strong> {report.contact_phone}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Submitted by: {report.reporter_name} ({report.reporter_email})
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => onViewDetails(report)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                      >
                        Details
                      </button>

                      {/* Approve button */}
                      <button
                        onClick={() =>
                          handleStatusChange(
                            report.id,
                            isMissing ? 'Missing' : 'Found',
                            'Approved and verified by administrator.'
                          )
                        }
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Case</span>
                      </button>

                      {/* Reject button */}
                      <button
                        onClick={() =>
                          handleStatusChange(report.id, 'Closed', 'Rejected by administrator: insufficient details or unverified.')
                        }
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => onEditReport(report)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit Report"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Reports Management */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, phone, city..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Missing">Missing</option>
                <option value="Found">Found</option>
                <option value="Reunited">Reunited</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 pl-4">ID</th>
                  <th className="p-3">Person</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Location & Date</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right pr-4">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAllReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80">
                    <td className="p-3 pl-4 font-mono font-bold text-slate-400">#{report.id}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={report.photo_url}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{report.name || 'Unidentified'}</div>
                          <div className="text-[10px] text-slate-400">
                            {report.gender}, {report.age} yrs
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                          report.report_type === 'missing'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {report.report_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800 truncate max-w-[180px]">
                        {report.location}
                      </div>
                      <div className="text-[10px] text-slate-400">{report.report_date}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{report.contact_phone}</td>
                    <td className="p-3">
                      {/* Interactive status selector */}
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                        className={`text-xs font-bold p-1 rounded-lg border focus:outline-hidden ${getStatusBadge(
                          report.status
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Missing">Missing</option>
                        <option value="Found">Found</option>
                        <option value="Reunited">Reunited</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDetails(report)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPrintPoster(report)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Print Poster"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditReport(report)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Registered Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-lg text-slate-900">Registered System Users</h3>
              <p className="text-xs text-slate-500">
                List of registered guardians, volunteers, and system administrators
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
              {users.length} Users Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 pl-4">User ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone Number</th>
                  <th className="p-3">Account Role</th>
                  <th className="p-3 pr-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="p-3 pl-4 font-mono font-bold text-slate-400">#{u.id}</td>
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 font-mono">{u.phone}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role === 'admin' ? 'Administrator' : 'Standard User'}
                      </span>
                    </td>
                    <td className="p-3 pr-4 text-slate-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Database & System Status */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">Database & System Architecture</h3>
              <p className="text-xs text-slate-500">
                Software Engineering Project Database & REST API Status
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Database Engine Status
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isMySql ? 'bg-emerald-500' : 'bg-blue-500'
                  } animate-pulse`}
                />
                <span className="font-bold text-slate-900 text-sm">
                  {isMySql ? 'Connected to MySQL (reunite_db)' : 'Persistent Storage Engine Active'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                The database schema is located at <code>database/schema.sql</code> and defines the
                tables <code>users</code> and <code>reports</code> with relational foreign keys.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Security & Authentication
              </span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 text-sm">JWT + bcrypt (10 rounds)</span>
              </div>
              <p className="text-xs text-slate-600">
                Passwords are automatically hashed with salted bcrypt before storing. REST API endpoints
                are secured with bearer token middleware.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
