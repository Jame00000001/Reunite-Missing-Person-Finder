import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { UserDashboardPage } from './pages/UserDashboardPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { PersonDetailModal } from './components/PersonDetailModal.tsx';
import { MissingPosterModal } from './components/MissingPosterModal.tsx';
import { ReportFormModal } from './components/ReportFormModal.tsx';
import { EditReportModal } from './components/EditReportModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { LocationNotificationModal } from './components/LocationNotificationModal.tsx';
import { FilterState } from './components/SearchFilters.tsx';
import { Report, DashboardStats, NearbyAlertSummary } from './types/index.ts';
import { api } from './services/api.ts';
import {
  getPublicReportsFromFirestore,
  getAllReportsAdminFromFirestore,
  getReportByIdFromFirestore,
} from './services/firestoreService.ts';

const initialFilters: FilterState = {
  search: '',
  type: 'all',
  gender: 'all',
  status: 'all',
  ageCategory: 'all',
  location: '',
};

const initialStats: DashboardStats = {
  total: 0,
  pending: 0,
  missing: 0,
  found: 0,
  reunited: 0,
  closed: 0,
  usersCount: 0,
};

function computeStatsFromReports(items: Report[]): DashboardStats {
  return {
    total: items.length,
    pending: items.filter((r) => r.status === 'Pending').length,
    missing: items.filter((r) => r.status === 'Missing').length,
    found: items.filter((r) => r.status === 'Found').length,
    reunited: items.filter((r) => r.status === 'Reunited').length,
    closed: items.filter((r) => r.status === 'Closed').length,
    usersCount: 0,
  };
}

