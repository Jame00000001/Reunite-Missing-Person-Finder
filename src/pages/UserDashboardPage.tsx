import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  AlertCircle,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Printer,
} from 'lucide-react';
import { Report } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface UserDashboardPageProps {
  onOpenReportMissing: () => void;
  onOpenReportFound: () => void;
  onEditReport: (report: Report) => void;
  onViewDetails: (report: Report) => void;
  onPrintPoster: (report: Report) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  onOpenReportMissing,
  onOpenReportFound,
  onEditReport,
  onViewDetails,
  onPrintPoster,
  onOpenAuth,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchMyReports = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await api.reports.getMyReports();
      if (res.success) {
        setMyReports(res.reports);
      }
    } catch (err) {
      console.error('Failed to fetch user reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyReports();
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this case report? This cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await api.reports.delete(id);
      if (res.success) {
        setFeedback('Report deleted successfully.');
        setMyReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(res.message || 'Failed to delete report.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error occurred while deleting.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAsReunited = async (report: Report) => {
    if (
      !window.confirm(
        `Great news! Mark ${report.name || 'this case'} as safely reunited with family?`
      )
    ) {
      return;
    }

    try {
      const res = await api.reports.update(report.id, {
        status: 'Reunited',
      });
      if (res.success) {
        setFeedback(`Case #${report.id} marked as Reunited! 🎉`);
        fetchMyReports();
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <LayoutDashboard className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">User Dashboard Login Required</h2>
        <p className="text-xs text-slate-500">
          Please log in with your email and password to view and manage your submitted reports.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
          >
            Log In to Your Dashboard
          </button>
        </div>
      </div>
    );
  }

  // User Stats
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
            {user?.email} • {user?.phone}
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

      {/* Feedback banner */}
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
                        <span className="text-xs text-slate-400">ID: #{report.id}</span>
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

                      {/* Admin Note if any */}
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

                    <button
                      onClick={() => onEditReport(report)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {report.status !== 'Reunited' && report.status !== 'Closed' && (
                      <button
                        onClick={() => handleMarkAsReunited(report)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reunited</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(report.id)}
                      disabled={deletingId === report.id}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
    </div>
  );
};
