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
import { FilterState } from './components/SearchFilters.tsx';
import { Report, DashboardStats } from './types/index.ts';
import { api } from './services/api.ts';

const initialFilters: FilterState = {
  search: '',
  type: 'all',
  gender: 'all',
  status: 'all',
  ageCategory: 'all',
  location: '',
};

const initialStats: DashboardStats = {
  total: 5,
  pending: 1,
  missing: 2,
  found: 1,
  reunited: 1,
  closed: 0,
  usersCount: 3,
};

function MainAppContent() {
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<'home' | 'search' | 'dashboard' | 'admin'>('home');

  // Data states
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(true);

  // Modals state
  const [selectedDetailReport, setSelectedDetailReport] = useState<Report | null>(null);
  const [selectedPosterReport, setSelectedPosterReport] = useState<Report | null>(null);
  const [selectedEditReport, setSelectedEditReport] = useState<Report | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportModalType, setReportModalType] = useState<'missing' | 'found'>('missing');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Load public reports and stats
  const fetchReports = useCallback(async () => {
    setIsLoadingReports(true);
    try {
      const res = await api.reports.getAll({
        search: filters.search || undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        gender: filters.gender !== 'all' ? filters.gender : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        location: filters.location || undefined,
      });
      if (res.success) {
        setReports(res.reports);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoadingReports(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.system.getHealth();
      if (res && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching health stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);

  // Open modal handlers
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

  const handleReportSubmitted = () => {
    fetchReports();
    fetchStats();
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab as any)}
        onOpenReportMissing={handleOpenReportMissing}
        onOpenReportFound={handleOpenReportFound}
        onOpenAuth={handleOpenAuth}
        pendingCount={stats.pending}
      />

      {/* Main App Page Body */}
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
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage
            onEditReport={(report) => setSelectedEditReport(report)}
            onViewDetails={(report) => setSelectedDetailReport(report)}
            onPrintPoster={(report) => setSelectedPosterReport(report)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Dialogs */}
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          fetchReports();
          fetchStats();
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