function MainAppContent() {
  const { isAuthenticated, isAdmin } = useAuth();

  const [currentTab, setCurrentTab] = useState<'home' | 'search' | 'dashboard' | 'admin'>('home');

  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(true);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(0);
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);

  const [selectedDetailReport, setSelectedDetailReport] = useState<Report | null>(null);
  const [selectedPosterReport, setSelectedPosterReport] = useState<Report | null>(null);
  const [selectedEditReport, setSelectedEditReport] = useState<Report | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportModalType, setReportModalType] = useState<'missing' | 'found'>('missing');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [locationAlertsModalOpen, setLocationAlertsModalOpen] = useState<boolean>(false);

  const fetchReports = useCallback(async () => {
    setIsLoadingReports(true);
    try {
      const fetched = await getPublicReportsFromFirestore({
        search: filters.search || undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        gender: filters.gender !== 'all' ? filters.gender : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        location: filters.location || undefined,
      });
      setReports(fetched);
    } catch (err) {
      console.error('Error fetching reports from Firestore:', err);
    } finally {
      setIsLoadingReports(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const items = isAdmin
        ? await getAllReportsAdminFromFirestore()
        : await getPublicReportsFromFirestore();
      setStats(computeStatsFromReports(items));
    } catch (err) {
      console.error('Error computing Firestore stats:', err);
    }
  }, [isAdmin]);

  const fetchAlertUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadAlertsCount(0);
      return;
    }
    try {
      const res = await api.notifications.getHistory();
      if (res.success) {
        setUnreadAlertsCount(res.unreadCount);
      }
    } catch {
      // silent
    }
  }, [isAuthenticated]);

  const openReportById = useCallback(async (reportId: string) => {
    if (!reportId) return;
    try {
      const report = await getReportByIdFromFirestore(reportId);
      if (report) {
        setSelectedDetailReport(report);
        return;
      }
    } catch {
      // Fallback to server alert preview if report is still Pending and user received a nearby alert
    }

    try {
      const previewRes = await api.notifications.getAlertReportPreview(reportId);
      if (previewRes.success && previewRes.report) {
        setSelectedDetailReport(previewRes.report);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);

  useEffect(() => {
    fetchAlertUnreadCount();
  }, [fetchAlertUnreadCount]);

  // Handle deep-linking from push notification URL (?reportId=<id>) and Service Worker messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawReportId = params.get('reportId')?.trim();
    if (rawReportId) {
      openReportById(rawReportId);
      params.delete('reportId');
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`;
      window.history.replaceState({}, '', nextUrl);
    }

    if ('serviceWorker' in navigator) {
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data?.type === 'OPEN_REPORT' && event.data?.reportId) {
          openReportById(String(event.data.reportId));
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
    return undefined;
  }, [openReportById]);

  const handleOpenReportMissing = () => {
    if (!isAuthenticated) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    setReportModalType('missing');
    setReportModalOpen(true);
  };

  const handleOpenReportFound = () => {
    if (!isAuthenticated) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    setReportModalType('found');
    setReportModalOpen(true);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleReportSubmitted = (alertSummary?: NearbyAlertSummary) => {
    fetchReports();
    fetchStats();
    fetchAlertUnreadCount();
    if (alertSummary && alertSummary.matchedUsers > 0) {
      setSubmissionNotice(
        `Report submitted! ${alertSummary.matchedUsers} nearby registered user(s) within 10 km have been alerted.`
      );
      window.setTimeout(() => setSubmissionNotice(null), 8000);
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab as any)}
        onOpenReportMissing={handleOpenReportMissing}
        onOpenReportFound={handleOpenReportFound}
        onOpenAuth={handleOpenAuth}
        pendingCount={stats.pending}
        unreadAlertsCount={unreadAlertsCount}
        onOpenLocationAlerts={() => setLocationAlertsModalOpen(true)}
      />

      {submissionNotice && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 text-center shadow-sm">
          {submissionNotice}
        </div>
      )}

      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            reports={reports}
            stats={stats}
            onNavigateToSearch={() => setCurrentTab('search')}
            onOpenReportMissing={handleOpenReportMissing}
            onOpenReportFound={handleOpenReportFound}
            onViewDetails={(report) => setSelectedDetailReport(report)}
            onPrintPoster={(report) => setSelectedPosterReport(report)}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'search' && (
          <SearchPage
            reports={reports}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onViewDetails={(report) => setSelectedDetailReport(report)}
            onPrintPoster={(report) => setSelectedPosterReport(report)}
            onOpenReportMissing={handleOpenReportMissing}
            onOpenReportFound={handleOpenReportFound}
            isLoading={isLoadingReports}
          />
        )}

        {currentTab === 'dashboard' && (
          <UserDashboardPage
            onOpenReportMissing={handleOpenReportMissing}
            onOpenReportFound={handleOpenReportFound}
            onEditReport={(report) => setSelectedEditReport(report)}
            onViewDetails={(report) => setSelectedDetailReport(report)}
            onPrintPoster={(report) => setSelectedPosterReport(report)}
            onOpenAuth={handleOpenAuth}
            unreadAlertsCount={unreadAlertsCount}
            onOpenLocationAlerts={() => setLocationAlertsModalOpen(true)}
            onDataChanged={() => {
              fetchReports();
              fetchStats();
            }}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage
            onEditReport={(report) => setSelectedEditReport(report)}
            onViewDetails={(report) => setSelectedDetailReport(report)}
            onPrintPoster={(report) => setSelectedPosterReport(report)}
            onDataChanged={() => {
              fetchReports();
              fetchStats();
            }}
          />
        )}
      </main>

      <Footer />

      <PersonDetailModal
        report={selectedDetailReport}
        onClose={() => setSelectedDetailReport(null)}
        onPrintPoster={(report) => {
          setSelectedDetailReport(null);
          setSelectedPosterReport(report);
        }}
      />

      <MissingPosterModal
        report={selectedPosterReport}
        onClose={() => setSelectedPosterReport(null)}
      />

      <ReportFormModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        initialType={reportModalType}
        onSuccess={handleReportSubmitted}
      />

      <EditReportModal
        report={selectedEditReport}
        isOpen={!!selectedEditReport}
        onClose={() => setSelectedEditReport(null)}
        onSuccess={() => {
          fetchReports();
          fetchStats();
        }}
      />

      <LocationNotificationModal
        isOpen={locationAlertsModalOpen}
        onClose={() => setLocationAlertsModalOpen(false)}
        onOpenReportById={openReportById}
        onUnreadCountChange={setUnreadAlertsCount}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          fetchReports();
          fetchStats();
          fetchAlertUnreadCount();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
