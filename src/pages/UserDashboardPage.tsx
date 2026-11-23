import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  AlertCircle,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  MapPin,
  Calendar,
  Printer,
  Bell,
  Navigation,
} from 'lucide-react';
import { Report } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  getMyReportsFromFirestore,
  updateReportInFirestore,
  deleteReportInFirestore,
} from '../services/firestoreService.ts';

interface UserDashboardPageProps {
  onOpenReportMissing: () => void;
  onOpenReportFound: () => void;
  onEditReport: (report: Report) => void;
  onViewDetails: (report: Report) => void;
  onPrintPoster: (report: Report) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  unreadAlertsCount?: number;
  onOpenLocationAlerts?: () => void;
  onDataChanged?: () => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  onOpenReportMissing,
  onOpenReportFound,
  onEditReport,
  onViewDetails,
  onPrintPoster,
  onOpenAuth,
  unreadAlertsCount = 0,
  onOpenLocationAlerts,
  onDataChanged,
}) => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReuniteId, setConfirmReuniteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMyReports = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const reports = await getMyReportsFromFirestore(user.id);
      setMyReports(reports);
    } catch (err: any) {
      console.error('Failed to fetch user reports:', err);
      setErrorMsg('Failed to load your reports from Firestore.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyReports();
    }
  }, [isAuthenticated, user, fetchMyReports]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setErrorMsg(null);
    try {
      await deleteReportInFirestore(id);
      setFeedback('Report deleted successfully.');
      setConfirmDeleteId(null);
      setMyReports((prev) => prev.filter((r) => r.id !== id));
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error occurred while deleting report.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAsReunited = async (report: Report) => {
    setErrorMsg(null);
    try {
      await updateReportInFirestore(report.id, { status: 'Reunited' }, isAdmin);
      setFeedback(`Case #${report.id.slice(0, 8)} marked as Reunited!`);
      setConfirmReuniteId(null);
      await fetchMyReports();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update case status.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <LayoutDashboard className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">User Dashboard Sign-In Required</h2>
        <p className="text-xs text-slate-500">
          Please sign in with Google to view and manage your submitted reports.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
          >
            Sign In to Your Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalUserReports = myReports.length;
  const missingCount = myReports.filter((r) => r.status === 'Missing').length;
  const foundCount = myReports.filter((r) => r.status === 'Found').length;
  const reunitedCount = myReports.filter((r) => r.status === 'Reunited').length;
  const pendingCount = myReports.filter((r) => r.status === 'Pending').length;

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
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              User Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {user?.email}
            {user?.phone ? ` • ${user.phone}` : ''}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenReportMissing}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25 transition-all"
          >
            <AlertCircle className="w-4 h-4" />
            <span>File Missing Person</span>
          </button>
          <button
            onClick={onOpenReportFound}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File Found Person</span>
          </button>
        </div>
      </div>

      {/* Feedback & Error banners */}
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedback}
          </span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs text-emerald-700 underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            {errorMsg}
          </span>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-rose-700 underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Nearby Alerts & Location Card */}
      {onOpenLocationAlerts && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                user?.latitude !== null &&
                user?.latitude !== undefined &&
                user?.notifications_enabled !== false
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}
            >
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>10 km Nearby Missing Person Alerts</span>
                {unreadAlertsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                    {unreadAlertsCount} New
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {user?.latitude !== null && user?.latitude !== undefined
                  ? `Monitoring radius active around: ${
                      user.location_label ||
                      `${Number(user.latitude).toFixed(4)}, ${Number(user.longitude).toFixed(4)}`
                    }`
                  : 'Set your current location to receive instant push alerts whenever someone goes missing within 10 km.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLocationAlerts}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>
              {user?.latitude !== null && user?.latitude !== undefined
                ? 'Manage Location & Alerts'
                : 'Enable Location Alerts'}
            </span>
          </button>
        </div>
      )}

      {/* User Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Total Reports</span>
          <span className="text-2xl font-black text-slate-900">{totalUserReports}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 text-center shadow-xs">
          <span className="text-xs font-bold text-amber-600 block">Under Review</span>
          <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 text-center shadow-xs">
          <span className="text-xs font-bold text-rose-600 block">Active Missing</span>
          <span className="text-2xl font-black text-rose-600">{missingCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 text-center shadow-xs">
          <span className="text-xs font-bold text-emerald-600 block">Found</span>
          <span className="text-2xl font-black text-emerald-600">{foundCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-teal-200 text-center shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-teal-600 block">Reunited</span>
          <span className="text-2xl font-black text-teal-600">{reunitedCount}</span>
        </div>
      </div>

      {/* Reports Table / List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-slate-900">Your Submitted Case Reports</h3>
            <p className="text-xs text-slate-500">
              Manage your reports, edit details, or mark located individuals as reunited.
            </p>
          </div>
          <button
            onClick={fetchMyReports}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading your reports...</p>
          </div>
        ) : myReports.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">You have not submitted any reports yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                If someone in your care is missing or if you found someone lost, submit a report below.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={onOpenReportMissing}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
              >
                Report Missing Person
              </button>
              <button
                onClick={onOpenReportFound}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Report Found Person
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myReports.map((report) => {
              const isMissing = report.report_type === 'missing';
              const isTerminal = !isAdmin && (report.status === 'Reunited' || report.status === 'Closed');
              return (
                <div
                  key={report.id}
                  className="p-4 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  {/* Left: Picture & Info */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img
                        src={report.photo_url}
                        alt={report.name || 'Person'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isMissing ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isMissing ? 'Missing' : 'Found'}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                        <span className="text-xs text-slate-400">ID: #{report.id.slice(0, 8)}</span>
                      </div>

                      <h4 className="font-bold text-base text-slate-900">
                        {report.name || 'Unidentified Person'}
                      </h4>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                        <span>
                          {report.gender}, {report.age} yrs
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          {report.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-500" />
                          {report.report_date}
                        </span>
                      </div>

                      {report.admin_notes && (
                        <p className="text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md inline-block font-medium">
                          Note from Admin: {report.admin_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => onViewDetails(report)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => onPrintPoster(report)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Poster</span>
                    </button>

                    {!isTerminal && (
                      <button
                        onClick={() => onEditReport(report)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}

                    {report.status !== 'Reunited' && report.status !== 'Closed' && (
                      confirmReuniteId === report.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMarkAsReunited(report)}
                            className="px-2.5 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg"
                          >
                            Confirm Reunited
                          </button>
                          <button
                            onClick={() => setConfirmReuniteId(null)}
                            className="px-2 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmReuniteId(report.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reunited</span>
                        </button>
                      )
                    )}

                    {confirmDeleteId === report.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(report.id)}
                          disabled={deletingId === report.id}
                          className="px-2.5 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                        >
                          {deletingId === report.id ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(report.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
    </div>
  );
};
