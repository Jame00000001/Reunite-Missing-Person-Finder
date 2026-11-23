import React, { useState, useEffect, useCallback } from 'react';
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
  MapPin,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { Report, User, ReportStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { BOOTSTRAPPED_ADMIN_EMAIL } from '../lib/firebase.ts';
import {
  getAllReportsAdminFromFirestore,
  getAllUsersFromFirestore,
  updateReportInFirestore,
  deleteReportInFirestore,
  seedSampleReportsAdmin,
} from '../services/firestoreService.ts';
import firebaseConfig from '../../firebase-applet-config.json';

interface AdminDashboardPageProps {
  onEditReport: (report: Report) => void;
  onViewDetails: (report: Report) => void;
  onPrintPoster: (report: Report) => void;
  onDataChanged?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onEditReport,
  onViewDetails,
  onPrintPoster,
  onDataChanged,
}) => {
  const { user, isAdmin, signInWithGoogle, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'users' | 'system'>('pending');
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusChangeFeedback, setStatusChangeFeedback] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleAdminSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setAuthError(res.message || 'Google Sign-In failed');
      } else if (res.user && res.user.role !== 'admin') {
        setAuthError(
          `Signed in as ${res.user.email}, which does not have administrator privileges. Sign in with ${BOOTSTRAPPED_ADMIN_EMAIL}.`
        );
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Sign-in failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const [allReports, allUsers] = await Promise.all([
        getAllReportsAdminFromFirestore(),
        getAllUsersFromFirestore(),
      ]);
      setReports(allReports);
      setUsers(allUsers);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setErrorBanner('Failed to load Firestore admin records. Check security permissions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, fetchAdminData]);

  const handleStatusChange = async (id: string, newStatus: ReportStatus, note?: string) => {
    setErrorBanner(null);
    try {
      await updateReportInFirestore(
        id,
        {
          status: newStatus,
          ...(note !== undefined ? { admin_notes: note } : {}),
        },
        true
      );
      setStatusChangeFeedback(`Report #${id.slice(0, 8)} status changed to "${newStatus}"!`);
      await fetchAdminData();
      if (onDataChanged) onDataChanged();
      setTimeout(() => setStatusChangeFeedback(null), 4000);
    } catch (err: any) {
      setErrorBanner(err?.message || 'Failed to update case status.');
    }
  };

  const handleDelete = async (id: string) => {
    setErrorBanner(null);
    try {
      await deleteReportInFirestore(id);
      setStatusChangeFeedback(`Report #${id.slice(0, 8)} deleted successfully.`);
      setConfirmDeleteId(null);
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setErrorBanner(err?.message || 'Error deleting report.');
    }
  };

  const handleLoadSampleCases = async () => {
    if (!user) return;
    setIsSeeding(true);
    setErrorBanner(null);
    try {
      const count = await seedSampleReportsAdmin(user.id, user.name);
      setStatusChangeFeedback(`Added ${count} sample missing/found cases to Cloud Firestore.`);
      await fetchAdminData();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setErrorBanner(err?.message || 'Failed to seed sample cases.');
    } finally {
      setIsSeeding(false);
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Console Sign-In</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with the verified administrator Google account to review pending cases and manage Firestore records.
            </p>
          </div>
        </div>

        {isAuthenticated && user && user.role !== 'admin' && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Currently Signed In as: {user.name} ({user.email})
            </p>
            <p className="text-amber-700 text-[11px]">
              This account has standard guardian privileges. Switch to the administrator Google account below.
            </p>
          </div>
        )}

        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleAdminSignIn}
          disabled={isLoggingIn}
          className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-sm shadow-md shadow-purple-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          <span>{isLoggingIn ? 'Signing in with Google...' : 'Sign In with Google (Admin)'}</span>
        </button>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Authorized Admin Email:{' '}
            <span className="font-mono text-purple-700 font-bold">{BOOTSTRAPPED_ADMIN_EMAIL}</span>
          </p>
        </div>
      </div>
    );
  }

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
            Signed in as <strong>{user?.name}</strong> ({user?.email}) • Administrator
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {reports.length === 0 && !isLoading && (
            <button
              onClick={handleLoadSampleCases}
              disabled={isSeeding}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSeeding ? 'Seeding...' : 'Load Sample Cases'}</span>
            </button>
          )}
          <button
            onClick={fetchAdminData}
            disabled={isLoading}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Records</span>
          </button>
        </div>
      </div>

      {/* Feedback & Error messages */}
      {statusChangeFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusChangeFeedback}</span>
        </div>
      )}

      {errorBanner && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            {errorBanner}
          </span>
          <button onClick={() => setErrorBanner(null)} className="underline font-bold">
            Dismiss
          </button>
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
                          <span className="text-xs text-slate-400">ID: #{report.id.slice(0, 8)}</span>
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
                            Submitted by: {report.reporter_name}
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

                      <button
                        onClick={() =>
                          handleStatusChange(
                            report.id,
                            'Closed',
                            'Rejected by administrator: insufficient details or unverified.'
                          )
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

                      {confirmDeleteId === report.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="px-2 py-1 bg-rose-600 text-white text-[11px] font-bold rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(report.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
                    <td className="p-3 pl-4 font-mono font-bold text-slate-400">
                      #{report.id.slice(0, 8)}
                    </td>
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
                        {confirmDeleteId === report.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(report.id)}
                              className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(report.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
                List of registered guardians, volunteers, and system administrators in Cloud Firestore
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
                  <th className="p-3 pl-4">UID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Alert Location</th>
                  <th className="p-3">Account Role</th>
                  <th className="p-3 pr-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="p-3 pl-4 font-mono font-bold text-slate-400">
                      #{u.id.slice(0, 8)}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 text-slate-600 truncate max-w-[180px]">
                      {u.location_label || (u.latitude ? `${u.latitude.toFixed(3)}, ${u.longitude?.toFixed(3)}` : 'Not set')}
                    </td>
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
                Firebase Cloud Firestore, Authentication, OpenStreetMap & Web Push Status
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cloud Database Engine
              </span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-900 text-sm">
                  Connected to Firebase Cloud Firestore
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Project: <code>{firebaseConfig.projectId}</code> • Database ID:{' '}
                <code>{firebaseConfig.firestoreDatabaseId}</code>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Security & Authentication
              </span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 text-sm">
                  Firebase Auth + Firestore Rules + ID Token Verification
                </span>
              </div>
              <p className="text-xs text-slate-600">
                User sessions are authenticated with Firebase Google Sign-In, enforced by deployed Firestore security rules and verified on Express Web Push APIs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
