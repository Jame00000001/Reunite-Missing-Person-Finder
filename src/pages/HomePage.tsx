import React, { useState } from 'react';
import {
  Search,
  AlertCircle,
  PlusCircle,
  Users,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { Report, DashboardStats } from '../types/index.ts';
import { ReportCard } from '../components/ReportCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface HomePageProps {
  reports: Report[];
  stats: DashboardStats;
  onNavigateToSearch: () => void;
  onOpenReportMissing: () => void;
  onOpenReportFound: () => void;
  onViewDetails: (report: Report) => void;
  onPrintPoster: (report: Report) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onQuickSearch?: (location: string, category: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  reports,
  stats,
  onNavigateToSearch,
  onOpenReportMissing,
  onOpenReportFound,
  onViewDetails,
  onPrintPoster,
  onOpenAuth,
}) => {
  const { isAuthenticated } = useAuth();
  const [quickLocation, setQuickLocation] = useState('');
  const [quickCategory, setQuickCategory] = useState('all');

  // Active missing and recent alerts
  const urgentReports = reports.slice(0, 6);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateToSearch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans text-slate-900">
      {/* Geometric Balance Split Hero Section */}
      <section className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
        {/* Left / Main Hero Card */}
        <div className="flex-1 bg-white p-6 sm:p-10 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold w-fit mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Community-Driven Missing & Found Network</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4 tracking-tight">
            Bringing loved ones <br />
            <span className="text-blue-600">back home.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
            A verified platform to help families, guardians, and local communities report and locate
            missing children, vulnerable elderly citizens, and unidentified individuals safely.
          </p>

          {/* Large Action Buttons with Colored Glow Shadows */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onOpenReportMissing}
              className="flex-1 bg-rose-600 text-white py-3.5 sm:py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors shadow-lg shadow-rose-100 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Report Missing</span>
            </button>

            <button
              onClick={onOpenReportFound}
              className="flex-1 bg-emerald-600 text-white py-3.5 sm:py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 text-sm"
            >
              <PlusCircle className="w-5 h-5 shrink-0" />
              <span>Report Found</span>
            </button>

            <button
              onClick={onNavigateToSearch}
              className="bg-slate-100 text-slate-800 py-3.5 sm:py-4 px-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors text-sm border border-slate-200"
            >
              <Search className="w-4 h-4 text-slate-600" />
              <span>Search</span>
            </button>
          </div>

          {!isAuthenticated && (
            <p className="text-xs text-slate-500 mt-6">
              Guardian or search volunteer?{' '}
              <button
                onClick={() => onOpenAuth('register')}
                className="text-blue-600 font-bold underline hover:text-blue-800"
              >
                Create an account
              </button>{' '}
              to track cases and receive instant notifications.
            </p>
          )}
        </div>

        {/* Right / Dark Slate Quick Search Panel */}
        <div className="w-full lg:w-80 bg-slate-800 rounded-2xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-xs border border-slate-700/50">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight">Quick Search</h3>
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Find active missing or found person records across your area instantly.
            </p>

            <form onSubmit={handleQuickSearchSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Location / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Dhaka, New York, Park"
                    value={quickLocation}
                    onChange={(e) => setQuickLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-700 border-none rounded-lg text-sm text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Category
                </label>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-700 border-none rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="child">Children (0-12 yrs)</option>
                  <option value="teen">Teens (13-17 yrs)</option>
                  <option value="adult">Adults (18-59 yrs)</option>
                  <option value="elderly">Elderly / Senior (60+ yrs)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold text-sm text-white mt-2 transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Database</span>
              </button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
            <span>Verified Cases</span>
            <span className="font-bold text-emerald-400">{stats.total} Total Records</span>
          </div>
        </div>
      </section>

      {/* Balanced Metric Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Reports
            </span>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Submitted cases to date</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Active Missing
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600">{stats.missing}</div>
          <p className="text-[11px] text-slate-400 mt-1">Under active search</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Found Persons
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{stats.found}</div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting guardian pickup</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Safely Reunited
            </span>
            <span className="w-2 h-2 rounded-full bg-teal-500" />
          </div>
          <div className="text-3xl font-extrabold text-teal-600">{stats.reunited}</div>
          <p className="text-[11px] text-slate-400 mt-1">Resolved reunions</p>
        </div>
      </section>

      {/* Recent Reports Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Recent Reports
            </h2>
            <p className="text-xs text-slate-500">
              Latest missing and found alerts requiring community attention
            </p>
          </div>

          <button
            onClick={onNavigateToSearch}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
          >
            <span>View all active cases</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {urgentReports.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-500">
            No public cases currently found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {urgentReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onViewDetails={onViewDetails}
                onPrintPoster={onPrintPoster}
              />
            ))}
          </div>
        )}
      </section>

      {/* How Reunite Works (4 Step Flow) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            How Reunite Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A structured 4-step workflow to maximize the speed and safety of family reunifications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1.5">Submit Details</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provide clear photo, last seen/found location, exact timestamp, clothing details, and contact.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
            <div className="w-9 h-9 rounded-lg bg-purple-600 text-white font-bold text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1.5">Admin Review</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Admins verify report authenticity to prevent false alarms and coordinate with authorities.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white font-bold text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1.5">Public Broadcast</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Active alerts and printable flyers are instantly accessible to search volunteers and neighbors.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-3">
              4
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1.5">Safe Reunion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Finders contact the verified guardian directly, and the case status is updated to Reunited.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Callout Banner */}
      <section className="bg-slate-800 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700/50 shadow-xs">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">Need Immediate Emergency Help?</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            If a child or elderly individual with dementia has gone missing in the last 2 hours,
            contact national emergency police numbers immediately.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="tel:999"
            className="px-5 py-2.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 flex items-center gap-2 transition-colors shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Emergency (999 / 911)</span>
          </a>
          <a
            href="tel:109"
            className="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs border border-slate-600 flex items-center gap-2 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Child Helpline (109)</span>
          </a>
        </div>
      </section>
    </div>
  );
};
